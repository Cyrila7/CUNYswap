import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCampuses, setSelectedCampuses] = useState(["All Campuses"]);

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
    const q = query(collection(db, "items"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItems(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/browse?q=${encodeURIComponent(searchTerm)}`);
  };

  const quickSearch = (term) => {
    setSearchTerm(term);
    navigate(`/browse?q=${encodeURIComponent(term)}`);
  };

  const visibleItems = items.filter((item) => {
    if (item.sold) return false;

    const matchesCategory =
      selectedCategory === "All" ||
      (item.category &&
        item.category.toLowerCase() === selectedCategory.toLowerCase());

    const itemPrice = parseFloat(item.price) || 0;
    const min = minPrice === "" ? 0 : parseFloat(minPrice);
    const max = maxPrice === "" ? Infinity : parseFloat(maxPrice);
    const matchesPrice = itemPrice >= min && itemPrice <= max;

    const matchesCampus =
      selectedCampuses.includes("All Campuses") ||
      selectedCampuses.includes(item.campus);

    return matchesCategory && matchesPrice && matchesCampus;
  });

  const justListedItems = items.filter(item => !item.sold).slice(0, 6);
  const activeStudentsCount = new Set(items.map(i => i.userId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50">
      {/* Compact Header - Marketplace Style */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        {/* Tagline */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-serif">
            Campus <span className="bg-gradient-to-r from-[#003f87] to-[#ff6b35] bg-clip-text text-transparent">Marketplace</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2 font-medium">
            Buy, sell, and trade items safely with your fellow students.
          </p>
        </div>

        {/* Search - Primary Focus */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex items-center flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#ff6b35] transition-all">
              <span className="text-gray-400 text-xl mr-3">🔍</span>
              <input
                type="text"
                placeholder="Search for textbooks, electronics, clothing..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="hidden sm:inline-flex px-5 py-3 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white text-sm font-bold hover:shadow-lg transition-all"
            >
              Search
            </button>
          </form>

          {/* Quick Category Tags */}
          <div className="flex gap-2 mt-3 text-xs overflow-x-auto pb-1">
            <span className="text-gray-500 font-medium">Quick tags:</span>
            {[
              { label: "Textbooks", term: "textbooks" },
              { label: "Electronics", term: "electronics" },
              { label: "Clothing", term: "clothing" },
              { label: "Dorm Supplies", term: "dorm" }
            ].map(({ label, term }) => (
              <button
                key={term}
                onClick={() => quickSearch(term)}
                className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-[#003f87] hover:text-white font-medium whitespace-nowrap transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:border-[#003f87] text-sm font-medium text-gray-700 transition-all"
        >
          <span>⚙️</span>
          Filters {showFilters ? "▲" : "▼"}
        </button>

        {showFilters && (
          <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-[#003f87] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] transition-all"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-[#ff6b35] focus:ring-1 focus:ring-[#ff6b35] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Campus
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {campuses.map((campus) => (
                  <label
                    key={campus}
                    className="flex items-center gap-2 text-xs text-gray-700 hover:bg-gray-50 p-1.5 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCampuses.includes(campus)}
                      onChange={() => handleCampusToggle(campus)}
                      className="w-4 h-4 text-[#003f87] rounded focus:ring-[#ff6b35]"
                    />
                    <span>{campus}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedCampuses.includes("All Campuses") && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedCampuses.map((campus) => (
              <button
                key={campus}
                onClick={() => removeCampusFilter(campus)}
                className="px-3 py-1 bg-blue-100 text-[#003f87] border border-[#003f87] rounded-full text-xs font-bold hover:bg-red-100 hover:text-red-700 hover:border-red-700 transition-all"
              >
                {campus} ✕
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Listings Grid - Marketplace Style */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-10 h-10 border-4 border-[#003f87] border-t-[#ff6b35] rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-3 text-sm">Loading...</p>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-gray-600 font-medium">Be the first to list an item today !!</p>
            <p className="text-sm text-gray-500 mt-1">Try different filters</p>
          </div>
        ) : (
          <>
            {/* Item Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{visibleItems.length}</span> items
              </p>
              {activeStudentsCount > 0 && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {activeStudentsCount} active
                </p>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {visibleItems.map((item) => {
                const thumb = item.imageUrls?.[0];
                const timeAgo = item.createdAt ? 
                  Math.floor((Date.now() - item.createdAt.toMillis()) / (1000 * 60 * 60)) : 0;

                return (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className="block bg-white rounded-xl border border-gray-200 hover:border-[#ff6b35] hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-100">
                      {thumb ? (
                        <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-4xl">📦</div>
                      )}
                      {/* Condition Badge */}
                      {item.condition && (
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700">
                          {item.condition}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">{item.title}</p>
                      <p className="text-[#ff6b35] font-black text-lg mt-1">${item.price}</p>
                      
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span className="truncate">{item.category}</span>
                        {timeAgo < 24 && (
                          <span className="text-green-600 font-medium">{timeAgo}h ago</span>
                        )}
                      </div>

                      {item.campus && (
                        <p className="mt-2 text-xs text-gray-600 truncate">@{item.campus.split(' ')[0]}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>
          <strong className="text-[#003f87]">Disclaimer:</strong> CUNYswap is student-led and not affiliated with CUNY.
        </p>
      </div>
    </div>
  );
}
