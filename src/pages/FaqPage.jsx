import React, { useState } from "react";

const faqs = [
  {
    q: "What is CUNYswap?",
    a: "CUNYswap is a campus-only marketplace where CUNY students can buy, sell, and trade items safely with other students across all CUNY campuses.",
  },
  {
    q: "Who can use CUNYswap?",
    a: "CUNYswap is for current CUNY students only. You must have a valid @login.cuny.edu email to create an account.",
  },
  {
    q: "How do I sign up?",
    a: "Click Sign Up and register with your @login.cuny.edu email. Check your inbox for a verification link to finish creating your account.",
  },
  {
    q: "Do I need my school email to use CUNYswap?",
    a: "Yes. You must sign up with a valid @login.cuny.edu email to keep the platform safe and student-only.",
  },
  {
    q: "How do I post an item for sale?",
    a: "Once logged in, click Sell, choose a category, select your campus, add photos, set a price, and write a short description. Then publish your listing.",
  },
  {
    q: "Can I buy from students at other CUNY campuses?",
    a: "Yes! CUNYswap connects all CUNY students across all campuses. You can filter listings by specific campuses to find items near you, or browse all campuses if you're willing to travel.",
  },
  {
    q: "Where do meetups happen?",
    a: "All meetups should happen on campus in busy, public locations for safety, such as the library lobby, student union, or dining hall entrance. When posting an item, select your campus so buyers know where to meet.",
  },
  {
    q: "Does CUNYswap handle payments?",
    a: "No. Payments are done student-to-student using your preferred method (cash, Cash App, Venmo, Zelle, etc.). CUNYswap does not process or hold money at the moment.",
  },
  {
    q: "Can I list services (hair, nails, tutoring, etc.)?",
    a: "Not right now. For safety reasons, CUNYswap currently focuses on buying and selling physical items only.",
  },
  {
    q: "What items are NOT allowed?",
    a: [
      "Alcohol, tobacco, vaping products, or drugs",
      "Weapons or anything that could be used as a weapon",
      "Stolen, fake, or counterfeit items",
      "University property (keys, IDs, access cards, furniture that belongs to the school)",
      "Anything illegal or against campus policies",
    ],
    isList: true,
  },
  {
    q: "How do I contact a seller?",
    a: "Once logged in, open the item and use the Message Seller button to chat directly through the built-in messaging system.",
  },
  {
    q: "What if a user is sketchy or violates the rules?",
    a: "Use the Report option on their listing or profile. Serious or repeated violations may result in suspension or a permanent ban.",
  },
  {
    q: "What if I feel unsafe at a meetup?",
    a: "You can cancel the meetup at any time. Only meet in public, well-lit campus locations, and consider bringing a friend. If someone makes you uncomfortable, block and report them immediately.",
  },
  {
    q: "Are sales final?",
    a: "Yes. CUNYswap does not provide refunds or guarantees. All sales are private agreements between students, so you should carefully check items before you buy.",
  },
  {
    q: "Is CUNYswap free to use?",
    a: "Yes. CUNYswap is free to use for students. There are no listing fees or transaction fees right now.",
  },
  {
    q: "Is CUNYswap affiliated with CUNY?",
    a: "No. CUNYswap is an independent, student-led platform created for campus use. It is not affiliated with, sponsored by, or officially endorsed by CUNY or the City University of New York system. The @login.cuny.edu email is used only to verify that users are students.",
  },
  {
    q: "How can I get help or support?",
    a: "If you have questions or need assistance, email us at cunyswap@gmail.com.",
  },
  {
    q: "Are we allowed to share personal information?",
    a: "For your safety, avoid sharing personal information such as phone numbers, addresses, or social media profiles in public listings or messages. Use the built-in messaging system to communicate securely.",
  }
];


export default function FaqPage() {
  const [openItems, setOpenItems] = useState(new Set([0])); // open first by default
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = (idx) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter((item) => {
    const query = searchQuery.toLowerCase();
    const question = item.q.toLowerCase();
    const answer = item.isList 
      ? item.a.join(" ").toLowerCase() 
      : item.a.toLowerCase();
    return question.includes(query) || answer.includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#003f87] to-[#ff6b35] rounded-3xl shadow-lg mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-xs font-bold tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#003f87] to-[#ff6b35] mb-3 uppercase">
            CUNYSWAP
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight font-serif">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Everything you need to know about CUNYswap.
          </p>

          {/* Search Box */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search questions... (e.g., 'payments', 'meetups', 'email')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff6b35] focus:ring-4 focus:ring-orange-100 transition-all duration-200 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-500">
                Found {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
              </p>
            )}
          </div>
        </div>

        {/* FAQ Card */}
        {filteredFaqs.length > 0 ? (
          <section
            className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden"
            aria-labelledby="faq-title"
          >
            <ul className="divide-y divide-gray-100">
              {filteredFaqs.map((item, originalIdx) => {
                const idx = faqs.indexOf(item);
                const isOpen = openItems.has(idx);
                const panelId = `faq-panel-${idx}`;
                const btnId = `faq-button-${idx}`;

                return (
                  <li key={idx} className="transition-all duration-300 hover:bg-gray-50/40">
                    <button
                      id={btnId}
                      className={`w-full px-6 sm:px-8 py-6 text-left flex items-start justify-between gap-4 transition-all duration-300 group ${
                        isOpen
                          ? "bg-gradient-to-r from-blue-50 to-orange-50"
                          : ""
                      }`}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(idx)}
                    >
                      <span className="flex items-start flex-1">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-white text-sm font-bold mr-4 flex-shrink-0 shadow-md transition-all duration-300 ${
                          isOpen 
                            ? "bg-gradient-to-br from-[#003f87] to-[#ff6b35] scale-110" 
                            : "bg-gradient-to-br from-[#003f87] to-[#0052b3] group-hover:scale-110"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={`text-base sm:text-lg font-semibold transition-colors duration-200 leading-snug font-serif ${
                          isOpen ? "text-transparent bg-clip-text bg-gradient-to-r from-[#003f87] to-[#ff6b35]" : "text-gray-900 group-hover:text-[#ff6b35]"
                        }`}>
                          {item.q}
                        </span>
                      </span>
                      <span
                        className={`flex-shrink-0 w-6 h-6 transition-all duration-300 ${
                          isOpen ? "rotate-180 text-[#ff6b35]" : "text-gray-400 group-hover:text-[#ff6b35]"
                        }`}
                        aria-hidden="true"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 9l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        className="px-6 sm:px-8 pb-6 animate-in slide-in-from-top duration-300"
                      >
                        <div className="ml-12 pl-4 border-l-4 border-[#ff6b35] relative">
                          <div className="absolute -left-[2px] top-0 bottom-0 w-1 bg-gradient-to-b from-[#003f87] to-[#ff6b35] rounded-full"></div>
                          {item.isList ? (
                            <ul className="space-y-3 text-gray-700 leading-relaxed text-sm sm:text-base">
                              {item.a.map((line, i) => (
                                <li key={i} className="flex items-start group/item">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-red-50 mr-3 mt-0.5 flex-shrink-0 group-hover/item:bg-red-100 transition-colors">
                                    <svg
                                      className="w-4 h-4 text-red-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </span>
                                  <span className="text-gray-700 leading-relaxed font-serif">{line}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base font-serif">
                              {item.a}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any questions matching "<span className="font-semibold text-[#ff6b35]">{searchQuery}</span>"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white rounded-lg hover:shadow-lg transition-all"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 text-center bg-white rounded-3xl shadow-lg border border-gray-200 p-10 relative overflow-hidden">
          {/* Decorative gradient circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-orange-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-100 to-blue-100 rounded-full blur-3xl opacity-30"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#003f87] to-[#ff6b35] rounded-2xl mb-5 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight font-serif">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-serif">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help you!
            </p>
            <a
              href="mailto:cunyswap@gmail.com"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-base"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Support
            </a>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-600 flex items-center justify-center gap-2 font-medium">
            <span className="text-2xl">🎓</span>
            <span>Safe trading for CUNY students across all campuses</span>
          </p>
          <p className="mt-2 text-xs text-gray-500 font-normal">
            {filteredFaqs.length === faqs.length 
              ? `${faqs.length} questions answered` 
              : `Showing ${filteredFaqs.length} of ${faqs.length} questions`}
          </p>
        </div>
      </div>
    </div>
  );
}
