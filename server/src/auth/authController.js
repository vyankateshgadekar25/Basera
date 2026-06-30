const { query } = require('../db');
const jwt = require('jsonwebtoken');
const { sendEmailOTP } = require('./emailAuth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * The `users.phone` column is overloaded to also hold emails — the column is
 * UNIQUE, NOT NULL, indexed. We treat it as a generic identifier. A future
 * migration can rename it to `identifier` without breaking the API contract.
 */
async function sendOTP(req, res) {
  try {
    const { email, role, name } = req.body;

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }
    const normalized = email.trim().toLowerCase();
    if (!role || !['owner', 'renter'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "owner" or "renter".' });
    }

    let user = await query('SELECT * FROM users WHERE phone = $1', [normalized]);
    if (user.rows.length === 0) {
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required for new accounts.' });
      }
      await query(
        'INSERT INTO users (name, phone, role, is_verified) VALUES ($1, $2, $3, false)',
        [name.trim(), normalized, role]
      );
      user = await query('SELECT * FROM users WHERE phone = $1', [normalized]);
    }

    // Invalidate any in-flight codes
    await query('UPDATE otp_codes SET used = true WHERE phone = $1 AND used = false', [normalized]);

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await query(
      'INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3)',
      [normalized, otp, expiresAt]
    );

    const isDev = process.env.NODE_ENV !== 'production';
    const response = { message: 'Sign-in code sent to your email.', delivery: 'pending' };

    const result = await sendEmailOTP(normalized, otp, user.rows[0]?.name || name);
    if (result.success) {
      response.delivery = 'email';
    } else {
      response.delivery = isDev ? 'console' : 'failed';
      if (!isDev) {
        console.error('Email delivery failed:', result.error);
        return res.status(502).json({ error: 'Could not deliver email. Try again in a minute.' });
      }
      console.warn(`[DEV] Email not configured. OTP for ${normalized}: ${otp}`);
    }

    if (isDev) response.otp_debug = otp;
    res.json(response);
  } catch (err) {
    console.error('sendOTP error:', err);
    res.status(500).json({ error: 'Failed to send sign-in code.' });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required.' });
    }
    const normalized = String(email).trim().toLowerCase();

    const otpResult = await query(
      `SELECT * FROM otp_codes
       WHERE phone = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalized, code]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }

    await query('UPDATE otp_codes SET used = true WHERE id = $1', [otpResult.rows[0].id]);
    await query('UPDATE users SET is_verified = true WHERE phone = $1', [normalized]);

    const userResult = await query(
      'SELECT id, name, phone AS email, role FROM users WHERE phone = $1',
      [normalized]
    );
    const user = userResult.rows[0];

    const token = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json({ error: 'Failed to verify code.' });
  }
}

module.exports = { sendOTP, verifyOTP };
