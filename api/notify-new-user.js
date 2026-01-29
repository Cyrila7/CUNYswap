import nodemailer from "nodemailer";

/**
 * API endpoint to notify admin when a new user joins CUNYswap
 * This gets called after successful email verification
 */
export default async function handler(req, res) {
  // Enable CORS
  const origin = process.env.APP_ORIGIN || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userEmail, userName, timestamp } = req.body;

  if (!userEmail) {
    return res.status(400).json({ message: 'User email required' });
  }

  try {
    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Your admin email (the email that will receive notifications)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER;

    console.log('📧 Sending new user notification to admin:', adminEmail);

    // Format the timestamp
    const joinDate = timestamp ? new Date(timestamp).toLocaleString() : new Date().toLocaleString();

    // Send notification email to admin
    await transporter.sendMail({
      from: `"CUNYswap Notifications" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject: "🎉 New User Joined CUNYswap!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #ec4899; margin-top: 0;">🎉 New User Alert!</h2>
            
            <div style="background: #fdf2f8; border-left: 4px solid #ec4899; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; font-size: 16px;">
                <strong>Email:</strong> ${userEmail}
              </p>
              <p style="margin: 5px 0; font-size: 16px;">
                <strong>Name:</strong> ${userName || 'Not provided'}
              </p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">
                <strong>Joined:</strong> ${joinDate}
              </p>
            </div>

            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #4b5563;">
                🔔 You can track all users in the <a href="https://cunyswap.app/stats" style="color: #ec4899; text-decoration: none;">Stats Dashboard</a>
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-bottom: 0;">
              CUNYswap Auto-Notification System
            </p>
          </div>
        </div>
      `
    });

    console.log(`✅ Admin notification sent for new user: ${userEmail}`);
    return res.status(200).json({ message: "Admin notified successfully" });

  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
    // Don't fail the registration if notification fails
    return res.status(200).json({ 
      message: "Registration successful but notification failed",
      error: error.message 
    });
  }
}
