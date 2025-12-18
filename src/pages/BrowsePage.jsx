import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link, useSearchParams } from "react-router-dom";
import { where } from "firebase/firestore";

export default function BrowsePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showSoldItems, setShowSoldItems] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCampuses, setSelectedCampuses] = useState(["All Campuses"]);

  const conditionOptions = ["All", "Brand New", "Like New", "Good Condition", "Used / Second-hand"];
  const categories = [
    "All",
    "Electronics",
    "Textbooks & School Supplies",
    "Clothing & Shoes",
    "Beauty & Personal Care",
    "Furniture",
    "Kitchenware",
    "Free / Giveaways",
    "Other",
  ];

  const campuses = [
    "All Campuses",
    "John Jay College",
    "Queens College",
    "Lehman College",
    "Baruch College",
    "Hunter College",
    "Brooklyn College",
    "Queens College",
    "City College",
    "City Tech",
    "Macaulay Honors College",
    "Borough of Manhattan Community College (BMCC)",
    "Bronx Community College",
    "Hostos Community College",
    "LaGuardia Community College",
    "Kingsborough Community College",
    "Queensborough Community College",
    "Guttman Community College",
    "York College",
    "Medgar Evers College",
    "College of Staten Island",
  ];

  const handleCampusToggle = (campus) => {
    if (campus === "All Campuses") {
      setSelectedCampuses(["All Campuses"]);
    } else {
      setSelectedCampuses((prev) => {
        const filtered = prev.filter((c) => c !== "All Campuses");
        if (filtered.includes(campus)) {
          const updated = filtered.filter((c) => c !== campus);
          return updated.length === 0 ? ["All Campuses"] : updated;
        } else {
          return [...filtered, campus];
        }
      });
    }
  };

  const removeCampusFilter = (campus) => {
    setSelectedCampuses((prev) => {
      const updated = prev.filter((c) => c !== campus);
      return updated.length === 0 ? ["All Campuses"] : updated;
    });
  };

  useEffect(() => {
    if (initialQ && initialQ !== searchTerm) {
      setSearchTerm(initialQ);
    }
  }, [initialQ]); 

  useEffect(() => {
    const q = query(
      collection(db, "items"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const norm = (v) => (v || "").toString().toLowerCase();

  // Apply search + category + condition + price + sold filters
  const filteredItems = items.filter((item) => {
    // ✅ Sold filter logic:
    // - If showSoldItems is ON → only show sold items
    // - If showSoldItems is OFF → only show available (not sold) items
    if (showSoldItems && !item.sold) return false; // Toggle ON: hide unsold items
    if (!showSoldItems && item.sold) return false; // Toggle OFF: hide sold items

    const title = norm(item.title);
    const desc = norm(item.description);
    const cat = norm(item.category);
    const cond = norm(item.condition);

    const term = norm(searchTerm);

    // Search filter
    const matchesSearch =
      !term ||
      title.includes(term) ||
      desc.includes(term) ||
      cat.includes(term);

    // Category filter
    const matchesCategory =
      selectedCategory === "All" || cat === norm(selectedCategory);

    // Condition filter
    const matchesCondition =
      selectedCondition === "All" || cond === norm(selectedCondition);

    // Price filter
    const itemPrice = parseFloat(item.price) || 0;
    const min = minPrice === "" ? 0 : parseFloat(minPrice);
    const max = maxPrice === "" ? Infinity : parseFloat(maxPrice);
    const matchesPrice = itemPrice >= min && itemPrice <= max;

    // Campus filter
    const matchesCampus = selectedCampuses.includes("All Campuses") ||
      selectedCampuses.includes(item.campus);

    return matchesSearch && matchesCategory && matchesCondition && matchesPrice && matchesCampus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Browse listings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Search and filter items posted by CUNY students.
          </p>
        </div>

        {/* Search input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search textbooks, electronics, furniture…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* 🎯 Filter Toggle Button */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 text-sm font-medium text-gray-700 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters & Sort</span>
          <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Active filters indicator */}
        {(selectedCategory !== "All" || selectedCondition !== "All" || minPrice || maxPrice || showSoldItems || !selectedCampuses.includes("All Campuses")) && (
          <span className="text-xs text-pink-600 font-medium">
            {[
              selectedCategory !== "All" && selectedCategory,
              selectedCondition !== "All" && selectedCondition,
              (minPrice || maxPrice) && "Price range",
              showSoldItems && "Showing sold",
              !selectedCampuses.includes("All Campuses") && `${selectedCampuses.length} campus${selectedCampuses.length > 1 ? 'es' : ''}`
            ].filter(Boolean).join(", ")}
          </span>
        )}
      </div>

      {/* 🔽 Collapsible Filters Section */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-5 animate-in slide-in-from-top duration-200">
          
          {/* Category filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category:</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Condition:</label>
            <div className="flex flex-wrap gap-2">
              {conditionOptions.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setSelectedCondition(cond)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selectedCondition === cond
                      ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range:</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="Max ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="text-sm text-cuny-500 hover:text-pink-600 font-medium underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Campus filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Campus</label>
            <p className="text-xs text-gray-500 mb-3">Filter listings by campus</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {campuses.map((campus) => (
                <label key={campus} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedCampuses.includes(campus)}
                    onChange={() => handleCampusToggle(campus)}
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-2 focus:ring-pink-400"
                  />
                  <span className="text-sm text-gray-700">{campus}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Show sold items toggle */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showSoldItems}
                onChange={(e) => setShowSoldItems(e.target.checked)}
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-2 focus:ring-pink-400"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">
                Show sold items {showSoldItems && `(${items.filter(i => i.sold).length})`}
              </span>
            </label>
          </div>

          {/* Clear all filters */}
          {(selectedCategory !== "All" || selectedCondition !== "All" || minPrice || maxPrice || showSoldItems || !selectedCampuses.includes("All Campuses")) && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedCondition("All");
                setMinPrice("");
                setMaxPrice("");
                setShowSoldItems(false);
                setSelectedCampuses(["All Campuses"]);
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Active Campus Filter Chips */}
      {!selectedCampuses.includes("All Campuses") && selectedCampuses.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Active campus filters:</span>
          {selectedCampuses.map((campus) => (
            <button
              key={campus}
              onClick={() => removeCampusFilter(campus)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-pink-600 rounded-full text-xs font-medium hover:bg-purple-200 transition-colors group"
            >
              <span>📍 {campus}</span>
              <svg className="w-3.5 h-3.5 group-hover:text-purple-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-3">
        <p className="text-xs text-gray-700 text-center">
          <span className="font-semibold">Browse listings from all CUNY campuses</span> — filter by school to find nearby items.
        </p>
      </div>

      {/* Loading / empty states */}
      {loading && (
        <p className="text-gray-500 text-sm">Loading items…</p>
      )}

      {!loading && filteredItems.length === 0 && (
        <p className="text-gray-500 text-sm">
          No items match your search and filters yet. Try another keyword or category.
        </p>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative group">
            <Link
              to={`/item/${item.id}`}
              className={`border rounded-2xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col relative ${
                item.sold ? "opacity-60" : ""
              }`}
            >
              {/* SOLD badge */}
              {item.sold && (
                <span className="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full bg-red-500 text-white shadow-sm z-10">
                  SOLD
                </span>
              )}

            {/* Image */}
            <div className="w-full aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden mb-3 relative">
              {item.imageUrls && item.imageUrls.length > 0 ? (
                <img
                  src={item.imageUrls[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  style={{ contentVisibility: 'auto' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-400">No image</span>
                </div>
              )}
            </div>

            {/* Title + price */}
            <h2 className="text-sm font-semibold line-clamp-1">{item.title}</h2>
            <p className="text-pink-600 font-bold mt-1 text-sm">
              ${item.price}
            </p>

            {/* Condition + category */}
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              {item.condition && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                  {item.condition}
                </span>
              )}
              {item.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-500">
                  {item.category}
                </span>
              )}
            </div>

            {/* Description 
            {item.description && (
              <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                {item.description}
              </p>
            )}
              */}

            {/* Footer: seller */}
            <div className="mt-3 flex items-center gap-1.5 text-[11px]">
              <span className="text-gray-400">Seller: {item.userName || "Unknown"}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                ✓
              </span>
            </div>

            {/* Campus location */}
            {item.campus && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
                <span>📍</span>
                <span className="font-medium">{item.campus}</span>
              </div>
            )}
            </Link>

            {/* Report Flag - Shows on hover */}
            <button
              onClick={(e) => {
                e.preventDefault();
                alert(`Report feature coming soon for item: ${item.title}`);
              }}
              className="absolute top-2 left-2 p-1.5 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
              title="Report this listing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- IGNORE / do not delete my selfnotes---
// i just added category and condition filters to the browse page
// added conditionOptions array for condition filter buttons
// updated filteredItems to include condition filtering logic
// added condition filter buttons in the JSX below category filters
// code was made from scratch so if anything is wrong please inform me.

// NOV-20-2025
// - Updated the image upload logic to support multiple images (up to 5).
// - Modified Firestore document structure to store an array of image URLs instead of a single URL.
// - Enhanced the UI to allow users to select multiple images when posting an item.