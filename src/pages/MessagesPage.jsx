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
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6 text-align:justify">Your Messages</h1>

        {loadingConvos && (
          <p className="text-gray-500 text-sm">Loading conversations...</p>
        )}

        {convoError && (
          <p className="text-sm text-red-500 mb-2">
            {convoError}
          </p>
        )}

        {!loadingConvos && !convoError && conversations.length === 0 && (
          <p className="text-gray-600 text-sm">
            You have no conversations yet. Use <b>“Message seller”</b> on a
            listing to start one.
          </p>
        )}

        {!loadingConvos && !convoError && conversations.length > 0 && (
          <ul className="space-y-4">
            {/* ---  I just ADDED: sort conversations so newest (lastMessageAt) is on top --- */}
            {[...conversations]
              .sort((a, b) => {
                const aTime = a.lastMessageAt?.toDate?.() || 0;
                const bTime = b.lastMessageAt?.toDate?.() || 0;
                return bTime - aTime; // this is going to make newest come first
              })
              .map((conv) => {
                const otherName = getOtherName(conv);
                const ts = conv.lastMessageAt?.toDate
                  ? conv.lastMessageAt.toDate()
                  : null;

                return (
                  <li
                    key={conv.id}
                    className="p-4 border rounded-2xl hover:bg-gray-50 transition"
                  >
                    <Link to={`/messages/${conv.id}`} className="block">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h2 className="text-lg font-semibold text-gray-900 flex-1">
                          {conv.itemTitle || "Conversation"}
                        </h2>
                        {conv.itemCampus && (
                          <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                            📍 {conv.itemCampus}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        With {otherName || "Student"}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {conv.lastMessage}
                        </p>
                      )}
                      {ts && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          Last updated: {ts.toLocaleString()}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    );
  }

  // 🔹 MODE 2: /messages/:conversationId → show single chat
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-[70vh]">
        {/* this is the Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => navigate("/messages")}
            className="text-xs text-gray-500 hover:text-pink-500 mb-2 inline-block"
          >
            ← Back to messages
          </button>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {currentConversation?.itemTitle || "Conversation"}
              </p>
              <p className="text-xs text-gray-500">
                Chat with {getOtherName(currentConversation)}
              </p>
            </div>
            
            {currentConversation?.itemCampus && (
              <div className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                <span className="text-sm">📍</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-medium leading-tight">Meetup at</span>
                  <span className="text-xs font-bold text-purple-700 leading-tight">
                    {currentConversation.itemCampus}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* this is the Messages */}
        <div className="flex-1 px-4 py-4 overflow-y-auto bg-white">
          {loadingMessages && (
            <p className="text-sm text-gray-500">Loading messages…</p>
          )}

          {!loadingMessages && messages.length === 0 && (
            <p className="text-sm text-gray-500">
              No messages yet. Say hi 👋
            </p>
          )}

          {messages.map((msg) => {
  const isMe = msg.senderId === user.uid;

         return (
                  <div
                    key={msg.id}
                    className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                        isMe
                          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p>{msg.text}</p>

                      {/* just added timestamp */}
                      <p className="text-[10px] opacity-60 mt-1 text-right">
                        {formatTimestamp(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
        </div>
        {/* this for the Input */}
        <form
          onSubmit={handleSend}
          className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type a message…"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="flex-1 rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold px-4 py-2 disabled:opacity-60"
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