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
  });

   const [profileData, setProfileData] = useState({
    schoolYear: "",
    graduationYear: "",
  });

  // Derive school from email (mainly CUNY)
  const school = useMemo(() => {
    if (!user?.email) return " CUNY student";
    const email = user.email.toLowerCase();
    if (email.includes("login.cuny.edu")) return "CUNY Campus";
    return "CUNY campus";
  }, [user]);

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

        // what we show on the card
        setProfileData({ schoolYear, graduationYear });

        // prefill the modal inputs
        setProfileForm((prev) => ({
          ...prev,
          schoolYear,
          graduationYear,
        }));
      } else {
        // no doc yet
        setProfileData({ schoolYear: "", graduationYear: "" });
        setProfileForm((prev) => ({
          ...prev,
          schoolYear: "",
          graduationYear: "",
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* PROFILE CARD */}
        <section className="bg-white rounded-3xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center">
          {/* Avatar at top */}
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
            {(user.displayName || user.email || "?")
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* Verified Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border-2 border-green-200 shadow-sm">
              ✓ Verified CUNY Student
            </span>
          </div>

          {/* FULL NAME */}
          <div className="w-full max-w-md text-left mb-4">
            <label className="text-xs text-gray-500 font-semibold">
              Full Name
            </label>
            <div className="mt-1 px-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-gray-900">
              {user.displayName || "Not provided"}
            </div>
          </div>

          {/* EMAIL */}
          <div className="w-full max-w-md text-left mb-4">
            <label className="text-xs text-gray-500 font-semibold">Email</label>
            <div className="mt-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 break-all text-gray-900">
              {user.email}
            </div>
          </div>

          {/* SCHOOL */}
          <div className="w-full max-w-md text-left mb-4">
            <label className="text-xs text-gray-500 font-semibold">
              School
            </label>
            <div className="mt-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900">
              {school}
            </div>
          </div>

          {/* SCHOOL YEAR */}
          <div className="w-full max-w-md text-left mb-4">
            <label className="text-xs text-gray-500 font-semibold">
              School Year
            </label>
            <div className="mt-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900">
              {profileData.schoolYear || "Not provided"}
            </div>
          </div>

          {/* Graduation Year */}
          <div className="w-full max-w-md text-left mb-4">
            <label className="text-xs text-gray-500 font-semibold">
              Graduation Year
            </label>
            <div className="mt-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900">
              {profileData.graduationYear || "Not provided"}
            </div>
          </div>

          {/* USER ID 
          <div className="w-full max-w-md text-left mb-4">
            <label className="text-xs text-gray-500 font-semibold">
              User ID
            </label>
            <div className="mt-1 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 break-all text-gray-900">
              {user.uid}
            </div>
          </div>
          */} {/*//not needed for profile its for admins only*/}

          {/* Stats */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                <p className="text-xs text-gray-500">Active listings</p>
                <p className="text-lg font-semibold text-gray-900">
                  {items.length}
                </p>
              </div>
            </div>

            {/* NEW: Edit button + feedback messages */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <button
                onClick={() => {
                  setSaveError("");
                  setSaveSuccess("");
                  setIsEditing(true);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-semibold shadow-sm hover:bg-pink-600 transition"
              >
                Edit profile
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-200 transition border border-gray-200"
              >
                Logout
              </button>
            </div>

            {saveSuccess && (
              <p className="mt-2 text-xs text-green-600">{saveSuccess}</p>
            )}
            {saveError && (
              <p className="mt-2 text-xs text-red-600">{saveError}</p>
            )}
          </div>
        </section>

        {/* LISTINGS SECTION */}
        <section className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              My posted items
            </h2>
            {items.length > 0 && (
              <p className="text-xs text-gray-500">
                Click a card to view details or delete from the right.
              </p>
            )}
          </div>

          {items.length === 0 && (
            <p className="text-gray-500 text-sm">
              You haven&apos;t posted anything yet. Use the{" "}
              <span className="font-medium text-pink-500">Sell</span> button in
              the top navbar to create your first listing.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition shadow-sm px-4 py-3"
              >
                {/* Left: title + price + category */}
                <Link
                  to={`/item/${item.id}`}
                  className="flex-1 flex flex-col gap-1"
                >
                  <p className="text-base font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-sm text-pink-600 font-bold">
                    ${item.price}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.category || "General"}
                  </p>
                </Link>

                {/* Action buttons */}
                <div className="flex gap-2 self-end md:self-center">
                  {/* Edit button */}
                  <Link
                    to={`/sell?edit=${item.id}`}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-500 text-white hover:bg-pink-500 shadow-sm"
                  >
                    ✏️ Edit
                  </Link>

                  {/* Mark as Sold / Sold badge */}
                  <button
                    onClick={() => soldItem(item.id)}
                    disabled={item.sold}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl shadow-sm 
                    ${item.sold
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {item.sold ? "✅ Sold" : "Mark Sold"}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-sm"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-sm"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 text-sm"
                  placeholder="e.g., 2027"
                />
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed"
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
