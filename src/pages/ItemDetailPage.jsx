import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import ImageModal from "../components/ImageModal";

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const ref = doc(db, "items", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setErr("Item not found.");
        } else {
          setItem({ id: snap.id, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
        setErr("Failed to load item.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const handleMessageSeller = async () => {
    if (!item) return;

    // If not logged in → go to login and then straight to messages after auth
    if (!user) {
      navigate("/login", { replace: true, state: { redirectTo: "/messages", from: location } });
      return;
    }

    // Don’t let a user message themself; just take them to messages
    if (item.userId === user.uid) {
      navigate("/messages");
      return;
    }

    // If seller id is missing, still go to messages (fallback)
    if (!item.userId) {
      navigate("/messages");
      return;
    }

    // Stable conversation ID: item + both user IDs sorted
    const ids = [user.uid, item.userId].sort();
    const conversationId = `${item.id}_${ids[0]}_${ids[1]}`;

    const convoRef = doc(db, "conversations", conversationId);

    try {
      await setDoc(
        convoRef,
        {
          itemId: item.id,
          itemTitle: item.title,
          itemCampus: item.campus, // Added campus for meetup coordination
          buyerId: user.uid,
          buyerName: user.displayName || "Buyer",
          sellerId: item.userId,
          sellerName: item.userName || "Seller",
          participants: [user.uid, item.userId],
          lastMessage: "",
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          buyerEmail: user.email,
          sellerEmail: item.userEmail,
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Failed to create/open conversation:", e);
      // proceed to messages regardless
    }

    // Go straight to Messages; optionally your Messages page can use state.conversationId to auto-open the thread
    navigate(`/messages/${conversationId}`);
  };

  const handleReport = async () => {
    if (!reportReason) {
      alert("Please select a reason for reporting.");
      return;
    }

    setReportSubmitting(true);

    try {
      // Prepare report data
      const reportData = {
        itemId: item.id,
        itemTitle: item.title,
        sellerId: item.userId,
        sellerName: item.userName || "Unknown",
        reportedBy: user?.uid || "anonymous",
        reportedByName: user?.displayName || user?.email || "Anonymous",
        reason: reportReason,
        details: reportDetails,
        timestamp: new Date().toISOString(),
        status: "pending",
      };

      // Try to save to Firestore (if user is authenticated)
      if (user) {
        try {
          await addDoc(collection(db, "reports"), {
            ...reportData,
            timestamp: serverTimestamp(),
          });
        } catch (firestoreError) {
          console.warn("Firestore save failed, continuing with email notification:", firestoreError);
          // Continue even if Firestore fails - email is the important part
        }
      }

      // Send email notification to admin (always)
      try {
        const response = await fetch('/api/notify-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send notification');
        }
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Show success anyway if at least Firestore worked
        if (!user) {
          throw emailError; // If no Firestore backup, this is critical
        }
      }

      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportReason("");
        setReportDetails("");
      }, 2000);
    } catch (e) {
      console.error("Failed to submit report:", e);
      console.error("Error details:", e.message);
      alert(`Failed to submit report: ${e.message}. Please try again${!user ? ' or sign in for better reliability' : ''}.`);
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-[#003f87] border-t-[#ff6b35] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-bold text-lg">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-2xl shadow-lg border-2 border-red-200 p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-600 font-bold text-xl mb-2">{err}</p>
          <button
            onClick={() => navigate("/browse")}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            ← Back to Browse
          </button>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-[#003f87] hover:text-[#ff6b35] font-bold transition-colors"
        >
          <span className="text-xl">←</span>
          <span>Back to listings</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden grid grid-cols-1 lg:grid-cols-2">

          {/* IMAGE SIDE - Carousel with click to enlarge */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8 relative">
            {item.imageUrls && item.imageUrls.length > 0 ? (
              <>
                {/* Main image */}
                <div className="w-full h-[500px] flex items-center justify-center mb-6 relative group">
                  <img
                    src={item.imageUrls[selectedImageIndex]}
                    alt={`${item.title} ${selectedImageIndex + 1}`}
                    className="max-h-full w-full object-contain rounded-2xl shadow-2xl cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setShowModal(true)}
                    loading="eager"
                    decoding="async"
                    style={{ contentVisibility: 'auto' }}
                  />
                  
                  {/* Click to enlarge hint */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all rounded-2xl pointer-events-none">
                    <span className="text-white text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-4 py-2 rounded-full">
                      🔍 Click to enlarge
                    </span>
                  </div>

                  {/* Navigation arrows (if multiple images) */}
                  {item.imageUrls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => 
                            prev === 0 ? item.imageUrls.length - 1 : prev - 1
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white hover:bg-[#003f87] text-[#003f87] hover:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-all font-bold text-2xl"
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImageIndex((prev) => 
                            (prev + 1) % item.imageUrls.length
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white hover:bg-[#003f87] text-[#003f87] hover:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-all font-bold text-2xl"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail navigation */}
                {item.imageUrls.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-3 w-full justify-center">
                    {item.imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all transform hover:scale-110 ${
                          index === selectedImageIndex
                            ? "border-[#ff6b35] ring-4 ring-orange-200 shadow-lg"
                            : "border-gray-300 hover:border-[#003f87]"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-96 w-full flex items-center justify-center bg-gray-100 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-3">📦</div>
                  <span className="text-gray-400 text-sm font-medium">No images uploaded</span>
                </div>
              </div>
            )}
          </div>

        {/* DETAILS SIDE */}
        <div className="p-8 lg:p-10 flex flex-col relative">
          {/* Report Button - Top Right */}
          {(!user || item.userId !== user.uid) && (
            <button
              onClick={() => setShowReportModal(true)}
              className="absolute top-6 right-6 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shadow-md border-2 border-transparent hover:border-red-200"
              title="Report this listing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </button>
          )}

          <div className="flex items-start justify-between gap-3 mb-4">
            <span className="inline-flex items-center px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-blue-100 to-orange-100 text-[#003f87] border-2 border-[#003f87]">
              📂 {item.category || "General"}
            </span>
            {item.sold && (
              <span className="inline-flex items-center px-4 py-2 text-sm font-black rounded-full bg-red-500 text-white uppercase tracking-wide shadow-lg">
                ⚠️ SOLD
              </span>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-[#003f87] leading-tight">
            {item.title}
          </h1>

          <p className={`font-black text-4xl lg:text-5xl mt-4 ${item.sold ? "text-gray-400 line-through" : "text-[#ff6b35]"}`}>
            ${item.price}
          </p>

          {item.condition && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-[#003f87] self-start">
              <span className="text-lg">✨</span>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 font-medium">Condition</span>
                <span className="text-sm font-black text-[#003f87]">{item.condition}</span>
              </div>
            </div>
          )}

          {/* Campus Location */}
          {item.campus && (
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-[#ff6b35] self-start shadow-md">
              <span className="text-2xl">📍</span>
              <div className="flex flex-col">
                <span className="text-xs text-gray-600 font-medium">Meetup Location</span>
                <span className="text-base font-black text-[#ff6b35]">{item.campus}</span>
              </div>
            </div>
          )}

          {item.description && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <h3 className="text-sm font-bold text-[#003f87] mb-2">Description</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          <div className="mt-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border-2 border-gray-200">
              <div className="w-12 h-12 rounded-full bg-[#003f87] text-white flex items-center justify-center font-black text-xl">
                {(item.userName || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{item.userName || "Unknown"}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-[#c0f542] text-[#003f87] border-2 border-[#003f87]">
                    ✓ Verified
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-medium">CUNY Student Seller</span>
              </div>
            </div>
          </div>

          {/* Message seller - disabled if sold or own item */}
          {(!user || item.userId !== user.uid) && (
            <button
              onClick={handleMessageSeller}
              disabled={item.sold}
              className={`mt-8 w-full inline-flex items-center justify-center gap-2 rounded-2xl text-base font-black px-6 py-4 shadow-xl transition-all transform hover:scale-105 ${
                item.sold
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white hover:shadow-2xl"
              }`}
            >
              {item.sold ? (
                <>
                  <span className="text-xl">🚫</span>
                  <span>Item Already Sold</span>
                </>
              ) : (
                <>
                  <span className="text-xl">💬</span>
                  <span>Message Seller</span>
                </>
              )}
            </button>
          )}

          {/* Safety Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <h4 className="text-sm font-bold text-[#003f87] mb-2 flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              Safety Tips
            </h4>
            <ul className="text-xs text-gray-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-[#c0f542]">•</span>
                <span>Meet in public campus locations (library, student center)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c0f542]">•</span>
                <span>Inspect item before payment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c0f542]">•</span>
                <span>Use cash or secure payment methods</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c0f542]">•</span>
                <span>Trust your instincts - report suspicious listings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      </div>

      {/* Image Modal */}
      {showModal && item.imageUrls && item.imageUrls.length > 0 && (
        <ImageModal
          images={item.imageUrls}
          initialIndex={selectedImageIndex}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border-2 border-gray-200">
            {reportSuccess ? (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-black text-[#003f87] mb-2">Report Submitted</h3>
                <p className="text-sm text-gray-600 font-medium">Thank you. We'll review this report.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-[#003f87]">Report Listing</h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-full transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 font-medium">
                  Help us keep CUNYswap safe by reporting listings that violate our policies.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#003f87] mb-2">
                    Reason for report <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-[#ff6b35] transition-all"
                  >
                    <option value="">Select a reason...</option>
                    <option value="spam">Spam or misleading</option>
                    <option value="scam">Suspected scam</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="prohibited">Prohibited item</option>
                    <option value="duplicate">Duplicate listing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-[#003f87] mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Tell us more about the issue..."
                    rows={3}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-[#ff6b35] transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    disabled={reportSubmitting}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reportSubmitting || !reportReason}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-bold hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                  >
                    {reportSubmitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




