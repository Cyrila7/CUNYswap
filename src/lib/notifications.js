// 📧 Helper function to send email notifications when someone receives a message
// Call this from your MessagesPage when a new message is sent

/**
 * Sends an email notification to a user when they receive a new message
 * 
 * @param {Object} params - Notification parameters
 * @param {string} params.recipientEmail - Email of the person receiving notification
 * @param {string} params.recipientName - Name of the person receiving notification
 * @param {string} params.senderName - Name of the person who sent the message
 * @param {string} params.messagePreview - Preview of the message (first 100 chars)
 * @param {string} params.itemTitle - Title of the item being discussed (optional)
 * @param {string} params.conversationId - ID of the conversation
 * 
 * @returns {Promise<boolean>} - Returns true if notification sent successfully
 * 
 * @example
 * // Send notification when someone messages you
 * await sendMessageNotification({
 *   recipientEmail: 'buyer@buffalostate.edu',
 *   recipientName: 'John',
 *   senderName: 'Sarah',
 *   messagePreview: 'Hey! Is this item still available?',
 *   itemTitle: 'Calculus Textbook',
 *   conversationId: 'abc123'
 * });
 */
export async function sendMessageNotification({
  recipientEmail,
  recipientName,
  senderName,
  messagePreview,
  itemTitle,
  conversationId
}) {
  try {
    console.log('🔔 Attempting to send notification to:', recipientEmail);
    
    // Truncate message preview to 100 characters
    const preview = messagePreview?.length > 100 
      ? messagePreview.substring(0, 100) + '...' 
      : messagePreview;

    const payload = {
      recipientEmail,
      recipientName,
      senderName,
      messagePreview: preview,
      itemTitle,
      conversationId
    };
    
    console.log('📤 Sending payload:', payload);

    // Use production URL if available, otherwise localhost
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/notify-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send notification:', error);
      return false;
    }

    console.log('✅ Email notification sent to:', recipientEmail);
    return true;
    
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
}

/**
 * Sends notification to admin when a new user joins CUNYswap
 * 
 * @param {Object} params - User information
 * @param {string} params.userEmail - Email of the new user
 * @param {string} params.userName - Name of the new user (optional)
 * @param {number} params.timestamp - When they joined (optional)
 * 
 * @returns {Promise<boolean>} - Returns true if notification sent successfully
 * 
 * @example
 * // Call this after successful email verification
 * await notifyAdminNewUser({
 *   userEmail: 'newstudent@login.cuny.edu',
 *   userName: 'John Doe',
 *   timestamp: Date.now()
 * });
 */
export async function notifyAdminNewUser({
  userEmail,
  userName,
  timestamp
}) {
  try {
    console.log('🔔 Notifying admin of new user:', userEmail);

    const payload = {
      userEmail,
      userName,
      timestamp: timestamp || Date.now()
    };
    
    console.log('📤 Sending admin notification payload:', payload);

    // Use production URL if available, otherwise localhost
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/notify-new-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to send admin notification:', error);
      return false;
    }

    console.log('✅ Admin notified of new user:', userEmail);
    return true;
    
  } catch (error) {
    console.error('❌ Error notifying admin:', error);
    // Don't throw - we don't want to break user registration if notification fails
    return false;
  }
}

/**
 * IMPORTANT NOTES FOR IMPLEMENTATION:
 * 
 * 1. You need to store user emails in your Firestore conversations collection
 *    so you know who to notify. Add these fields when creating a conversation:
 *    - buyerEmail
 *    - sellerEmail
 * 
 * 2. Call this function AFTER successfully sending a message in MessagesPage.jsx:
 * 
 *    const handleSend = async (e) => {
 *      e.preventDefault();
 *      // ... your existing message sending code ...
 *      
 *      // 📧 Send email notification to the recipient
 *      const recipientId = currentConversation.buyerId === user.uid 
 *        ? currentConversation.sellerId 
 *        : currentConversation.buyerId;
 *      
 *      const recipientEmail = currentConversation.buyerId === user.uid
 *        ? currentConversation.sellerEmail
 *        : currentConversation.buyerEmail;
 *      
 *      const recipientName = getOtherName(currentConversation);
 *      
 *      await sendMessageNotification({
 *        recipientEmail: recipientEmail,
 *        recipientName: recipientName,
 *        senderName: user.displayName || user.email,
 *        messagePreview: text,
 *        itemTitle: currentConversation.itemTitle,
 *        conversationId: conversationId
 *      });
 *    };
 * 
 * 3. OPTIONAL: Add a user preference to disable notifications (Phase 2)
 *    Store in user document: { emailNotifications: true/false }
 */
