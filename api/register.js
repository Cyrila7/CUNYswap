import nodemailer from "nodemailer";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  if (!email.endsWith('@login.cuny.edu')) {
    return res.status(400).json({ message: 'Only login.cuny.edu emails allowed.' });
  }

  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code in Firestore
    await db.collection('verificationCodes').doc(email).set({
      code,
      expires,
      password,
      createdAt: Date.now()
    });

    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    // Send email
    await transporter.sendMail({
      from: `"CUNYswap Email Verification" <${process.env.GMAIL_USER}>`,
      to: email,
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

    console.log(`✅ Verification code sent to ${email}`);
    return res.status(200).json({ message: "Verification email sent!" });

  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({ message: "Error sending email" });
  }
}
