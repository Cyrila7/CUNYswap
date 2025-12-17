// 📧 EXAMPLE: How to integrate email notifications into MessagesPage.jsx
// Copy and adapt this code to your actual MessagesPage.jsx

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
import { Link, useParams, useNavigate } from "react-router-dom";
import { sendMessageNotification } from "../lib/notifications"; // ✅ ADD THIS IMPORT

export default function MessagesPage() {
  // ... all your existing state and useEffect hooks ...

  // ✅ MODIFY YOUR handleSend FUNCTION LIKE THIS:
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !conversationId || !user) return;

    const text = newMsg.trim();
    setNewMsg("");

    try {
      // 1️⃣ Send the message to Firestore (your existing code)
      const msgsRef = collection(db, "conversations", conversationId, "messages");
      await addDoc(msgsRef, {
        text,
        senderId: user.uid,
        senderName: user.displayName || user.email || "You",
        createdAt: serverTimestamp(),
      });

      // Update conversation metadata
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
      });

      // 2️⃣ NEW: Send email notification to the recipient
      // Figure out who should receive the notification (not the sender!)
      const isUserTheBuyer = currentConversation.buyerId === user.uid;
      
      const recipientEmail = isUserTheBuyer
        ? currentConversation.sellerEmail  // If I'm the buyer, notify the seller
        : currentConversation.buyerEmail;  // If I'm the seller, notify the buyer

      const recipientName = getOtherName(currentConversation);

      // Only send notification if we have the recipient's email
      if (recipientEmail) {
        // Send notification asynchronously - don't wait for it
        sendMessageNotification({
          recipientEmail: recipientEmail,
          recipientName: recipientName,
          senderName: user.displayName || user.email?.split('@')[0] || 'Someone',
          messagePreview: text,
          itemTitle: currentConversation.itemTitle,
          conversationId: conversationId
        }).then(success => {
          if (success) {
            console.log('✅ Email notification sent to:', recipientEmail);
          }
        }).catch(err => {
          // Don't let notification failures break the app
          console.warn('⚠️ Notification failed (message still sent):', err);
        });
      } else {
        console.warn('⚠️ No recipient email found - notification not sent');
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Show error to user
      alert('Failed to send message. Please try again.');
    }
  };

  // ... rest of your component ...
}


// 📝 NOTES:
// 
// 1. Make sure your conversation document has these fields:
//    - buyerEmail (email of the buyer)
//    - sellerEmail (email of the seller)
//
// 2. You need to add these emails when creating the conversation
//    (see ItemDetailPage.jsx example below)
//
// 3. The notification is sent asynchronously so it doesn't slow down
//    the message sending experience
//
// 4. If the notification fails, the message still sends successfully
//    (we log the error but don't throw it)
