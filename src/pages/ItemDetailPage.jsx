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
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-gray-500">Loading item...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-red-500 font-medium">{err}</p>
        <button
          onClick={() => navigate("/browse")}
          className="mt-4 px-4 py-2 bg-[#003f87] text-white rounded-lg hover:bg-[#002f67] transition-colors"
        >
          ← Back to Browse
        </button>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* IMAGE SIDE - Carousel with click to enlarge */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-6 relative">
          {item.imageUrls && item.imageUrls.length > 0 ? (
            <>
              {/* Main image */}
              <div className="w-full h-96 flex items-center justify-center mb-4 relative group">
                <img
                  src={item.imageUrls[selectedImageIndex]}
                  alt={`${item.title} ${selectedImageIndex + 1}`}
                  className="max-h-full w-full object-contain rounded-2xl shadow-lg cursor-pointer"
                  onClick={() => setShowModal(true)}
                  loading="eager"
                  decoding="async"
                  style={{ contentVisibility: 'auto' }}
                />
                
                {/* Click to enlarge hint */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl pointer-events-none">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to enlarge
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-md"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail navigation */}
              {item.imageUrls.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 w-full justify-center">
                  {item.imageUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? "border-[#003f87] ring-2 ring-blue-200"
                          : "border-gray-300 hover:border-gray-400"
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
            <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-xl">
              <span className="text-gray-400 text-sm">No images uploaded</span>
            </div>
          )}
        </div>

        {/* DETAILS SIDE */}
        <div className="p-6 md:p-8 flex flex-col relative">
          {/* Report Button - Top Right */}
          {(!user || item.userId !== user.uid) && (
            <button
              onClick={() => setShowReportModal(true)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Report this listing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
            </button>
          )}

          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
              {item.category || "General"}
            </span>
            {item.sold && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-red-500 text-white uppercase tracking-wide">
                SOLD
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>

          <p className={`font-extrabold text-2xl mt-2 ${item.sold ? "text-gray-400 line-through" : "text-[#ff6b35]"}`}>
            ${item.price}
          </p>

          {item.condition && (
            <p className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 self-start">
              Condition: {item.condition}
            </p>
          )}


          {item.description && (
            <p className="mt-4 text-gray-600 text-sm leading-relaxed">
              {item.description}
            </p>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>
              <span className="font-medium text-gray-700">Seller: </span>
              {item.userName || "Unknown"}
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                ✓ Verified
              </span>

              {/* Campus Location */}
          {item.campus && (
            <p className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700 self-start">
              📍 Campus: {item.campus}
            </p>
          )}
          
            </p>
          </div>

          {/* Message seller - disabled if sold or own item */}
          {(!user || item.userId !== user.uid) && (
            <button
              onClick={handleMessageSeller}
              disabled={item.sold}
              className={`mt-8 inline-flex items-center justify-center rounded-xl text-sm font-semibold px-4 py-2 shadow-sm ${
                item.sold
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white hover:shadow-md"
              }`}
            >
              {item.sold ? "Item sold" : "Message seller"}
            </button>
          )}

          {/* Safety Tips */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Safety Tips</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Meet in public campus locations</li>
              <li>• Inspect item before payment</li>
              <li>• Use secure payment methods</li>
              <li>• Report suspicious listings</li>
            </ul>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {reportSuccess ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-3">✓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Report Submitted</h3>
                <p className="text-sm text-gray-600">Thank you. We'll review this report.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Report Listing</h3>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Help us keep CUNYswap safe by reporting listings that violate our policies.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for report <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f87]"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Tell us more about the issue..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f87]"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    disabled={reportSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reportSubmitting || !reportReason}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
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




