export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-[#003f87] to-[#ff6b35] flex items-center justify-center text-white text-sm font-bold">
              C
            </div>
            <span className="text-gray-900 font-semibold font-serif">
              CUNY<span className="text-[#ff6b35]">swap</span>
            </span>
          </div>

          {/* Center: Links */}
          <div className="flex items-center gap-6 text-gray-600">
            <a href="/" className="hover:text-[#ff6b35] transition-colors">Home</a>
            <a href="/browse" className="hover:text-[#ff6b35] transition-colors">Browse</a>
            <a href="/faq" className="hover:text-[#ff6b35] transition-colors">FAQ</a>
          </div>

          {/* Right: Copyright */}
          <div className="text-gray-500">
            © {new Date().getFullYear()} CUNYswap
          </div>
        </div>
      </div>
    </footer>
  );
}
