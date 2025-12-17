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
    "Dorm Supplies",
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 bg-gray-50">
      <section>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent text-center font-serif drop-shadow-sm">
          Campus Marketplace
        </h1>

        <p className="mt-2 text-gray-600 text-center font-medium italic">
          A trusted marketplace for CUNY students.
        </p>

        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            ✅ Verified CUNY Student Listings
          </span>
        </div>

        <div className="mt-6 bg-white rounded-3xl shadow-lg border border-gray-100 p-4 sm:p-5">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex items-center flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100">
              <span className="text-gray-400 text-xl mr-2">🔍</span>
              <input
                type="text"
                placeholder="Search textbooks, electronics, furniture…"
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="hidden sm:inline-flex px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm font-semibold shadow-sm"
            >
              Search
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-gray-400 mr-1">Quick tags:</span>
            {["textbooks", "electronics", "clothing", "dorm"].map((tag) => (
              <button
                key={tag}
                onClick={() => quickSearch(tag)}
                className="px-3 py-1 rounded-full bg-slate-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-pink-300 hover:bg-pink-50 text-sm font-medium text-gray-700 shadow-sm"
          >
            Filters
          </button>

          {(selectedCategory !== "All" ||
            minPrice ||
            maxPrice ||
            !selectedCampuses.includes("All Campuses")) && (
            <span className="text-xs text-blue-700 font-semibold">
              Filters applied
            </span>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 bg-white rounded-2xl shadow-md border border-gray-200 p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-medium ${
                      selectedCategory === cat
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-sky-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Campus
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {campuses.map((campus) => (
                  <label
                    key={campus}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCampuses.includes(campus)}
                      onChange={() => handleCampusToggle(campus)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-400"
                    />
                    {campus}
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
                className="px-3 py-1.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-medium hover:bg-blue-200"
              >
                📍 {campus}
              </button>
            ))}
          </div>
        )}
      </section>

      {loading && (
        <p className="text-slate-500 mt-8 animate-pulse">
          Loading listings…
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {visibleItems.map((item) => {
          const thumb = item.imageUrls?.[0];
          return (
            <Link
              key={item.id}
              to={`/item/${item.id}`}
              className="block bg-white p-4 rounded-2xl border border-gray-200 hover:border-pink-300 hover:shadow-lg transition group"
            >
              <div className="h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <h2 className="font-semibold text-gray-800 group-hover:text-pink-600 transition">
                {item.title}
              </h2>
              <p className="text-pink-600 font-bold mt-1">${item.price}</p>

              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{item.category}</span>
                <span>@{item.userName || "unknown"}</span>
              </div>

              {item.campus && (
                <p className="mt-2 text-xs text-gray-600">
                  📍 {item.campus}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-10 border-t pt-6 text-center text-xs text-slate-500 max-w-3xl mx-auto">
        <p>
          <strong>Disclaimer:</strong> CUNYswap is an independent, student-led
          platform and is not affiliated with or endorsed by the City University
          of New York (CUNY).
        </p>
      </div>
    </div>
  );
}
