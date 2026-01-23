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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#003f87]">
              Browse Marketplace
            </h1>
            <p className="text-base text-gray-600 mt-2 font-medium">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available • 
              <span className="text-[#ff6b35] font-bold ml-1">Find your next great deal</span>
            </p>
          </div>

          {/* Search input */}
          <div className="w-full lg:w-96">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
              <input
                type="text"
                placeholder="Search by keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-[#ff6b35] transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

      {/* 🎯 Filter Toggle Button */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border-2 border-gray-200 hover:border-[#003f87] hover:bg-blue-50 text-sm font-bold text-gray-700 transition-all shadow-md"
        >
          <span className="text-lg">⚙️</span>
          <span>Filters & Sort</span>
          <span className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
        </button>

        {/* Active filters indicator */}
        {(selectedCategory !== "All" || selectedCondition !== "All" || minPrice || maxPrice || showSoldItems || !selectedCampuses.includes("All Campuses")) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-[#ff6b35]">Active:</span>
            {[
              selectedCategory !== "All" && selectedCategory,
              selectedCondition !== "All" && selectedCondition,
              (minPrice || maxPrice) && "Price filter",
              showSoldItems && "Sold items",
              !selectedCampuses.includes("All Campuses") && `${selectedCampuses.length} campus${selectedCampuses.length > 1 ? 'es' : ''}`
            ].filter(Boolean).map((filter, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-[#003f87] rounded-full text-xs font-bold border border-[#003f87]">
                {filter}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 🔽 Collapsible Filters Section */}
      {showFilters && (
        <div className="mb-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 space-y-6">
          
          {/* Category filter */}
          <div>
            <label className="block text-sm font-bold text-[#003f87] mb-3">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-all transform hover:scale-105 ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-[#003f87] to-[#0052b3] text-white border-[#003f87] shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#ff6b35] hover:text-[#ff6b35]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition filter */}
          <div>
            <label className="block text-sm font-bold text-[#003f87] mb-3">Condition</label>
            <div className="flex flex-wrap gap-2">
              {conditionOptions.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setSelectedCondition(cond)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-all transform hover:scale-105 ${
                    selectedCondition === cond
                      ? "bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white border-[#ff6b35] shadow-lg"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#ff6b35] hover:text-[#ff6b35]"
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div>
            <label className="block text-sm font-bold text-[#003f87] mb-3">Price Range</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Min ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-32 px-4 py-2.5 rounded-xl border-2 border-gray-300 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-[#ff6b35] transition-all"
              />
              <span className="text-gray-400 font-black text-lg">—</span>
              <input
                type="number"
                placeholder="Max ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-32 px-4 py-2.5 rounded-xl border-2 border-gray-300 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-[#ff6b35] transition-all"
              />
              {(minPrice || maxPrice) && (
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-bold underline transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Campus filter */}
          <div>
            <label className="block text-sm font-bold text-[#003f87] mb-2">Campus</label>
            <p className="text-xs text-gray-600 mb-3 font-medium">Filter by campus location</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {campuses.map((campus) => (
                <label key={campus} className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedCampuses.includes(campus)}
                    onChange={() => handleCampusToggle(campus)}
                    className="w-5 h-5 text-[#003f87] border-gray-300 rounded focus:ring-[#ff6b35] focus:ring-2 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 font-medium">{campus}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Show sold items toggle */}
          <div className="pt-4 border-t-2 border-gray-100">
            <label className="flex items-center cursor-pointer hover:bg-orange-50 p-3 rounded-xl transition-colors">
              <input
                type="checkbox"
                checked={showSoldItems}
                onChange={(e) => setShowSoldItems(e.target.checked)}
                className="w-5 h-5 text-[#ff6b35] border-gray-300 rounded focus:ring-2 focus:ring-[#ff6b35] cursor-pointer"
              />
              <span className="ml-3 text-sm text-gray-700 font-bold">
                Show sold items only {showSoldItems && (
                  <span className="text-[#ff6b35]">({items.filter(i => i.sold).length})</span>
                )}
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
              className="w-full px-5 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 text-sm font-black text-gray-700 hover:text-red-700 transition-all transform hover:scale-105 shadow-sm"
            >
              ✕ Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Active Campus Filter Chips */}
      {!selectedCampuses.includes("All Campuses") && selectedCampuses.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600 font-bold">📍 Campus filters:</span>
          {selectedCampuses.map((campus) => (
            <button
              key={campus}
              onClick={() => removeCampusFilter(campus)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-[#003f87] rounded-full text-sm font-bold hover:bg-red-100 hover:text-red-700 hover:border-red-700 transition-all transform hover:scale-105 border-2 border-[#003f87]"
            >
              <span>{campus}</span>
              <span className="text-lg">✕</span>
            </button>
          ))}
        </div>
      )}

      {/* Info Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-100 via-purple-50 to-orange-100 border-2 border-[#003f87] rounded-2xl p-4 shadow-md">
        <p className="text-sm text-[#003f87] text-center font-bold">
          ✨ Browse listings from all CUNY campuses — filter by school to find nearby items
        </p>
      </div>

      {/* Loading / empty states */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block w-16 h-16 border-4 border-[#003f87] border-t-[#ff6b35] rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4 font-bold text-lg">Finding amazing deals...</p>
        </div>
      )}

      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 text-lg font-bold">No items match your search</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or search term</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedCondition("All");
              setMinPrice("");
              setMaxPrice("");
              setShowSoldItems(false);
              setSelectedCampuses(["All Campuses"]);
            }}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white font-bold rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const views = Math.floor(Math.random() * 50) + 5;
          const timeAgo = item.createdAt ? 
            Math.floor((Date.now() - item.createdAt.toMillis()) / (1000 * 60 * 60)) : 0;

          return (
            <div key={item.id} className="relative group">
              <Link
                to={`/item/${item.id}`}
                className={`block bg-white rounded-2xl border-2 border-gray-200 hover:border-[#ff6b35] hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden ${
                  item.sold ? "opacity-70" : ""
                }`}
              >
                {/* SOLD badge */}
                {item.sold && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide rounded-full bg-red-500 text-white shadow-lg z-10">
                    SOLD
                  </div>
                )}

                {/* Image */}
                <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                      style={{ contentVisibility: 'auto' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-400">
                      📦
                    </div>
                  )}

                  {/* Social proof badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-md">
                      <span>👁️</span> {views}
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                    {timeAgo === 0 ? 'Just now' : timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo/24)}d ago`}
                  </div>
                </div>

                <div className="p-4">
                  {/* Title + price */}
                  <h2 className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-[#ff6b35] transition-colors min-h-[3rem]">
                    {item.title}
                  </h2>
                  <p className="text-[#ff6b35] font-black text-2xl mt-2">
                    ${item.price}
                  </p>

                  {/* Condition + category */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {item.condition && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-orange-50 text-[#003f87] font-bold border border-gray-200">
                        {item.condition}
                      </span>
                    )}
                    {item.category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-600 font-semibold">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Footer: seller */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <span className="text-gray-600 font-semibold">@{item.userName || "student"}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#c0f542] text-[#003f87] border border-[#003f87]">
                      ✓
                    </span>
                  </div>

                  {/* Campus location */}
                  {item.campus && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg font-semibold">
                      <span>📍</span>
                      <span>{item.campus}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Report Flag - Shows on hover */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Report feature coming soon for item: ${item.title}`);
                }}
                className="absolute top-2 left-2 p-2 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
                title="Report this listing"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
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