{/* 
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  try {
    // 1. Look up the token in Firestore
    const tokenRef = db.collection("emailVerificationTokens").doc(token);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      return res.status(400).json({ 
        error: "Invalid or expired verification link. Please request a new one." 
      });
    }

    const tokenData = tokenDoc.data();

    // 2. Check if token was already used
    if (tokenData.used === true) {
      return res.status(400).json({ 
        error: "This verification link has already been used. Try logging in." 
      });
    }

    // 3. Update the user document to mark email as verified
    const userRef = db.collection("users").doc(tokenData.uid);
    await userRef.update({
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
    });

    // 4. Mark the token as used (for audit trail)
    await tokenRef.update({
      used: true,
      usedAt: new Date().toISOString(),
    });

    // 5. Success!
    return res.status(200).json({ 
      success: true,
      message: "Email verified successfully" 
    });

  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ 
      error: "Something went wrong. Please try again." 
    });
  }
}

*/}