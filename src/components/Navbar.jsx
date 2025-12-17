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
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* LEFT: LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
            C
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl sans font-serif">
            CUNY<span className="text-pink-500">swap</span>
          </span>
        </Link>

        {/* CENTER: DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link to="/browse" className={isActive("/browse")}>
            Browse
          </Link>
          {/* <Link to="/about" className={isActive("/about")}>
            About
          </Link> */}
          <Link to="/faq" className={isActive("/faq")}>
            FAQ
          </Link>
        </div>

        {/* RIGHT: DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium">
          <button
            onClick={handleSellClick}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-sm hover:shadow-md"
          >
            Sell
          </button>

          {user ? (
            <>
              <Link to="/messages" className="text-gray-700 hover:text-pink-500">
                Messages
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-pink-500">
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Logout ({user.displayName || user.email.split("@")[0]})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-pink-500">
                Login
              </Link>
              <Link to="/signup" className="text-pink-500 hover:text-pink-600">
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
        <div className="md:hidden border-t border-gray-100 bg-white">
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
              className="mt-2 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-sm"
            >
              Sell
            </button>

            {user ? (
              <>
                <Link
                  to="/messages"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-pink-500"
                >
                  Messages
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-pink-500"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-red-500 text-left mt-1"
                >
                  Logout ({user.displayName || user.email.split("@")[0]})
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-pink-500"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="text-pink-500 hover:text-pink-600"
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
