import crypto from "crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin 
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

const hashCode = (code) => crypto.createHash('sha256').update(code.toString()).digest('hex');

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

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code required' });
  }

  try {
    // Get code from Firestore
    const docRef = db.collection('verificationCodes').doc(email);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: 'Invalid code or email not found' });
    }

    const storedData = doc.data();

    if (Date.now() > storedData.expires) {
      await docRef.delete();
      return res.status(400).json({ message: 'Code expired' });
    }

    // Check attempts
    if (storedData.attempts >= 5) {
      return res.status(403).json({ message: 'Too many failed attempts. Please request a new code.' });
    }

    const codeHash = hashCode(code);

    if (storedData.codeHash !== codeHash) {
      // Increment attempts
      await docRef.update({ attempts: (storedData.attempts || 0) + 1 });
      return res.status(400).json({ message: 'Invalid code' });
    }

    // Code is valid - clean up
    await docRef.delete();

    console.log(`✅ Email verified successfully for ${email}`);
    return res.status(200).json({ message: 'Email verified successfully!' });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ message: 'Verification failed' });
  }
}
