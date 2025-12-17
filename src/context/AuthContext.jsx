import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const Authcontext = createContext(null);
const ALLOWED_DOMAIN = "login.cuny.edu";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false); // ✅ Flag to prevent auth check during signup

  // ✅ Track auth state + check Firestore verification
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    // ✅ Skip auth check if we're in the middle of signup
    if (isSigningUp) {
      console.log("⏭️ Skipping auth check during signup");
      return;
    }

    if (!firebaseUser) {
      setUser(null);
      setInitializing(false);
      return;
    }

    const email = (firebaseUser.email || "").toLowerCase();
    const allowedDomain = email.endsWith(`@${ALLOWED_DOMAIN}`);

    // ❌ Wrong domain → kill session
    if (!allowedDomain) {
      await signOut(auth);
      setUser(null);
      setInitializing(false);
      return;
    }

    // ✅ Check Firestore emailVerified
    try {
      // ✅ Small delay to ensure we get fresh data
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      console.log("DEBUG Firestore verification status:", userSnap.exists() ? userSnap.data().emailVerified : "doc doesn't exist");

      // ✅ If user doc doesn't exist yet (race condition during signup), just sign out
      if (!userSnap.exists()) {
        console.log("⏳ User doc doesn't exist yet - user needs to verify email first");
        await signOut(auth);
        setUser(null);
        setInitializing(false);
        return;
      }
      
      // Check if email is verified in Firestore
      if (userSnap.data().emailVerified !== true) {
        console.log("❌ Email not verified in Firestore - user needs to verify");
        await signOut(auth);
        setUser(null);
        setInitializing(false);
        return;
      }

      // ✅ Verified in Firestore + correct domain
      console.log("✅ User verified, setting in context");
      setUser(firebaseUser);
      setInitializing(false);
    } catch (err) {
      console.error("❌ Error fetching user doc:", err);
      // If it's a permission error, just silently sign out
      // (this happens during signup before user is verified)
      if (err.code === 'permission-denied' || err.message.includes('permissions')) {
        console.log("⚠️ Permission denied - user not verified yet");
      }
      await signOut(auth);
      setUser(null);
      setInitializing(false);
    }
  });

  return () => unsubscribe();
}, [isSigningUp]);

  const resetPassword = (email) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: false,
    };

    return sendPasswordResetEmail(auth, email, actionCodeSettings);
  };

  const signup = async (email, password, displayName, schoolYear, graduationYear) => {
  const lowerEmail = (email || "").toLowerCase();
  if (!lowerEmail.endsWith(`@${ALLOWED_DOMAIN}`)) {
    throw new Error(`Please use a @${ALLOWED_DOMAIN} email address.`);
  }

  // ✅ Set flag to prevent onAuthStateChanged from interfering
  setIsSigningUp(true);

  try {
    // 1. Send verification code via API (works locally and on Vercel)
    const apiUrl = import.meta.env.PROD 
      ? `${window.location.origin}/register`
      : "http://localhost:3000/register";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lowerEmail, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to send verification code");
    }

    console.log("✅ Verification code sent successfully via Gmail");
    
    // Return success - signup page will show verification code input
    return { success: true, message: data.message, email: lowerEmail };
  } catch (error) {
    console.error("❌ Signup error:", error);
    throw error;
  } finally {
    // ✅ Always reset the flag
    setIsSigningUp(false);
  }
};

// ✅ New function to verify the 6-digit code
const verifyCode = async (email, code, password, displayName, schoolYear, graduationYear) => {
  const lowerEmail = (email || "").toLowerCase();
  
  try {
    // 1. Verify code with API (works locally and on Vercel)
    const apiUrl = import.meta.env.PROD 
      ? `${window.location.origin}/verify`
      : "http://localhost:3000/verify";
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: lowerEmail, code }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || "Invalid or expired code");
    }

    console.log("✅ Email verified successfully!");

    // 2. Now create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, lowerEmail, password);

    // 3. Set display name
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    // 4. Create Firestore user doc with emailVerified: true
    await setDoc(doc(db, "users", cred.user.uid), {
      email: lowerEmail,
      displayName: displayName || null,
      schoolYear: schoolYear || "",
      graduationYear: graduationYear || "",
      emailVerified: true, // ✅ Already verified via code
      createdAt: serverTimestamp(),
    });

    console.log("✅ Firebase user created successfully");
    
    // 5. User is now logged in and verified
    setUser(cred.user);
    return cred.user;
  } catch (error) {
    console.error("❌ Verification error:", error);
    throw error;
  }
};

  const login = async (email, password) => {
    const lowerEmail = (email || "").toLowerCase();
    
    // 1. Sign in
    const cred = await signInWithEmailAndPassword(auth, lowerEmail, password);

    // 2. Check domain
    const allowedDomain = lowerEmail.endsWith(`@${ALLOWED_DOMAIN}`);
    if (!allowedDomain) {
      await signOut(auth);
      const err = new Error(`Please use a @${ALLOWED_DOMAIN} email address.`);
      err.code = "auth/invalid-domain";
      throw err;
    }

    // 3. Check Firestore verification (SOURCE OF TRUTH)
    // ✅ Add a small delay to ensure Firestore has latest data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userDocRef = doc(db, "users", cred.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("User profile not found. Please sign up again.");
    }

    const userData = userDoc.data();
    console.log("DEBUG login - Firestore verified:", userData.emailVerified);

    // Check if not verified
    if (!userData.emailVerified) {
      await signOut(auth);
      const err = new Error(
        "Please verify your CUNY email first. Check your inbox for the verification link."
      );
      err.code = "auth/email-not-verified";
      throw err;
    }

    // ✅ Verified in Firestore - good to go
    // Set user immediately so navigation works
    console.log("✅ Login successful - setting user in context");
    setUser(cred.user);
    return cred.user;
  };

  const logout = () => signOut(auth);

  // ✅ Function to resend verification (called from LoginPage)
  const resendVerification = async (email, password) => {
    const lowerEmail = (email || "").toLowerCase();
    
    // Sign in temporarily
    const cred = await signInWithEmailAndPassword(auth, lowerEmail, password);
    
    // Check if already verified
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    if (userDoc.exists() && userDoc.data().emailVerified) {
      await signOut(auth);
      throw new Error("Your email is already verified. Try logging in again.");
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    
    // Update user doc
    await setDoc(doc(db, "users", cred.user.uid), {
      verificationToken,
    }, { merge: true });

    // Update token collection
    await setDoc(doc(db, "verificationTokens", verificationToken), {
      uid: cred.user.uid,
      email: lowerEmail,
      createdAt: serverTimestamp(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Send email
    await sendCustomVerificationEmail(lowerEmail, verificationToken);

    // Sign out
    await signOut(auth);
  };

  return (
    <Authcontext.Provider
      value={{
        signup,
        verifyCode,
        login,
        logout,
        user,
        resetPassword,
        resendVerification,
        initializing,
        authMessage,
        setAuthMessage,
      }}
    >
      {children}
    </Authcontext.Provider>
  );
}

export const useAuth = () => useContext(Authcontext);

// ✅ Helper: Generate random verification token
function generateVerificationToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ✅ Helper: Send custom verification email
// You'll need to implement this with a backend service
// Options: SendGrid, Resend, Firebase Functions, etc.
async function sendCustomVerificationEmail(email, token) {
  const verificationUrl = `${window.location.origin}/verify-email?token=${token}`;
  
  console.log("📧 Sending verification email to:", email);
  console.log("🔗 Verification URL:", verificationUrl);
  
  try {
    const response = await fetch("/api/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, verificationUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send email");
    }

    console.log("✅ Verification email sent successfully via Resend");
    return await response.json();
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
    throw error;
  }
}