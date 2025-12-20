// Remind me to change i dont know if i should put this in the navbar or the footer yet 
{/* AboutPage.jsx */}
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div 
          className={`text-center mb-16 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
          }`}
        >
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-500 mb-6 shadow-2xl animate-pulse">
            <span className="text-white text-4xl font-bold">C</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            About CUNY<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">swap</span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            A trusted campus marketplace built by students, for students.
          </p>
          <div className="mt-8 w-24 h-1 mx-auto bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
        </div>

        {/* Mission Section */}
        <div 
          className={`bg-white rounded-3xl shadow-xl p-10 mb-10 hover:shadow-2xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl animate-bounce">🎯</span>
            <span className="font-serif">Our Mission</span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4 font-light">
            CUNYswap exists to create a <span className="font-semibold text-pink-600">safe, simple, and community-driven</span> marketplace 
            exclusively for CUNY students. We believe buying and selling on campus should be easier, faster, and free from scams — 
            because campus communities deserve platforms built for them, not for strangers.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed font-light">
            Whether you're selling textbooks after finals, searching for affordable furniture, or giving new life to items 
            you no longer need, <span className="font-semibold text-purple-600">CUNYswap connects you with real students</span> across 
            the CUNY system.
          </p>
        </div>

        {/* Why CUNYswap Section */}
        <div 
          className={`bg-white rounded-3xl shadow-xl p-10 mb-10 hover:shadow-2xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">✨</span>
            <span className="font-serif">Why Choose CUNYswap?</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="flex gap-4 group hover:scale-105 transition-transform duration-300">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-3xl">🔐</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Campus-Exclusive Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  Only verified CUNY student emails are allowed — meaning every shopper is a real student.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group hover:scale-105 transition-transform duration-300">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-3xl">⚡</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast & Effortless</h3>
                <p className="text-gray-600 leading-relaxed">
                  Post an item in seconds. Add photos, choose your category, set a price, and you're live.
                </p>
              </div>
            </div>

            <div className="flex gap-4 group hover:scale-105 transition-transform duration-300">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-3xl">🛡️</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Safe & Secure</h3>
                <div className="text-gray-600 space-y-1">
                  <p>✔ Mandatory email verification</p>
                  <p>✔ Encrypted authentication</p>
                  <p>✔ Built-in reporting features</p>
                  <p>✔ On-campus meetups only</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 group hover:scale-105 transition-transform duration-300">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-3xl">♻️</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Eco-Friendly & Budget-Friendly</h3>
                <p className="text-gray-600 leading-relaxed">
                  Give your items a second life, reduce waste, and help other students find what they need at fair prices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div 
          className={`bg-white rounded-3xl shadow-xl p-10 mb-10 hover:shadow-2xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">🚀</span>
            <span className="font-serif">How It Works</span>
          </h2>
          <div className="space-y-8">
            <div className="flex gap-5 items-start group hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Up with Your CUNY Email</h3>
                <p className="text-gray-600 leading-relaxed">
                  Create your account using your valid student email. Verify it, and your account is ready.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start group hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Browse or List Items</h3>
                <p className="text-gray-600 leading-relaxed">
                  Search for what you need or list your own items with photos and descriptions.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start group hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message the Seller</h3>
                <p className="text-gray-600 leading-relaxed">
                  Use CUNYswap's built-in chat to negotiate, ask questions, and coordinate.
                </p>
              </div>
            </div>

            <div className="flex gap-5 items-start group hover:translate-x-2 transition-transform duration-300">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Meet Safely on Campus</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pick a visible, public location (library lobby, student center, etc.) and complete the exchange or you can choose the Contactless pickup and drop off option to ensure your safety.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who Can Use Section */}
        <div 
          className={`bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 rounded-3xl shadow-2xl p-10 mb-10 text-white hover:shadow-3xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-4xl">👥</span>
            <span className="font-serif">Who Can Use CUNYswap?</span>
          </h2>
          <p className="text-lg leading-relaxed mb-6 font-light">
            CUNYswap is exclusively available to students across all CUNY campuses including:
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <p className="text-lg font-medium text-center leading-relaxed">
              Buffalo State University
            </p>
          </div>
          <p className="text-lg leading-relaxed font-light">
            If you're enrolled in the <span className="font-bold">CUNY system</span>, CUNYswap is built for you.
          </p>
        </div>

        {/* Safety & Trust Section */}
        <div 
          className={`bg-white rounded-3xl shadow-xl p-10 mb-10 hover:shadow-2xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">🛡️</span>
            <span className="font-serif">Safety & Trust</span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 font-light">
            CUNYswap prioritizes safety at every step:
          </p>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
              <span className="text-pink-500 font-bold text-2xl">✓</span>
              <span className="text-lg">Email verification required</span>
            </li>
            <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
              <span className="text-pink-500 font-bold text-2xl">✓</span>
              <span className="text-lg">Firebase-secured accounts</span>
            </li>
            <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
              <span className="text-pink-500 font-bold text-2xl">✓</span>
              <span className="text-lg">Scam-prevention through student-only access</span>
            </li>
            <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
              <span className="text-pink-500 font-bold text-2xl">✓</span>
              <span className="text-lg">Reporting tools to flag suspicious users</span>
            </li>
            <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
              <span className="text-pink-500 font-bold text-2xl">✓</span>
              <span className="text-lg">Meetups encouraged only in public campus spaces</span>
            </li>
            <li className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
              <span className="text-pink-500 font-bold text-2xl">✓</span>
              <span className="text-lg">Contactless pickup and drop off options for added safety</span>
            </li>
          </ul>
          <div className="mt-6 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border-l-4 border-pink-500">
            <p className="text-gray-800 font-semibold text-lg">
              Your safety isn't optional — it's the foundation of the entire platform.
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div 
          className={`bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 mb-10 text-white hover:shadow-3xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-4xl">🌅</span>
            <span className="font-serif">Our Vision</span>
          </h2>
          <p className="text-xl leading-relaxed mb-6 font-light">
            We're building the <span className="font-bold">#1 student marketplace in New York</span>, powered entirely by campus communities.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-3">
            <p className="text-lg flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>A marketplace for all <strong>350,000+ CUNY students</strong></span>
            </p>
            <p className="text-lg flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Seamless buying, selling, trading, and eventually <strong>renting</strong></span>
            </p>
            <p className="text-lg flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Campus-to-campus delivery options</span>
            </p>
            <p className="text-lg flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Student store partnerships</span>
            </p>
            <p className="text-lg flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>A safe, verified ecosystem that scales beyond CUNY</span>
            </p>
          </div>
          <p className="text-xl leading-relaxed mt-6 font-semibold text-center">
            CUNYswap isn't just a marketplace — it's a campus economy.
          </p>
        </div>

        {/* Core Values Section */}
        <div 
          className={`bg-white rounded-3xl shadow-xl p-10 mb-10 hover:shadow-2xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '700ms' }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">⭐</span>
            <span className="font-serif">Core Values</span>
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-pink-500 pl-6 py-2 hover:border-pink-600 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">1️⃣ Safety First</h3>
              <p className="text-gray-600 leading-relaxed">
                Students deserve a trusted environment without scams or strangers.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-6 py-2 hover:border-purple-600 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">2️⃣ Community-Driven</h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature is designed for real student needs — not generic marketplaces.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-6 py-2 hover:border-blue-600 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">3️⃣ Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                Clear rules, clear pricing, and no hidden systems.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-6 py-2 hover:border-green-600 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">4️⃣ Simplicity</h3>
              <p className="text-gray-600 leading-relaxed">
                Posting, browsing, and messaging should always be fast and frustration-free.
              </p>
            </div>
            <div className="border-l-4 border-yellow-500 pl-6 py-2 hover:border-yellow-600 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">5️⃣ Sustainability</h3>
              <p className="text-gray-600 leading-relaxed">
                Reusing items reduces waste and saves students money.
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div 
          className={`bg-white rounded-3xl shadow-xl p-10 mb-10 hover:shadow-2xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <span className="text-4xl">🚧</span>
            <span className="font-serif">Roadmap</span>
          </h2>
          <div className="space-y-8">
            <div className="relative pl-8 border-l-4 border-pink-500">
              <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-pink-500 shadow-lg"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 1 — Launch <span className="text-pink-500">(NOW)</span></h3>
              <ul className="text-gray-600 space-y-1">
                <li>• User accounts + verification</li>
                <li>• Posting items</li>
                <li>• Browsing + categories</li>
                <li>• Messaging</li>
                <li>• Safety + reporting system</li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-4 border-purple-500">
              <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-purple-500 shadow-lg"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 2 — Growth</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Campus-specific communities</li>
                <li>• Push notifications</li>
                <li>• Saved items + wishlists</li>
                <li>• Improved seller profiles</li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-4 border-blue-500">
              <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-blue-500 shadow-lg"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 3 — Expansion</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• CUNY-wide marketplace view</li>
                <li>• Student-to-student rental system</li>
                <li>• Buy-back programs</li>
                <li>• Optional ID verification</li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-4 border-green-500">
              <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-green-500 shadow-lg"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 4 — Campus Partnerships</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Work with campus bookstores & student government</li>
                <li>• Build official campus marketplace hubs</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-700 font-semibold mt-8 text-center text-lg">
            CUNYswap will grow with the students who use it.
          </p>
        </div>

        {/* Founder Story Section */}
        <div 
          className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-10 mb-10 text-white hover:shadow-3xl transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="text-4xl">👤</span>
            <span className="font-serif">Founder Story</span>
          </h2>
          <div className="space-y-4 text-lg leading-relaxed font-light">
            <p>
              CUNYswap was created by <span className="font-bold text-pink-400">Cyril</span>, a CUNY student who experienced 
              the same frustrations every student deals with:
            </p>
            <ul className="space-y-2 pl-6">
              <li className="flex items-start gap-3">
                <span className="text-pink-400">•</span>
                <span>Buying overpriced textbooks</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-400">•</span>
                <span>Getting scammed on Facebook Marketplace</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-400">•</span>
                <span>Having no safe way to sell used items to fellow students</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-400">•</span>
                <span>Wanting a simple, student-only community</span>
              </li>
            </ul>
            <p>
              Instead of dealing with unreliable apps and strangers from Craigslist or FB Marketplace, 
              Cyril built a platform designed for the real needs of CUNY students — <span className="font-bold">verified, safe, and campus-first</span>.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-6">
              <p className="text-xl font-semibold text-center">
                CUNYswap started as a personal project, but quickly became a mission:<br/>
                <span className="text-pink-400">to give every CUNY student a trusted marketplace built just for them.</span>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div 
          className={`bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-12 text-center text-white hover:scale-105 transition-all duration-500 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <h2 className="text-4xl font-bold mb-4 font-serif">🚀 Ready to Start Trading?</h2>
          <p className="text-xl mb-2 font-light">
            Join thousands of CUNY students already buying, selling, and swapping across campus.
          </p>
          <p className="text-lg text-white/90 mb-8 font-light">
            🎓 It's free, fast, and built for students like you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-2xl bg-white text-purple-600 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
            >
              ➡️ Sign Up Now
            </Link>
            <Link
              to="/browse"
              className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold text-lg shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              ➡️ Browse Items
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div 
          className={`mt-12 text-center transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '1100ms' }}
        >
          <p className="text-gray-600 mb-2 text-lg font-light">Have questions or feedback?</p>
          <p className="text-gray-500">
            Check out our <Link to="/faq" className="text-pink-600 hover:text-purple-600 font-semibold hover:underline transition-colors">FAQ page</Link> or 
            reach out through our support channels.
          </p>
        </div>
      </div>
    </div>
  );
}
