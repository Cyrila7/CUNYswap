import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import open from "open";

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// ✅ CORS middleware - Allow requests from React app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const PORT = process.env.PORT || 3000;

// SQLite setup
const sqlite = sqlite3.verbose();
const db = new sqlite.Database("./users.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite database.");
});

// this for tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      verified INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT,
      code TEXT,
      expires INTEGER
    )
  `);
});

// Nodemailer Gmail transporter made my life sooooo easyyyyy 😍
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Helper function
const generateCode = () => Math.floor(100000 + Math.random() * 900000);

// Routes
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith("@gmail.com") && !email.endsWith("@login.cuny.edu")) {
    return res.status(400).json({ message: "Only login.cuny.edu emails allowed." });
  }

  db.run(
    `INSERT OR IGNORE INTO accounts (email, password) VALUES (?, ?)`,
    [email, password],
    (err) => {
      if (err) return res.status(500).json({ message: "Database error" });

      const code = generateCode();
      const expires = Date.now() + 10 * 60 * 1000; // 10 min

      db.run(
        `INSERT INTO tokens (email, code, expires) VALUES (?, ?, ?)`,
        [email, code, expires],
        async (err) => {
          if (err) return res.status(500).json({ message: "Database error" });

          try {
            await transporter.sendMail({
              from: `"CUNYswap Email Verification" <${process.env.GMAIL_USER}>`,
              to: email,   // Sends TO the CUNY email
              subject: "Your CUNYswap Verification Code",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #ec4899;">🎓 CUNYswap Email Verification</h2>
                  <p>Your verification code is:</p>
                  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #ec4899; font-size: 32px; margin: 0;">${code}</h1>
                  </div>
                  <p>This code expires in <strong>10 minutes</strong>.</p>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If you didn't request this code, you can safely ignore this email.
                  </p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                    CUNYswap - Made By Students for Students
                  </p>
                </div>
              `
            });

            res.json({ message: "Verification email sent!" });
          } catch (err) {
            console.error("Email send error:", err);
            res.status(500).json({ message: "Error sending email" });
          }
        }
      );
    }
  );
});

app.post("/verify", (req, res) => {
  const { email, code } = req.body;

  db.get(
    `SELECT * FROM tokens WHERE email = ? AND code = ?`,
    [email, code],
    (err, tokenRow) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (!tokenRow) return res.status(400).json({ message: "Invalid code" });
      if (Date.now() > tokenRow.expires) return res.status(400).json({ message: "Code expired" });

      db.run(`UPDATE accounts SET verified = 1 WHERE email = ?`, [email], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });

        db.run(`DELETE FROM tokens WHERE id = ?`, [tokenRow.id]);

        res.json({ message: "Email verified successfully!" });
      });
    }
  );
});

// 📧 NEW: Send message notification emails
app.post("/notify-message", async (req, res) => {
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
    return res.status(400).json({ message: 'Missing required fields' });
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

    res.json({ success: true, message: 'Notification sent' });
    
  } catch (error) {
    console.error('📧 Email notification error:', error);
    res.status(500).json({ 
      message: 'Failed to send notification',
      error: error.message 
    });
  }
});

// 🚨 Report notification endpoint JUST ADDEDDDDD
app.post('/api/notify-report', async (req, res) => {
  const { 
    itemId,
    itemTitle,
    sellerId,
    sellerName,
    reportedBy,
    reportedByName,
    reason,
    details,
    timestamp
  } = req.body;

  // Validate required fields
  if (!itemId || !itemTitle || !reason) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send notification email to admin
    await transporter.sendMail({
      from: `"CUNYswap Reports" <${process.env.GMAIL_USER}>`,
      to: "cunyswap@gmail.com",
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

    res.json({ success: true, message: 'Report notification sent to admin' });
    
  } catch (error) {
    console.error('🚨 Report notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send notification',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;
  console.log(`🚀 Server running → ${url}`);
  console.log(`📧 Gmail configured: ${process.env.GMAIL_USER ? '✅' : '❌'}`);
  try {
    await open(url);
  } catch {}
});
