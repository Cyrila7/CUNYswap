import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export default function LoginPage() {
  const { login, resetPassword, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/profile";

  const [form, setForm] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setVerifyMessage("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);
      if (user) {
        navigate(from, { replace: true });
      }
    } catch (e) {
      if (
        e.code === "auth/invalid-credential" ||
        e.code === "auth/wrong-password"
      ) {
        setErr("Invalid email or password.");
      } else if (e.code === "auth/email-not-verified") {
        setVerifyMessage(
          "We found your account, but your email isn’t verified yet. Please click the verification link we sent to your @cuny.edu email, then log in again."
        );
      } else {
        setErr(e.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErr("");
    setResetSent(false);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (e) {
      setErr("Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-10">
        {/* ICON + TITLE */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
            🔑
          </div>
          <p className="text-xs font-semibold tracking-[0.25em] text-pink-500 mb-1">
            CUNYswap
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Log in to continue trading with students.
          </p>
        </div>

        {/* LOGIN FORM */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@login.cuny.edu"
              value={form.email}
              onChange={onChange}
              autoComplete="username"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />

            {/* Forgot password link */}
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="text-xs text-pink-500 mt-1 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* ERROR */}
          {err && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {err}
            </p>
          )}

          {/* VERIFY MESSAGE */}
          {verifyMessage && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl px-4 py-3 mt-3 text-center">
              <p className="text-sm font-medium text-yellow-700">
                {verifyMessage}
              </p>
            </div>
          )}

          {/* RESEND VERIFICATION BUTTON */}
          {verifyMessage && (
            <button
              type="button"
              onClick={async () => {
                setErr("");

                try {
                  // Re-auth just for resend
                  await resendVerification(
                    form.email,
                    form.password
                  );

                  setVerifyMessage(
                    "We've resent the verification link to your @cuny.edu email. Please check your inbox."
                  );
                } catch (err) {
                  console.error(err);
                  setErr(err.message || "Could not resend verification email.");
                    }
                  }}
                  className="mt-3 w-full rounded-xl border border-yellow-300 text-yellow-700 font-semibold py-2.5 text-sm hover:bg-yellow-100 transition"
                >
                  Resend verification email
                </button>
          )}


          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2.5 text-sm shadow-md hover:shadow-lg transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* RESET PASSWORD SECTION */}
        {showReset && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Reset your password
            </h3>

            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your school email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              <button className="w-full rounded-xl bg-purple-500 text-white py-2.5 text-sm font-semibold hover:bg-purple-600 transition">
                Send reset link
              </button>

              {resetSent && (
                <p className="text-xs text-green-600 mt-1">
                  ✔ If an account exists for that email, a reset link has been
                  sent. Check your inbox and spam folder.
                </p>
              )}
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-pink-500 font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}


// I revamped the login page with a fresh, modern design using Tailwind CSS
// The layout is centered with a soft gradient background for a welcoming feel
// The form container has rounded corners and a subtle shadow for depth
// Input fields are styled with focus effects for better usability
// The login button features a vibrant gradient and hover effects to enhance interactivity
// Added a password reset section that appears when the user clicks "Forgot password?"
// Overall, the design aims to be clean, user-friendly, and visually appealing
// this for git later 

// NOV-20-2025
// added autocomplete attributes to login form fields for better usability
// i added a verify message state to inform unverified users to check their email for verification link

// NOV-21-2025
// fixed login navigation issue where verified users werent being redirected properly after login
// improved error handling to differentiate between invalid credentials and unverified email scenarios
// these changes enhance the overall user experience during the login process.

// NOV-22-2025
// added resend verification email button for unverified users on login page
// this allows users to easily request a new verification email if they didn't receive the first one
// improves user experience by providing a clear path to verify their account 

// NOV-23-2025
// updated resend verification logic to re-authenticate user before sending email
// ensures that the verification email is sent to the correct user and enhances security
// improved error handling during resend process to provide clearer feedback to users
//JESUS CHRIST CODING NOT FOR THE WEAK . HERH IM TIRED RUFF MABR3