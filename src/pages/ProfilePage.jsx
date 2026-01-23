import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
  setDoc, // NEW
  getDoc, // NEW
  getDocs, // NEW - for batch updates
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router-dom";
import { updateProfile } from "firebase/auth"; // NEW
import { serverTimestamp } from "firebase/firestore";


export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [items, setItems] = useState([]);

  // NEW: local state for edit modal just added below
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    schoolYear: "",
    graduationYear: "",
    campus: "",
  });

   const [profileData, setProfileData] = useState({
    schoolYear: "",
    graduationYear: "",
    campus: "",
  });

   // UPDATED: whenever user changes, sync form values from Auth + Firestore
  // Whenever user changes, get name from Auth and extra fields from Firestore
  useEffect(() => {
  if (!user) return;

  // always sync full name from Auth
  setProfileForm((prev) => ({
    ...prev,
    fullName: user.displayName || "",
  }));

  const loadProfile = async () => {
    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        const schoolYear = data.schoolYear || "";
        const graduationYear = data.graduationYear || "";
        const campus = data.campus || "";

        // what we show on the card
        setProfileData({ schoolYear, graduationYear, campus });

        // prefill the modal inputs
        setProfileForm((prev) => ({
          ...prev,
          schoolYear,
          graduationYear,
          campus,
        }));
      } else {
        // no doc yet
        setProfileData({ schoolYear: "", graduationYear: "", campus: "" });
        setProfileForm((prev) => ({
          ...prev,
          schoolYear: "",
          graduationYear: "",
          campus: "",
        }));
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
    }
  };

  loadProfile();
}, [user]);


  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "items"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      orderBy("title", "asc"),
      orderBy("category", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(list);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-600">Not logged in.</p>
      </div>
    );
  }


  // delete user items
  const deleteItem = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "items", id));
  };

  const soldItem = async (id) => {
  const confirmSold = window.confirm(
    "Are you sure you want to mark this listing as sold?"
  );
  if (!confirmSold || !user) return;

  const itemRef = doc(db, "items", id);

  await setDoc(
    itemRef,
    {
      sold: true,
      soldAt: serverTimestamp(),
      soldBy: user.uid,
    },
    { merge: true }
  );
};


  // NEW: handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // NEW: save profile (Auth displayName + Firestore users doc)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      const fullNameTrimmed = profileForm.fullName.trim();
      const nameChanged = fullNameTrimmed && fullNameTrimmed !== user.displayName;

      // Update Firebase Auth displayName
      if (nameChanged) {
        await updateProfile(user, { displayName: fullNameTrimmed });
      }

      // it will Update Firestore user doc for extra fields (adjust collection name if needed)
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          displayName: fullNameTrimmed || null,
          schoolYear: profileForm.schoolYear || "",
          graduationYear: profileForm.graduationYear || "",
          campus: profileForm.campus || "",
        },
        { merge: true }
      );

      // ✅ NEW: If name changed, update userName on all user's items
      if (nameChanged) {
        const itemsQuery = query(
          collection(db, "items"),
          where("userId", "==", user.uid)
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        
        // Batch update all items with new userName
        const updatePromises = itemsSnapshot.docs.map((itemDoc) =>
          setDoc(
            doc(db, "items", itemDoc.id),
            { userName: fullNameTrimmed },
            { merge: true }
          )
        );
        
        await Promise.all(updatePromises);
        console.log(`✅ Updated userName on ${itemsSnapshot.size} items`);
      }

      // it will immediately reflect updated data on the profile card
      setProfileData({
        schoolYear: profileForm.schoolYear || "",
        graduationYear: profileForm.graduationYear || "",
      });

      setSaveSuccess("Profile updated successfully.");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setSaveError("Something went wrong while saving. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // User will be redirected automatically by AuthContext
    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header with greeting */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-[#003f87] mb-2">
            Hey, {user.displayName?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">Welcome to your campus marketplace hub</p>
        </div>

        {/* PROFILE CARD - More compact and student-friendly */}
        <section className="bg-white rounded-2xl shadow-lg border-2 border-[#003f87]/10 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#003f87] to-[#ff6b35] px-6 py-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
              <div className="text-9xl">🎓</div>
            </div>
            <div className="relative flex items-center gap-6">
              {/* Avatar */}
              <div className="h-24 w-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-white/30">
                {(user.displayName || user.email || "?")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{user.displayName || "CUNY Student"}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-400/90 text-green-900">
                    ✓ Verified
                  </span>
                  {profileData.campus && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm">
                      📍 {profileData.campus}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/80">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Info Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* School Year */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="text-xs font-bold text-blue-600 mb-1">YEAR</div>
                <div className="text-lg font-bold text-gray-900">
                  {profileData.schoolYear || "Not set"}
                </div>
              </div>

              {/* Graduation Year */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <div className="text-xs font-bold text-orange-600 mb-1">GRADUATING</div>
                <div className="text-lg font-bold text-gray-900">
                  {profileData.graduationYear || "Not set"}
                </div>
              </div>

              {/* Active Listings */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="text-xs font-bold text-green-600 mb-1">LISTINGS</div>
                <div className="text-lg font-bold text-gray-900">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setSaveError("");
                  setSaveSuccess("");
                  setIsEditing(true);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#003f87] to-[#ff6b35] text-white text-sm font-bold shadow-lg hover:shadow-xl hover:from-[#002a5c] hover:to-[#e55a20] transition-all transform hover:scale-105"
              >
                ✏️ Edit Profile
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold shadow-md hover:bg-gray-200 transition-all border-2 border-gray-200"
              >
                👋 Logout
              </button>
            </div>

            {saveSuccess && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-700 font-medium">{saveSuccess}</p>
              </div>
            )}
            {saveError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-medium">{saveError}</p>
              </div>
            )}
          </div>
        </section>

        {/* MY LISTINGS SECTION */}
        <section className="bg-white rounded-2xl shadow-lg border-2 border-[#003f87]/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#003f87] flex items-center gap-2">
                🛍️ My Listings
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your active marketplace items
              </p>
            </div>
            {items.length > 0 && (
              <Link
                to="/sell"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#003f87] to-[#ff6b35] text-white text-sm font-bold hover:shadow-lg transition-all"
              >
                + New Item
              </Link>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">
                Start selling to your fellow CUNY students!
              </p>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#003f87] to-[#ff6b35] text-white text-sm font-bold hover:shadow-lg transition-all"
              >
                🚀 Post Your First Item
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#ff6b35] hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                >
                  {/* Item info - clickable to view */}
                  <Link
                    to={`/item/${item.id}`}
                    className="flex-1 min-w-0 hover:text-[#003f87] transition-colors"
                  >
                    <p className="text-base font-bold text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-lg text-[#ff6b35] font-black">
                      ${item.price}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {item.category || "General"}
                      </span>
                      {item.sold && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          ✅ Sold
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Action buttons */}
                  <div className="flex gap-2 self-end md:self-center flex-wrap">
                    {/* Edit button */}
                    <Link
                      to={`/sell?edit=${item.id}`}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#003f87] text-white hover:bg-[#ff6b35] shadow-md hover:shadow-lg transition-all"
                    >
                      ✏️ Edit
                    </Link>

                    {/* Mark as Sold / Sold badge */}
                    <button
                      onClick={() => soldItem(item.id)}
                      disabled={item.sold}
                      className={`px-4 py-2 text-xs font-bold rounded-xl shadow-md transition-all 
                      ${item.sold
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600 hover:shadow-lg"
                      }`}
                    >
                      {item.sold ? "✅ Sold" : "✓ Mark Sold"}
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* NEW: Edit profile modal */}
      {isEditing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit profile
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] text-sm"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  School Year
                </label>
                <input
                  type="text"
                  name="schoolYear"
                  value={profileForm.schoolYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] text-sm"
                  placeholder="e.g., Sophomore, Junior"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Graduation Year
                </label>
                <input
                  type="text"
                  name="graduationYear"
                  value={profileForm.graduationYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] text-sm"
                  placeholder="e.g., 2027"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Campus
                </label>
                <select
                  name="campus"
                  value={profileForm.campus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] text-sm"
                >
                  <option value="">Select your campus</option>
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
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-xs font-medium text-gray-600 rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#003f87] to-[#ff6b35] text-white hover:from-[#002a5c] hover:to-[#e55a20] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- IGNORE / do not delete my selfnotes---
// DATE-NOV-12-2025
// added profile card to profile page showing user info
// added user ID display
// added active listings count
// styled the profile page for better UX

// DATE-NOV-14-2025
// refactored delete item button to be on the right of each listing
// added confirmation prompt before deleting an item
// added link to each item title to view item details before deleting
// if something is wrong or code is not working please inform me.

// DATE-NOV-16-2025
// added school year and graduation year fields
// code was made from scratch

// DATE-NOV-17-2025
// added edit profile functionality with modal form

// Nov-21-2025
// fixed syncing issue with profile data between Auth and Firestore
// improved UX with success/error messages on profile save
// i added a sold badge button to mark items as sold
