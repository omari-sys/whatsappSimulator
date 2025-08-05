#!/usr/bin/env node

const axios = require('axios');

const TEST_SERVER_URL = 'http://localhost:4000';

// Test the new phone number endpoint
async function testPhoneEndpoint() {
  console.log('🧪 Testing Phone Number Endpoint');
  console.log('================================');
  console.log('');

  const phoneNumber = '0535305225';
  const testMessage = '1';

  try {
    console.log(`📱 Testing with phone number: ${phoneNumber}`);
    console.log(`💬 Sending message: "${testMessage}"`);
    console.log('');

    const response = await axios.post(`${TEST_SERVER_URL}/${phoneNumber}/test`, {
      message: testMessage
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Request successful!');
    console.log('');
    console.log('📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('');
      console.log('🎉 Test passed! Phone number endpoint is working correctly.');
    } else {
      console.log('');
      console.log('⚠️ Test completed but with errors.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test backward compatibility
async function testBackwardCompatibility() {
  console.log('');
  console.log('🧪 Testing Backward Compatibility');
  console.log('=================================');
  console.log('');

  try {
    console.log('📱 Testing old endpoint: /test');
    console.log('💬 Sending message: "Hi"');
    console.log('');

    const response = await axios.post(`${TEST_SERVER_URL}/test`, {
      message: 'Hi'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Backward compatibility test successful!');
    console.log('');
    console.log('📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Backward compatibility test failed:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 Phone Number Endpoint Test');
  console.log('=============================');
  console.log('');

  // Check if test server is running
  try {
    await axios.get(`${TEST_SERVER_URL}/`, { timeout: 5000 });
    console.log('✅ Test server is running');
  } catch (error) {
    console.error('❌ Test server is not running');
    console.log('   Please start it with: npm start');
    process.exit(1);
  }

  console.log('');

  // Run tests
  await testPhoneEndpoint();
  await testBackwardCompatibility();

  console.log('');
  console.log('🏁 All tests completed!');
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test script failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  testPhoneEndpoint,
  testBackwardCompatibility
}; 