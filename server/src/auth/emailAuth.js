const nodemailer = require('nodemailer');

let transporterPromise = null;

function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  if (!transporterPromise) {
    transporterPromise = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''),
      },
    });
  }
  return transporterPromise;
}

function buildHtml(otp, name) {
  const appUrl = process.env.PUBLIC_APP_URL || '#';
  return `
  <div style="background:#fbf8f2;padding:40px 16px;font-family:'Helvetica Neue',Arial,sans-serif;color:#0e1b1a;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="520" style="max-width:520px;background:#ffffff;border:1px solid rgba(14,27,26,0.06);border-radius:20px;overflow:hidden;">
      <tr>
        <td style="background:#0e1b1a;padding:22px 28px;color:#fbf8f2;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="display:inline-block;width:30px;height:30px;border-radius:8px;background:#1ea97c;text-align:center;line-height:30px;color:#fff;font-weight:700;font-family:Georgia,serif;">B</span>
            <span style="font-family:Georgia,serif;font-size:18px;font-weight:600;letter-spacing:-0.01em;">Basera</span>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 8px 32px;">
          <h1 style="font-family:Georgia,serif;font-size:24px;line-height:1.25;margin:0 0 6px;color:#0e1b1a;font-weight:600;">Your sign-in code</h1>
          <p style="margin:0;color:rgba(14,27,26,0.6);font-size:14px;">${name ? `Hi ${name.split(' ')[0]}, ` : ''}use this code to finish logging in to Basera.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:18px 32px 8px 32px;">
          <div style="background:#eefcf6;border:1px solid #d4f6e7;border-radius:14px;padding:22px;text-align:center;">
            <div style="font-family:'Courier New',monospace;font-size:34px;letter-spacing:14px;font-weight:700;color:#106d53;">${otp}</div>
          </div>
          <p style="margin:14px 0 0;font-size:13px;color:rgba(14,27,26,0.55);">This code expires in <strong style="color:#0e1b1a;">10 minutes</strong>. Don't share it with anyone — Basera staff will never ask for it.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 32px 32px;">
          <a href="${appUrl}" style="display:inline-block;background:#138a66;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:999px;font-size:14px;font-weight:600;">Open Basera</a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px;background:#fbf8f2;border-top:1px solid rgba(14,27,26,0.06);font-size:12px;color:rgba(14,27,26,0.5);">
          If you didn't try to sign in, you can safely ignore this email.
        </td>
      </tr>
    </table>
  </div>`;
}

async function sendEmailOTP(email, otp, name) {
  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'GMAIL_USER / GMAIL_APP_PASSWORD not configured' };
  }
  try {
    await transporter.sendMail({
      from: `"Basera" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Basera sign-in code: ${otp}`,
      text: `Your Basera sign-in code is ${otp}. It expires in 10 minutes.`,
      html: buildHtml(otp, name),
    });
    return { success: true };
  } catch (error) {
    console.error('Gmail send error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmailOTP };
