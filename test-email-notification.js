// 🧪 TEST EMAIL NOTIFICATION
// Run this to test if your email notification system is working
// Usage: node test-email-notification.js

import fetch from 'node-fetch';

// ⚠️ CHANGE THESE VALUES FOR TESTING:
const TEST_CONFIG = {
  recipientEmail: 'Annohc01@buffalostate.edu',  // ← Change to your email
  recipientName: 'Test User',
  senderName: 'John Doe',
  messagePreview: 'Hey! Is this Calculus textbook still available? I need it for next semester.',
  itemTitle: 'Calculus Textbook - 3rd Edition',
  conversationId: 'test-123'
};

async function testEmailNotification() {
  console.log('🧪 Testing email notification system...\n');
  console.log('📋 Test Configuration:');
  console.log('   Recipient:', TEST_CONFIG.recipientEmail);
  console.log('   Sender:', TEST_CONFIG.senderName);
  console.log('   Item:', TEST_CONFIG.itemTitle);
  console.log('\n⏳ Sending test notification...\n');

  try {
    const response = await fetch('http://localhost:3000/notify-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CONFIG)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS! Email notification sent!');
      console.log('📧 Check your inbox:', TEST_CONFIG.recipientEmail);
      console.log('\n💡 Look for an email with subject:');
      console.log(`   "💬 New message from ${TEST_CONFIG.senderName} on CUNYswap"`);
      console.log('\n✨ If you received it, your email system is working perfectly!');
    } else {
      console.error('❌ FAILED to send notification');
      console.error('Response:', result);
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Make sure server.js is running (node server.js)');
      console.log('   2. Check your .env file has GMAIL_USER and GMAIL_APP_PASSWORD');
      console.log('   3. Verify Gmail App Password is correct (16 digits)');
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Is your server running? (node server.js)');
    console.log('   2. Check if port 3000 is available');
    console.log('   3. Make sure node-fetch is installed: npm install node-fetch');
  }
}

// Run the test
testEmailNotification();
