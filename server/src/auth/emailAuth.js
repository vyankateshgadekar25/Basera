const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

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
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    return { success: false, error: 'BREVO_API_KEY / BREVO_SENDER_EMAIL not configured' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Basera', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email }],
        subject: `Basera sign-in code: ${otp}`,
        htmlContent: buildHtml(otp, name),
        textContent: `Your Basera sign-in code is ${otp}. It expires in 10 minutes.`,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Brevo ${response.status}: ${errBody}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Brevo send error:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmailOTP };
