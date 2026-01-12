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
      ? "text-pink-600"
      : "text-gray-700 hover:text-pink-500";

  const handleSellClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location, redirectTo: "/sell" } });
    } else {
      navigate("/sell");
    }
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold shadow-md group-hover:shadow-lg transition-shadow">
            C
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 font-serif">
            CUNY<span className="text-pink-500">swap</span>
          </span>
        </Link>

        {/* CENTER: DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
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
        <div className="hidden md:flex items-center gap-3 text-sm font-medium">
          <button
            onClick={handleSellClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Sell
          </button>

          {user ? (
            <>
              <Link to="/messages" className="text-gray-700 hover:text-pink-500 transition-colors">
                Messages
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-pink-500 transition-colors">
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-pink-500 transition-colors">
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold transition-colors"
              >
                Signup
              </Link>
            </>
          )}
        </div>

        {/* MOBILE: HAMBURGER */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>
      </div>

      {/* MOBILE PANEL */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className={isActive("/")}
            >
              Home
            </Link>
            <Link
              to="/browse"
              onClick={() => setMenuOpen(false)}
              className={isActive("/browse")}
            >
              Browse
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
              FAQ
            </Link>

            <button
              onClick={handleSellClick}
              className="mt-2 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white font-semibold shadow-md"
            >
              Sell
            </button>

            {user ? (
              <>
                <Link
                  to="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Messages
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-gray-500 hover:text-red-600 text-left mt-1 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-pink-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 font-semibold text-center transition-colors"
                >
                  Signup
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
