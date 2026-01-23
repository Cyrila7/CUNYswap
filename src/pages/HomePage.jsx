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
      {/* Hero Section - Optimized for Mobile */}
      <section className="max-w-6xl mx-auto px-4 pt-4 sm:pt-8 pb-3 sm:pb-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-3 sm:mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              <span className="font-bold text-[#003f87]">{activeStudentsCount}</span> students active today
            </span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-[#003f87] font-serif mb-2 sm:mb-3 leading-tight">
            Find deals from students
            <span className="block mt-1 sm:mt-2 text-2xl sm:text-4xl bg-gradient-to-r from-[#ff6b35] to-[#003f87] bg-clip-text text-transparent">
              across CUNY campuses
            </span>
          </h1>

          <p className="mt-2 sm:mt-3 text-gray-600 text-sm sm:text-lg font-medium max-w-2xl mx-auto">
            Buy & sell textbooks, electronics, furniture, and more from verified CUNY students
          </p>
        </div>

        {/* Search Bar with Integrated Filters */}
        <div className="mt-4 sm:mt-6 bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-3 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0">
            <form onSubmit={handleSearch} className="flex items-center gap-2 sm:gap-3 flex-1">
              <div className="flex items-center flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 focus-within:border-[#ff6b35] focus-within:ring-2 sm:focus-within:ring-4 focus-within:ring-orange-100 transition-all">
                <span className="text-gray-400 text-xl sm:text-2xl mr-2 sm:mr-3">🔍</span>
                <input
                  type="text"
                  placeholder="Search textbooks, electronics, furniture…"
                  className="flex-1 bg-transparent outline-none text-sm sm:text-base text-gray-800 placeholder:text-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="hidden sm:inline-flex px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] hover:from-[#ff5722] hover:to-[#ff6b35] text-white text-base font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Search
              </button>
            </form>

            {/* Filters button - attached to search area */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-[#003f87] hover:bg-blue-50 text-xs sm:text-sm font-bold text-gray-700 shadow-md transition-all shrink-0"
            >
              <span className="text-base sm:text-lg">⚙️</span>
              <span className="hidden sm:inline">Filters</span>
              {showFilters ? " ▲" : " ▼"}
            </button>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
            <span className="text-gray-500 font-medium mr-1">Quick:</span>
            {[
              { label: "📚 Textbooks", term: "textbooks" },
              { label: "💻 Electronics", term: "electronics" },
              { label: "👕 Clothing", term: "clothing" },
              { label: "🎁 Free Stuff", term: "free" }
            ].map(({ label, term }) => (
              <button
                key={term}
                onClick={() => quickSearch(term)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-50 to-orange-50 text-[#003f87] hover:from-[#003f87] hover:to-[#ff6b35] hover:text-white font-semibold border border-gray-200 hover:border-transparent transition-all transform hover:scale-105"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {(selectedCategory !== "All" ||
          minPrice ||
          maxPrice ||
          !selectedCampuses.includes("All Campuses")) && (
          <div className="mt-3 text-xs sm:text-sm text-[#ff6b35] font-bold flex items-center gap-1">
            <span className="text-base sm:text-lg">✓</span> Filters active
          </div>
        )}

        {showFilters && (
          <div className="mt-4 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#003f87] mb-3">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
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

            <div>
              <label className="block text-sm font-bold text-[#003f87] mb-3">
                Price Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-32 px-4 py-2.5 rounded-xl border-2 border-gray-300 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-[#ff6b35] transition-all"
                />
                <span className="text-gray-400 font-bold">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-32 px-4 py-2.5 rounded-xl border-2 border-gray-300 text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-[#ff6b35] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#003f87] mb-3">
                Campus
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {campuses.map((campus) => (
                  <label
                    key={campus}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:bg-blue-50 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCampuses.includes(campus)}
                      onChange={() => handleCampusToggle(campus)}
                      className="w-5 h-5 text-[#003f87] rounded focus:ring-[#ff6b35] focus:ring-2 cursor-pointer"
                    />
                    <span className="font-medium">{campus}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedCampuses.includes("All Campuses") && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCampuses.map((campus) => (
              <button
                key={campus}
                onClick={() => removeCampusFilter(campus)}
                className="px-4 py-2 bg-blue-100 text-[#003f87] border-2 border-[#003f87] rounded-full text-sm font-bold hover:bg-red-100 hover:text-red-700 hover:border-red-700 transition-all transform hover:scale-105"
              >
                📍 {campus} ✕
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Just Listed Section */}
      {justListedItems.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold text-[#003f87] flex items-center gap-2">
                <span className="text-3xl">⚡</span>
                Just Listed
              </h2>
              <p className="text-sm text-gray-600 mt-1">Fresh deals posted by students</p>
            </div>
            <Link 
              to="/browse" 
              className="text-sm font-bold text-[#ff6b35] hover:text-[#003f87] flex items-center gap-1 transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 pb-4">
            <div className="flex gap-4 min-w-max">
              {justListedItems.map((item) => {
                const thumb = item.imageUrls?.[0];
                const timeAgo = item.createdAt ? 
                  Math.floor((Date.now() - item.createdAt.toMillis()) / (1000 * 60 * 60)) : 0;
                
                return (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className="block bg-white rounded-2xl border-2 border-gray-200 hover:border-[#ff6b35] hover:shadow-2xl transition-all transform hover:scale-105 w-64 flex-shrink-0"
                  >
                    <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl overflow-hidden">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
                          📦
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-[#c0f542] text-[#003f87] px-3 py-1 rounded-full text-xs font-black shadow-lg">
                        NEW
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                        {timeAgo === 0 ? 'Just now' : `${timeAgo}h ago`}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-base line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-[#ff6b35] font-black text-xl mt-1">${item.price}</p>
                      
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="bg-blue-50 text-[#003f87] px-2 py-1 rounded-full font-semibold">
                          {item.category}
                        </span>
                        <span className="text-gray-500 font-medium">
                          @{item.userName || "student"}
                        </span>
                      </div>

                      {item.campus && (
                        <p className="mt-2 text-xs text-gray-600 font-medium flex items-center gap-1">
                          <span>📍</span> {item.campus}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Listings Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#003f87]">
            All Listings
            <span className="ml-3 text-base font-normal text-gray-500">
              ({visibleItems.length} items)
            </span>
          </h2>
        </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-[#003f87] border-t-[#ff6b35] rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4 font-medium">Loading amazing deals…</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {visibleItems.map((item) => {
          const thumb = item.imageUrls?.[0];
          const views = Math.floor(Math.random() * 50) + 5; // Mock data - replace with real views later
          const timeAgo = item.createdAt ? 
            Math.floor((Date.now() - item.createdAt.toMillis()) / (1000 * 60 * 60)) : 0;

          return (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="block bg-white rounded-2xl border-2 border-gray-200 hover:border-[#ff6b35] hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden group"
            >
              <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-5xl">
                    📦
                  </div>
                )}
                {/* Social proof badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-700 flex items-center gap-1 shadow-md">
                    <span>👁️</span> {views}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                  {timeAgo === 0 ? 'Just now' : timeAgo < 24 ? `${timeAgo}h ago` : `${Math.floor(timeAgo/24)}d ago`}
                </div>
              </div>

              <div className="p-4">
                <h2 className="font-bold text-gray-900 text-base line-clamp-2 group-hover:text-[#ff6b35] transition-colors">
                  {item.title}
                </h2>
                <p className="text-[#ff6b35] font-black text-2xl mt-2">${item.price}</p>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="bg-gradient-to-r from-blue-50 to-orange-50 text-[#003f87] px-3 py-1 rounded-full font-bold border border-gray-200">
                    {item.category}
                  </span>
                  <span className="text-gray-600 font-semibold">
                    @{item.userName || "student"}
                  </span>
                </div>

                {item.campus && (
                  <p className="mt-3 text-xs text-gray-600 font-semibold flex items-center gap-1 bg-gray-50 px-2 py-1.5 rounded-lg">
                    <span>📍</span> {item.campus}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      </section>

      <div className="mt-12 border-t-2 border-gray-200 pt-8 text-center text-sm text-gray-500 max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-sm">
        <p className="font-medium">
          <strong className="text-[#003f87]">Disclaimer:</strong> CUNYswap is an independent, student-led
          platform and is not affiliated with or endorsed by the City University
          of New York (CUNY).
        </p>
      </div>
    </div>
  );
}
