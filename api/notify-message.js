// 📧 API endpoint to send email notifications when someone receives a message
// This uses the same Gmail setup as your verification emails

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Same Gmail transporter you use for verification codes
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    recipientEmail,      // Email of person receiving the notification
    recipientName,       // Name of person receiving notification
    senderName,          // Name of person who sent the message
    messagePreview,      // First few words of the message
    itemTitle,           // The item being discussed
    conversationId       // Link back to the conversation
  } = req.body;

  // Validate required fields
  if (!recipientEmail || !senderName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send notification email
    await transporter.sendMail({
      from: `"CUNYswap Notifications" <${process.env.GMAIL_USER}>`,
      to: recipientEmail,
      subject: `💬 New message from ${senderName} on CUNYswap`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ec4899; font-size: 28px; margin: 0;">🎓 CUNYswap</h1>
            </div>

            <!-- Main Content -->
            <h2 style="color: #111827; margin-bottom: 15px;">
              Hey ${recipientName || 'there'}! 👋
            </h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              <strong>${senderName}</strong> just sent you a message${itemTitle ? ` about <strong>${itemTitle}</strong>` : ''}:
            </p>

            <!-- Message Preview Box -->
            ${messagePreview ? `
              <div style="background: #f3f4f6; border-left: 4px solid #ec4899; padding: 15px; margin: 20px 0; border-radius: 6px;">
                <p style="color: #374151; margin: 0; font-style: italic;">
                  "${messagePreview}"
                </p>
              </div>
            ` : ''}

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}/messages${conversationId ? `/${conversationId}` : ''}" 
                 style="display: inline-block; background: linear-gradient(to right, #ec4899, #a855f7); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                💬 View Message
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">
              Reply quickly to keep the conversation going and complete your trade!
            </p>

            <!-- Footer -->
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 5px 0;">
              CUNYswap - Made By Students for Students
            </p>
            
            <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 5px 0;">
              You're receiving this because you have an account on CUNYswap.
            </p>
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, message: 'Notification sent' });
    
  } catch (error) {
    console.error('📧 Email notification error:', error);
    return res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
}
