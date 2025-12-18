import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import RequireAuth from "../components/RequireAuth";

// 🚨 Banned words filter for safety
const bannedWords = [
  "cuddle", "escort", "sex", "sugar-mommy", "sugar-daddy","sugardaddy", "sugarmommy",
  "nude", "hookup", "adult", "explicit","weed", "drugs", "drug",
  "blowjob", "bdsm", "fetish", "kink",
  "paypal only", "paypal", "onlyfans", "naked",
  "sell pics", "sell nudes", "sell photos",
  "private snapchat", "private snap",
  "pay pal", "pay-pal", "payme", "pay-me",
  "gift card", "giftcard", "gift-card",
  "sells pics", "sells nudes", "sells photos",
  "adult services", "adult service",
  "sugar baby", "sugar daddy", "sugar mommy",
  "looking for fun", "looking for hookup",
  "permit me to", "dm for fun", "cash app only",
  "massage", "companionship", "intimate",
  "only fans", "onlyfans", "snapchat premium",
  "venmo only", "no meetup", "online only",
  "fuck", "shit", "bitch", "asshole", "damn", "hell",
  "bastard", "dick", "pussy", "cock", "cunt", "whore",
  "slut", "motherfucker", "fck", "f*ck", "sh*t", "b*tch", "a55hole",
  "hoe" , "h*e"
];

function containsBannedWords(text) {
  const normalized = text.toLowerCase();
  return bannedWords.some(word => normalized.includes(word));
}

function SellPageInner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    campus: "",
  });

  // ✅ imageFiles is always defined as an array
  const [imageFiles, setImageFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // ✅ Mobile-safe handler, capped at 5 images
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setImageFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!form.title || !form.price) {
      setErr("Title and price are required.");
      return;
    }
    if (!form.condition) {
      setErr("Please select an item condition.");
      return;
    }
    if (!form.campus) {
      setErr("Please select your campus location.");
      return;
    }

    // 🚨 Check for banned words in title and description
    if (containsBannedWords(form.title) || containsBannedWords(form.description)) {
      setErr("Your post contains inappropriate or banned content and cannot be published. Please revise your listing.");
      return;
    }

    setLoading(true);
    try {
      const priceNumber = Number(form.price);
      if (isNaN(priceNumber)) {
        throw new Error("Price must be a valid number.");
      }

      if (priceNumber <= 0) {
        throw new Error("Price must be greater than 0.");
      }

      // 1) Upload images to Firebase Storage and collect URLs
      const imageUrls = [];

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileExt = file.name.split(".").pop();
          const filePath = `items/${user.uid}/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, filePath);

          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          imageUrls.push(url);
        }
      }

      // 2) Create Firestore doc
      await addDoc(collection(db, "items"), {
        title: form.title,
        description: form.description,
        price: priceNumber,
        category: form.category || "Other",
        condition: form.condition,
        campus: form.campus,
        imageUrls,
        userId: user.uid,
        userName: user.displayName || "Unknown seller",
        createdAt: serverTimestamp(),
        userEmail: user.email,
      });

      navigate("/profile");
    } catch (error) {
      console.error(error);
      setErr(error.message || "Failed to create listing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl">
            +
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Post an item</h1>
            <p className="text-sm text-gray-500 mt-1">
              List something you&apos;re ready to sell or trade with other
              students.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item title
            </label>
            <input
              name="title"
              placeholder="MacBook charger, Calc textbook, mini fridge..."
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
          </div>

          {/* Price + Category + Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (USD)
              </label>
              <input
                name="price"
                placeholder="e.g. 25"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Textbooks & School Supplies">Textbooks & School Supplies</option>
                <option value="Clothing & Shoes">Clothing & Shoes</option>
                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                <option value="Furniture">Furniture</option>
                <option value="Kitchenware">Kitchenware</option>
                <option value="Free / Giveaways">Free / Giveaways</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Select Condition</option>
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good Condition">Good Condition</option>
                <option value="Used / Second-hand">Used / Second-hand</option>
              </select>
            </div>
          </div>

          {/* Campus Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campus <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Select the campus where buyers can meet you
            </p>
            <select
              name="campus"
              value={form.campus}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Condition, size, model, pickup location, etc."
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item photo
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-cuny-50 file:text-pink-600 hover:file:bg-cuny-100"
            />
            <p className="text-xs text-gray-400 mt-1">
              You can upload up to 5 images.
            </p>

            {/* ✅ Image Preview Grid with Delete Buttons */}
            {imageFiles && imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        setImageFiles(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md opacity-90 group-hover:opacity-100 transition-all"
                      title="Remove this image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* Image number badge */}
                    <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ✅ Safe mobile-friendly count display */}
            <p className="text-xs text-gray-500 mt-2">
              {imageFiles?.length
                ? `${imageFiles.length} photo${imageFiles.length > 1 ? "s" : ""} selected`
                : "No photos selected yet."}
            </p>
          </div>

          {/* Error */}
          {err && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {err}
            </p>
          )}

          {/* checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              required
              className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label className="ml-2 block text-sm text-gray-700">
              I agree that my post follows CUNYswap's community rules
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold py-2.5 text-sm shadow-md hover:shadow-lg transition disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post item"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <RequireAuth>
      <SellPageInner />
    </RequireAuth>
  );
}



// NOV-20-2025
// - Updated the image upload logic to support multiple images (up to 5).
// - Modified Firestore document structure to store an array of image URLs instead of a single URL.
// - Enhanced the UI to allow users to select multiple images when posting an item.
// - Improved error handling and user feedback during the image upload and form submission process.
// - Ensured mobile compatibility by limiting the number of images and providing clear feedback on selected images.