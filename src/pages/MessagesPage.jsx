import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { sendMessageNotification } from "../lib/notifications";
import { Link, useParams, useNavigate } from "react-router-dom";

function formatTimestamp(ts) {
  if (!ts?.toDate) return "";

  const date = ts.toDate();
  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (isYesterday) {
    return "Yesterday, " + date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleString();
}


export default function MessagesPage() {
  const { user } = useAuth();
  const { conversationId } = useParams(); // /messages or /messages/:conversationId
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [convoError, setConvoError] = useState("");

  // Load all conversations this user is in
  useEffect(() => {
    if (!user) return;

    // simpler query to avoid Firestore index issues for now
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
      // if you want orderBy later, we can add index
      // orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setConversations(list);
        setLoadingConvos(false);
      },
      (error) => {
        console.error("Conversations error:", error);
        setConvoError(error.message);
        setLoadingConvos(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Load single conversation + its messages when conversationId is in URL
  useEffect(() => {
    if (!conversationId || !user) {
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    const convoRef = doc(db, "conversations", conversationId);
    const unsubConvo = onSnapshot(convoRef, (snap) => {
      if (snap.exists()) {
        setCurrentConversation({ id: snap.id, ...snap.data() });
      } else {
        setCurrentConversation(null);
      }
    });

    const msgsRef = collection(db, "conversations", conversationId, "messages");
    const msgsQuery = query(msgsRef, orderBy("createdAt", "asc"));

    const unsubMsgs = onSnapshot(
      msgsQuery,
      (snap) => {
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(list);
        setLoadingMessages(false);
      },
      (error) => {
        console.error("Messages error:", error);
        setLoadingMessages(false);
      }
    );

    return () => {
      unsubConvo();
      unsubMsgs();
    };
  }, [conversationId, user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !conversationId || !user) return;

    const text = newMsg.trim();
    setNewMsg("");

    const msgsRef = collection(db, "conversations", conversationId, "messages");
    await addDoc(msgsRef, {
      text,
      senderId: user.uid,
      senderName: user.displayName || user.email || "You",
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
    });
    // this will send email notification
    try {
      const recipientEmail = currentConversation.buyerId === user.uid
      ? currentConversation.sellerEmail
      : currentConversation.buyerEmail;

    const recipientName = getOtherName(currentConversation);

    if (recipientEmail) {
      sendMessageNotification({
        recipientEmail,
        recipientName,
        senderName: user.displayName || user.email?.split('@')[0] || 'Someone',
        messagePreview: text,
        itemTitle: currentConversation.itemTitle,
        conversationId
      }).then(success => {
        if (success) console.log('✅ Email sent to', recipientEmail);
      }).catch(err => console.warn('⚠️ Email failed:', err));
    }
  } catch (err) {
    console.error('⚠️ Notification error:', err);
  }
  };

  const getOtherName = (conv) => {
    if (!user || !conv) return "Student";
    if (conv.buyerId === user.uid) return conv.sellerName || "Seller";
    if (conv.sellerId === user.uid) return conv.buyerName || "Buyer";
    return "Student";
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-600">Please log in to view your messages.</p>
      </div>
    );
  }

  // 🔹 MODE 1: /messages → show list of conversations
  if (!conversationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Messages</h1>
          <p className="text-sm text-gray-600 mb-6">Chat with other CUNY students</p>

        {loadingConvos && (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-[#003f87] border-t-[#ff6b35] rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm mt-2">Loading...</p>
          </div>
        )}

        {convoError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-600">{convoError}</p>
          </div>
        )}

        {!loadingConvos && !convoError && conversations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-900 font-medium mb-1">No messages yet</p>
            <p className="text-sm text-gray-600">
              Click "Message seller" on any listing to start chatting
            </p>
          </div>
        )}

        {!loadingConvos && !convoError && conversations.length > 0 && (
          <div className="space-y-2">
            {[...conversations]
              .sort((a, b) => {
                const aTime = a.lastMessageAt?.toDate?.() || 0;
                const bTime = b.lastMessageAt?.toDate?.() || 0;
                return bTime - aTime;
              })
              .map((conv) => {
                const otherName = getOtherName(conv);
                const ts = conv.lastMessageAt?.toDate
                  ? conv.lastMessageAt.toDate()
                  : null;

                return (
                  <Link
                    key={conv.id}
                    to={`/messages/${conv.id}`}
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-[#ff6b35] hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-gray-900 truncate mb-1">
                          {conv.itemTitle || "Conversation"}
                        </h2>
                        <p className="text-sm text-gray-600 mb-1">
                          {otherName || "Student"}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {conv.lastMessage}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {ts && (
                          <p className="text-xs text-gray-400">
                            {formatTimestamp(conv.lastMessageAt)}
                          </p>
                        )}
                        {conv.itemCampus && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#003f87] rounded-full font-medium">
                            📍 {conv.itemCampus.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
        </div>
      </div>
    );
  }

  // 🔹 MODE 2: /messages/:conversationId → show single chat
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[75vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => navigate("/messages")}
            className="text-sm text-gray-600 hover:text-[#ff6b35] mb-2 inline-flex items-center gap-1 font-medium transition-colors"
          >
            ← Back
          </button>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {currentConversation?.itemTitle || "Conversation"}
              </h1>
              <p className="text-sm text-gray-600">
                {getOtherName(currentConversation)}
              </p>
            </div>
            
            {currentConversation?.itemCampus && (
              <div className="flex-shrink-0 text-xs px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#003f87] rounded-lg font-medium">
                📍 {currentConversation.itemCampus}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          {loadingMessages && (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-4 border-[#003f87] border-t-[#ff6b35] rounded-full animate-spin"></div>
            </div>
          )}

          {!loadingMessages && messages.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              <p className="text-2xl mb-2">👋</p>
              <p>No messages yet. Say hi!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;

            return (
              <div
                key={msg.id}
                className={`mb-3 flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                    isMe
                      ? "bg-gradient-to-r from-[#003f87] to-[#0052b3] text-white"
                      : "bg-gray-100 text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <p className={`text-xs mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                    {formatTimestamp(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] transition-all"
          />
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ff8c5a] text-white text-sm font-bold px-5 py-2.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMsg.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}



// The MessagesPage component provides a messaging interface for users.
// It supports two modes: viewing a list of conversations and viewing a single conversation thread.
// Real-time updates are handled using Firestore's onSnapshot for both conversations and messages.
// Users can send new messages, which are added to the Firestore database and update the conversation's last message info.
// THIS FOR GIT SELF REVIEW PURPOSES ONLY
// I have added sorting of conversations by lastMessageAt timestamp to ensure the most recent conversations appear first.
// This improves the user experience by making it easier to find and continue recent conversations.
// I added time stamps to each message to provide context on when messages were sent.
// DO NOT DELETE THIS COMMENT.