{/*}
import { Resend } from "resend";


const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, verificationUrl } = req.body;

  // Validate inputs
  if (!email || !verificationUrl) {
    return res.status(400).json({ error: 'Missing email or verificationUrl' });
  }

  try {
    // Send email using Resend
    await resend.emails.send({
      from: 'SUNYswap <noreply@sunyswap.app>',
      to: email,
      subject: '🔑 Verify your SUNYswap email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background: #f9fafb; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .logo { text-align: center; font-size: 32px; font-weight: bold; color: #ec4899; margin-bottom: 20px; }
            .button { display: inline-block; background: linear-gradient(to right, #ec4899, #a855f7); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🎓 SUNYswap</div>
            <h2 style="color: #111827;">Welcome to SUNYswap!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thanks for signing up! Click the button below to verify your Buffalo State email and start trading with students.
            </p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">
                Verify Email
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
            <div class="footer">
              <p>SUNYswap - Buffalo State University Marketplace</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
*/}