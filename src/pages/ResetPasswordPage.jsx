
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const oobCode = params.get("oobCode");

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPass || !confirmPass) {
      setError("Please fill in both password fields");
      return;
    }

    if (newPass !== confirmPass) {
      setError("Passwords do not match");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPass);
      setSuccess("✅ Password updated successfully. Redirecting...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError("Invalid or expired reset link. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-10">

        <h1 className="text-2xl font-bold text-center mb-4">
          Reset your password
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 text-sm p-3 rounded-xl mb-4">
            {success}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              className="w-full rounded-xl border px-3 py-2.5"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full rounded-xl border px-3 py-2.5"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />

            <button className="w-full rounded-xl bg-pink-500 text-white py-2.5">
              Reset password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}



// --- IGNORE ---
// ----Dont delete above this line / CODE. EVERYTHING WORKS----