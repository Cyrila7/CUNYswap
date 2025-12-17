import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (initializing) {
    return null;
  }

  // NO USER at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ If user exists in context, they're already verified
  // (AuthContext only sets user if emailVerified === true in Firestore)
  
  // Double check domain just to be safe
  if (!user.email.endsWith("@login.cuny.edu")) {
    return <Navigate to="/login" replace />;
  }

  // ✅ ONLY verified CUNY users reach here
  return children;
}


// const email = user.email?.toLowerCase() || "";
// const isCuny = email.endsWith("login.cuny.edu");

// this going to send them to  verify page if they not using buffalostate email
// (!user.emailVerified || !isCuny) { return <Navigate to="/verify" replace/>}

// THIS is the lock. Not Firebase. Not signup. Not login.
{/*}
Now it’s impossible to enter:

/profile

/browse

/sell

/messages

/item/:id

Without:
✅ Email verified
✅ Buffalo email
✅ Active auth session
*/}