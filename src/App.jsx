import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";
import StatsDashboard from "./components/StatsDashboard";


import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SellPage from "./pages/SellPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import FaqPage from "./pages/FaqPage";
import BrowsePage from "./pages/BrowsePage";
//import AboutPage from "./pages/AboutPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
//import ResetPasswordPage from "./pages/ResetPasswordPage";


function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />


        {/* Public browsing routes */}
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        {/* <Route path="/about" element={<AboutPage />} /> */}
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/stats" element={<StatsDashboard />} />

        {/* Protected routes - require login */}
        <Route path="/sell" element={<RequireAuth><SellPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
        <Route path="/messages/:conversationId" element={<RequireAuth><MessagesPage /></RequireAuth>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

// In this App.jsx file, we set up the main application structure using React Router.
// We define public routes for home, login, and signup pages,
// and protected routes for selling items, viewing item details, user profile, messages, and FAQ pages.
// The RequireAuth component ensures that only authenticated users can access the protected routes.
// The Navbar component is included at the top for navigation across different pages.
// Each page component is imported from the src/pages directory.
// This structure provides a clear separation between public and private areas of the application,
// enhancing both security and user experience.
// Note: The actual implementations of the page components (HomePage, LoginPage, etc.) are not included here,
// as they are defined in their respective files within the src/pages directory.


