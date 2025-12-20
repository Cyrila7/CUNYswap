#!/usr/bin/env node

// Test script for report notification email
// Run with: node test-report-notification.js

import fetch from 'node-fetch';

const TEST_REPORT = {
  itemId: "test123",
  itemTitle: "Canon EOS Rebel T7 DSLR + Zoom Lens Kit",
  sellerId: "testuser123",
  sellerName: "John Doe",
  reportedBy: "reporter456",
  reportedByName: "Jane Smith",
  reason: "scam",
  details: "This looks like a fake listing. The price is too low and the seller is unresponsive.",
  timestamp: new Date().toISOString()
};

async function testReportNotification() {
  console.log('\n🧪 Testing Report Notification Email...\n');
  console.log('📋 Test Report Data:');
  console.log(JSON.stringify(TEST_REPORT, null, 2));
  console.log('\n');

  try {
    console.log('📤 Sending request to /api/notify-report...');
    
    const response = await fetch('http://localhost:3000/api/notify-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_REPORT),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS! Report notification sent!');
      console.log('📧 Check cunyswap@gmail.com for the email');
      console.log('\nResponse:', data);
    } else {
      console.error('\n❌ FAILED!');
      console.error('Status:', response.status);
      console.error('Error:', data);
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure the backend server is running (node server.js)');
      console.log('   2. Check your .env file has GMAIL_USER and GMAIL_APP_PASSWORD');
      console.log('   3. Verify Gmail App Password is correct');
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   node server.js');
  }

  console.log('\n');
}

testReportNotification();
