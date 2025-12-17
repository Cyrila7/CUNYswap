import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyEmailPage() {
  const query = useQuery();
  const navigate = useNavigate();

  const [status, setStatus] = useState("checking"); // "checking" | "success" | "error"
  const [message, setMessage] = useState("Checking your verification link…");
  const [hasVerified, setHasVerified] = useState(false); // ✅ Prevent duplicate calls

  useEffect(() => {
    // ✅ Only run once
    if (hasVerified) return;

    const token = query.get("token");

    if (!token) {
      setStatus("error");
      setMessage("This verification link is invalid. Please request a new one.");
      return;
    }

    // Call your backend to verify the token and mark Firestore emailVerified: true
    (async () => {
      try {
        setHasVerified(true); // ✅ Mark as called

        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setStatus("error");
          setMessage(
            data.error ||
              "This verification link is invalid or has expired. Please request a new one."
          );
          return;
        }

        // Success!
        setStatus("success");
        setMessage(
          "Your CUNY email has been verified. You can now log in to CUNYswap."
        );
      } catch (err) {
        console.error("Error verifying email:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again in a moment.");
      }
    })();
  }, [query, hasVerified]); // ✅ Added hasVerified to dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl px-8 py-10 text-center">
        {/* Icon */}
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          ✉️
        </div>

        <p className="text-xs font-semibold tracking-[0.25em] text-pink-500 mb-1">
          CUNYSWAP
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Email verification
        </h1>

        {status === "checking" && (
          <p className="text-sm text-gray-600 mt-3">
            Checking your verification link…
          </p>
        )}

        {status !== "checking" && (
          <p className="text-sm text-gray-700 mt-3">{message}</p>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2.5 text-sm shadow-md hover:shadow-lg transition"
          >
            Go to login
          </button>

        <Link
            to="/signup"
            className="text-xs text-gray-500 hover:text-pink-500 transition"
          >
            Need a new account? Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
