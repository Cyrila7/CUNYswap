// 🚨 API endpoint to send email notifications to admin when a report is submitted
// Sends to cunyswap@gmail.com for review

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Gmail transporter using the same setup as other notification emails
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
    itemId,              // ID of the reported item
    itemTitle,           // Title of the reported item
    sellerId,            // User ID of the seller
    sellerName,          // Name of the seller
    reportedBy,          // User ID of the reporter
    reportedByName,      // Name of the reporter
    reason,              // Report reason
    details,             // Additional details
    timestamp            // When the report was submitted
  } = req.body;

  // Validate required fields
  if (!itemId || !itemTitle || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send notification email to admin
    await transporter.sendMail({
      from: `"CUNYswap Reports" <${process.env.GMAIL_USER}>`,
      to: "cunyswap@gmail.com", // Admin email
      subject: `🚨 New Report: ${reason} - "${itemTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fef2f2;">
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-left: 6px solid #dc2626;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; font-size: 28px; margin: 0;">🚨 CUNYswap Report</h1>
            </div>

            <!-- Alert Box -->
            <div style="background: #fee2e2; border: 2px solid #fca5a5; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <p style="color: #991b1b; margin: 0; font-weight: bold; font-size: 16px;">
                ⚠️ A listing has been reported and requires review
              </p>
            </div>

            <!-- Report Details -->
            <h2 style="color: #111827; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              Report Details
            </h2>
            
            <table style="width: 100%; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: bold; width: 140px;">Reason:</td>
                <td style="padding: 10px 0; color: #111827;">
                  <span style="background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 6px; font-weight: bold;">
                    ${reason.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Item Title:</td>
                <td style="padding: 10px 0; color: #111827; font-weight: bold;">${itemTitle}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Item ID:</td>
                <td style="padding: 10px 0; color: #111827; font-family: monospace; font-size: 12px;">${itemId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Seller:</td>
                <td style="padding: 10px 0; color: #111827;">${sellerName || 'Unknown'} <span style="color: #9ca3af; font-size: 12px;">(${sellerId})</span></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Reported By:</td>
                <td style="padding: 10px 0; color: #111827;">${reportedByName || 'Anonymous'} <span style="color: #9ca3af; font-size: 12px;">(${reportedBy})</span></td>
              </tr>
              ${timestamp ? `
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Submitted:</td>
                <td style="padding: 10px 0; color: #111827;">${new Date(timestamp).toLocaleString()}</td>
              </tr>
              ` : ''}
            </table>

            <!-- Additional Details -->
            ${details ? `
              <h3 style="color: #111827; margin-top: 25px; margin-bottom: 10px;">Additional Details:</h3>
              <div style="background: #f9fafb; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 6px;">
                <p style="color: #374151; margin: 0; line-height: 1.6;">
                  "${details}"
                </p>
              </div>
            ` : ''}

            <!-- Action Buttons -->
            <div style="text-align: center; margin: 35px 0 20px 0;">
              <a href="${process.env.VITE_APP_URL || 'http://localhost:5173'}/item/${itemId}" 
                 style="display: inline-block; background: linear-gradient(to right, #dc2626, #991b1b); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 5px;">
                👁️ View Listing
              </a>
              
              <a href="https://console.firebase.google.com" 
                 style="display: inline-block; background: #4b5563; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; margin: 5px;">
                🔥 Open Firebase
              </a>
            </div>

            <!-- Next Steps -->
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 25px;">
              <h3 style="color: #111827; margin-top: 0; margin-bottom: 15px; font-size: 16px;">📋 Review Checklist:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Review the listing content and images</li>
                <li>Check seller's profile and history</li>
                <li>Verify if the report is valid</li>
                <li>Take action: delete listing, warn user, or dismiss</li>
                <li>Document decision in Firebase</li>
              </ul>
            </div>

            <!-- Footer -->
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 5px 0;">
              CUNYswap Admin Notifications
            </p>
            
            <p style="color: #9ca3af; font-size: 11px; text-align: center; margin: 5px 0;">
              This report is also stored in Firestore under the "reports" collection
            </p>
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, message: 'Report notification sent to admin' });
    
  } catch (error) {
    console.error('❌ Failed to send report notification:', error);
    return res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
}
