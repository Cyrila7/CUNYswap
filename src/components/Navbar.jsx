import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "text-[#ff6b35] font-bold"
      : "text-gray-700 hover:text-[#003f87] font-medium";

  const handleSellClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location, redirectTo: "/sell" } });
    } else {
      navigate("/sell");
    }
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#003f87] to-[#ff6b35] flex items-center justify-center text-white text-xl font-black shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
            C
          </div>
          <span className="text-2xl font-black tracking-tight text-[#003f87] font-serif">
            CUNY<span className="text-[#ff6b35]">swap</span>
          </span>
        </Link>

        {/* CENTER: DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className={`${isActive("/")} transition-colors`}>
            Home
          </Link>
          <Link to="/browse" className={`${isActive("/browse")} transition-colors`}>
            Browse
          </Link>
          {/* <Link to="/about" className={isActive("/about")}>
            About
          </Link> */}
          <Link to="/faq" className={`${isActive("/faq")} transition-colors`}>
            FAQ
          </Link>
        </div>

        {/* RIGHT: DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          <button
            onClick={handleSellClick}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 transform"
          >
            + Sell
          </button>

          {user ? (
            <>
              <Link to="/messages" className="text-gray-700 hover:text-[#ff6b35] font-semibold transition-colors">
                Messages
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-[#003f87] font-semibold transition-colors">
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-600 font-semibold transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-[#003f87] font-semibold transition-colors">
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-5 py-2.5 rounded-xl bg-[#003f87] text-white hover:bg-[#002a5c] font-bold transition-all transform hover:scale-105 shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* MOBILE: HAMBURGER */}
        <button
          className="md:hidden text-3xl text-[#003f87] hover:text-[#ff6b35] transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE PANEL */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-gray-200 bg-white shadow-xl">
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-4 text-sm">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={isActive("/")}
            >
              🏠 Home
            </Link>
            <Link
              to="/browse"
              onClick={() => setMenuOpen(false)}
              className={isActive("/browse")}
            >
              🔍 Browse
            </Link>
            {/* <Link
              to="/about"
              onClick={() => setMenuOpen(false)}
              className={isActive("/about")}
            >
              About
            </Link> */}
            <Link
              to="/faq"
              onClick={() => setMenuOpen(false)}
              className={isActive("/faq")}
            >
              ❓ FAQ
            </Link>

            <button
              onClick={handleSellClick}
              className="mt-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white font-black shadow-lg"
            >
              + Sell Item
            </button>

            {user ? (
              <>
                <Link
                  to="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-[#ff6b35] font-semibold transition-colors"
                >
                  💬 Messages
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-[#003f87] font-semibold transition-colors"
                >
                  👤 Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-gray-500 hover:text-red-600 text-left mt-1 font-semibold transition-colors"
                >
                  ↪️ Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-[#003f87] font-semibold transition-colors"
                >
                  🔑 Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#003f87] text-white hover:bg-[#002a5c] font-bold text-center transition-all shadow-md"
                >
                  ✨ Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}



// for git purposes i added the the search bar to the code
// and the sell button logic to redirect to login if not authenticated
// also added active link styling for better user experience
// also added responsive design to hide search bar and left links on small screens
// this for git messages"self note"
// new notes for git : removed the search bar

// NOV-2024 EDITS BELOW
// i just changed the font of the logo text to be a serif font for better aesthetics
