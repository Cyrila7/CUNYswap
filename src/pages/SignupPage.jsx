import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const { signup, verifyCode } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    graduationYear: "",
    schoolYear: "",
    campus: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false); // ✅ Show verification code input
  const [verificationCode, setVerificationCode] = useState(""); // ✅ Store the 6-digit code
  const [signupComplete, setSignupComplete] = useState(false); // ✅ Track full completion
  const [resendLoading, setResendLoading] = useState(false); // ✅ Track resend loading state

  const BUFF_STATE_DOMAIN = "login.cuny.edu";

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.email.toLowerCase().endsWith(`@${BUFF_STATE_DOMAIN}`)) {
      setError(`Please use a valid ${BUFF_STATE_DOMAIN} email address.`);
      return;
    }

    if (!form.campus) {
      setError("Please select your CUNY campus.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Send verification code via Gmail
      await signup(
        form.email, 
        form.password, 
        form.name, 
        form.schoolYear, 
        form.graduationYear,
        form.campus
      );
      
      // ✅ Show verification code input
      setShowCodeInput(true);
    } catch (e) {
      console.error("Signup error:", e);
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ New function to handle code verification
  const onVerifyCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      // ✅ Verify code and create Firebase account
      await verifyCode(
        form.email,
        verificationCode,
        form.password,
        form.name,
        form.schoolYear,
        form.graduationYear,
        form.campus
      );
      
      // ✅ Verification complete - user is now logged in
      setSignupComplete(true);
    } catch (e) {
      console.error("Verification error:", e);
      setError(e.message || "Invalid or expired code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ New function to resend verification code
  const onResendCode = async () => {
    setError("");
    setResendLoading(true);

    try {
      const apiUrl = import.meta.env.PROD 
        ? `${window.location.origin}/resend-code`
        : "http://localhost:3000/resend-code";
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      // Show success message
      setError(""); // Clear any errors
      alert("✅ New code sent! Check your email.");
    } catch (e) {
      console.error("Resend error:", e);
      setError(e.message || "Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Signup Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-10">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#003f87] to-[#ff6b35] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <svg
                className="w-9 h-9 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>

          {/* ✅ SUCCESS VIEW - Show after email verification */}
          {signupComplete ? (
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Account Created! 🎉
              </h2>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl px-4 py-4 mb-6">
                <p className="text-sm text-green-900 leading-relaxed">
                  Your CUNY email has been verified!
                </p>
                <p className="text-sm text-green-800 mt-2">
                  You're all set to start trading with students.
                </p>
              </div>

              {/* Go to Browse Button */}
              <Link
                to="/browse"
                className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-[#003f87] to-[#ff6b35] rounded-xl hover:from-[#002a5c] hover:to-[#e55a20] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                Start Browsing Items
              </Link>
            </div>
          ) : showCodeInput ? (
            /* ✅ VERIFICATION CODE VIEW - Show after registration */
            <div>
              <div className="mb-8 text-center">
                <div className="inline-block mb-3">
                  <span className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#003f87] to-[#ff6b35] uppercase">
                    CUNYswap
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-base text-gray-600">
                  We sent a 6-digit code to <strong>{form.email}</strong>
                </p>
              </div>

              <form onSubmit={onVerifyCode} className="space-y-4">
                {/* Verification Code Input */}
                <div>
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center text-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-gray-300 tracking-widest"
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    📧 Check your inbox and spam folder. The code expires in 10 minutes.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#003f87] to-[#ff6b35] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-[#002a5c] hover:to-[#e55a20] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                {/* Resend Code Button */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onResendCode}
                    disabled={resendLoading}
                    className="text-sm text-[#ff6b35] hover:text-[#003f87] font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? "Sending..." : "Didn't receive the code? Resend"}
                  </button>
                </div>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeInput(false);
                    setVerificationCode("");
                    setError("");
                  }}
                  className="w-full text-gray-600 hover:text-gray-900 font-medium py-2 text-sm"
                >
                  ← Back to signup
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* SIGNUP FORM VIEW - Show this before signup */}
              <div className="mb-8 text-center">
                <div className="inline-block mb-3">
                  <span className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#003f87] to-[#ff6b35] uppercase">
                    CUNYswap
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-2">
                  Join Your Campus
                </h2>
                <p className="text-base text-gray-600">
                  Create an account to start trading with students
                </p>
              </div>

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={onChange}
                    autoComplete="name"
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    🧑‍🎓 School Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@login.cuny.edu"
                    value={form.email}
                    onChange={onChange}
                    autoComplete="email"
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-gray-300"
                  />
                  <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Must be a @{BUFF_STATE_DOMAIN} email
                  </p>
                </div>

                {/* Graduation Year */}
                <div>
                  <label
                    htmlFor="graduationYear"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    🧑‍🎓 Graduation Year
                  </label>
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="text"
                    placeholder="e.g. 2025"
                    value={form.graduationYear}
                    onChange={onChange}
                    autoComplete="graduation-year"
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                {/* School Year */}
                <div>
                  <label
                    htmlFor="schoolYear"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    🧑‍🎓 School Year
                  </label>
                  <input
                    id="schoolYear"
                    name="schoolYear"
                    type="text"
                    placeholder="e.g. Freshman, Sophomore"
                    value={form.schoolYear}
                    onChange={onChange}
                    autoComplete="school-year"
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                {/* Campus Field (Auto-filled & Locked) */}
                <div>
                  <label
                    htmlFor="campus"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    🎓 CUNY Campus
                  </label>
                  <select
                    id="campus"
                    name="campus"
                    value={form.campus}
                    onChange={onChange}
                    required
                    className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-base text-gray-700 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-50 transition-all duration-200 bg-white appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.75rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="">Select your CUNY campus</option>
                    <option value="John Jay College">John Jay College</option>
                    <option value="Queens College">Queens College</option>
                    <option value="Lehman College">Lehman College</option>
                    <option value="Baruch College">Baruch College</option>
                    <option value="Hunter College">Hunter College</option>
                    <option value="Brooklyn College">Brooklyn College</option>
                    <option value="City College">City College</option>
                    <option value="City Tech">City Tech</option>
                    <option value="Macaulay Honors College">Macaulay Honors College</option>
                    <option value="Borough of Manhattan Community College (BMCC)">Borough of Manhattan Community College (BMCC)</option>
                    <option value="Bronx Community College">Bronx Community College</option>
                    <option value="Hostos Community College">Hostos Community College</option>
                    <option value="LaGuardia Community College">LaGuardia Community College</option>
                    <option value="Kingsborough Community College">Kingsborough Community College</option>
                    <option value="Queensborough Community College">Queensborough Community College</option>
                    <option value="Guttman Community College">Guttman Community College</option>
                    <option value="York College">York College</option>
                    <option value="Medgar Evers College">Medgar Evers College</option>
                    <option value="College of Staten Island">College of Staten Island</option>
                  </select>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Select your campus for safety and verification purposes
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#003f87] to-[#ff6b35] text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl hover:from-[#002a5c] hover:to-[#e55a20] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Disclaimer under signup form */}
              <div className="mt-4 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
                <strong>Disclaimer:</strong> CUNYswap is an independent,
                student-led platform and is not affiliated with, sponsored by,
                or officially endorsed by City University of New York (CUNY).
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-gray-500 font-medium">
                    Already a member?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-semibold text-[#003f87] bg-blue-50 rounded-xl hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                >
                  Sign in to existing account
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer Text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Safe, secure, and built for students 🔒
        </p>
      </div>
    </div>
  );
}
