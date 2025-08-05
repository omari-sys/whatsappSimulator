const axios = require('axios');

const TEST_SERVER_URL = 'http://localhost:4000';
const DEBUG_MODE = process.env.DEBUG === 'true' || process.argv.includes('--debug');

// Debug logging function
function debugLog(message, data = null) {
  if (DEBUG_MODE) {
    console.log(`🔍 DEBUG: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

// Test runner functions
async function runHiTest() {
  console.log('🧪 Running "Hi" Response Test...');
  console.log('');
  
  try {
    debugLog('Sending request to test server', { url: `${TEST_SERVER_URL}/test/hi` });
    
    const response = await axios.post(`${TEST_SERVER_URL}/test/hi`, {}, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    debugLog('Received response from test server', { 
      status: response.status, 
      data: response.data 
    });
    
    const result = response.data;
    
    console.log(`📊 Test: ${result.test}`);
    console.log(`📈 Status: ${result.status}`);
    console.log(`⏰ Timestamp: ${result.timestamp}`);
    console.log('');
    
    if (result.criteria) {
      console.log('📋 Test Criteria:');
      console.log(`  ✅ Has Welcome: ${result.criteria.hasWelcome}`);
      console.log(`  ✅ Has Name: ${result.criteria.hasName}`);
      console.log(`  ✅ Has Onboarding: ${result.criteria.hasOnboarding}`);
      console.log('');
    }
    
    if (result.responseContent) {
      console.log('📝 Response Content:');
      console.log('─'.repeat(50));
      console.log(result.responseContent);
      console.log('─'.repeat(50));
      console.log('');
    }
    
    if (result.status === 'PASSED') {
      console.log('🎉 TEST PASSED! The "Hi" response contains welcome message.');
    } else if (result.status === 'FAILED') {
      console.log('❌ TEST FAILED! The "Hi" response does not meet criteria.');
      if (result.reason) {
        console.log(`   Reason: ${result.reason}`);
      }
    } else {
      console.log('⚠️  TEST ERROR! Check the error details above.');
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused! Make sure the test server is running:');
      console.error('   cd DorTest && npm start');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Request timed out! The test server might be overloaded.');
    } else if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📝 Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('🌐 No response received. Check if test server is running.');
    }
    
    debugLog('Full error details', error);
    
    return { status: 'ERROR', error: error.message };
  }
}

async function runAllTests() {
  console.log('🧪 Running All Tests...');
  console.log('');
  
  try {
    const response = await axios.post(`${TEST_SERVER_URL}/test/run`);
    const summary = response.data;
    
    console.log('📊 Test Summary:');
    console.log(`  📈 Total Tests: ${summary.total}`);
    console.log(`  ✅ Passed: ${summary.passed}`);
    console.log(`  ❌ Failed: ${summary.failed}`);
    console.log(`  ⚠️  Errors: ${summary.errors}`);
    console.log('');
    
    if (summary.results && summary.results.length > 0) {
      console.log('📋 Detailed Results:');
      summary.results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.test}: ${result.status}`);
        if (result.error) {
          console.log(`     Error: ${result.error}`);
        }
      });
      console.log('');
    }
    
    if (summary.passed === summary.total) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log('⚠️  Some tests failed. Check the details above.');
    }
    
    return summary;
    
  } catch (error) {
    console.error('❌ Failed to run tests:', error.message);
    return { error: error.message };
  }
}

async function sendCustomMessage(message) {
  console.log(`🧪 Sending custom message: "${message}"`);
  console.log('');
  
  try {
    const response = await axios.post(`${TEST_SERVER_URL}/send/${encodeURIComponent(message)}`);
    const result = response.data;
    
    console.log(`📊 Test: ${result.test}`);
    console.log(`📈 Success: ${result.result.success}`);
    console.log(`📱 Captured Responses: ${result.capturedResponses}`);
    console.log('');
    
    return result;
    
  } catch (error) {
    console.error('❌ Failed to send message:', error.message);
    return { error: error.message };
  }
}

async function getResponses() {
  console.log('📱 Getting captured responses...');
  console.log('');
  
  try {
    const response = await axios.get(`${TEST_SERVER_URL}/responses`);
    const data = response.data;
    
    console.log(`📊 Total Responses: ${data.count}`);
    console.log('');
    
    if (data.responses && data.responses.length > 0) {
      data.responses.forEach((resp, index) => {
        console.log(`📝 Response ${index + 1}:`);
        console.log(`  ⏰ Time: ${resp.timestamp}`);
        console.log(`  📄 Content: ${JSON.stringify(resp.response, null, 2)}`);
        console.log('');
      });
    } else {
      console.log('📭 No responses captured yet.');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Failed to get responses:', error.message);
    return { error: error.message };
  }
}

async function clearTestData() {
  console.log('🧹 Clearing test data...');
  console.log('');
  
  try {
    const response = await axios.post(`${TEST_SERVER_URL}/test/clear`);
    const result = response.data;
    
    console.log(`✅ ${result.message}`);
    console.log(`⏰ ${result.timestamp}`);
    console.log('');
    
    return result;
    
  } catch (error) {
    console.error('❌ Failed to clear test data:', error.message);
    return { error: error.message };
  }
}

async function checkServerStatus() {
  console.log('🔍 Checking test server status...');
  console.log('');
  
  try {
    const response = await axios.get(`${TEST_SERVER_URL}/`);
    const info = response.data;
    
    console.log(`📊 Server: ${info.name}`);
    console.log(`📝 Description: ${info.description}`);
    console.log(`🌐 Port: ${info.port}`);
    console.log(`🔗 Dor App URL: ${info.dorAppUrl}`);
    console.log('');
    
    console.log('📋 Available Endpoints:');
    Object.entries(info.endpoints).forEach(([endpoint, description]) => {
      console.log(`  ${endpoint}: ${description}`);
    });
    console.log('');
    
    return info;
    
  } catch (error) {
    console.error('❌ Test server is not running or not accessible');
    console.error('   Make sure to start the test server first:');
    console.error('   cd DorTest && npm start');
    console.log('');
    return { error: error.message };
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

switch (command) {
  case 'hi':
    runHiTest();
    break;
  case 'all':
    runAllTests();
    break;
  case 'send':
    if (!param) {
      console.log('❌ Please provide a message to send');
      console.log('   Example: node test-runner.js send "Hello"');
    } else {
      sendCustomMessage(param);
    }
    break;
  case 'responses':
    getResponses();
    break;
  case 'clear':
    clearTestData();
    break;
  case 'status':
    checkServerStatus();
    break;
  case 'debug':
    console.log('🔍 Debug mode enabled');
    console.log(`📊 Test Server URL: ${TEST_SERVER_URL}`);
    console.log(`🔧 Debug Mode: ${DEBUG_MODE}`);
    console.log('');
    runHiTest();
    break;
  default:
    console.log('🧪 Dor Test Runner');
    console.log('==================');
    console.log('');
    console.log('Usage: node test-runner.js [command] [parameter]');
    console.log('');
    console.log('Commands:');
    console.log('  hi         - Test "Hi" response contains welcome message');
    console.log('  all        - Run all tests');
    console.log('  send <msg> - Send custom message to Dor app');
    console.log('  responses  - Get all captured responses');
    console.log('  clear      - Clear all test data');
    console.log('  status     - Check test server status');
    console.log('  debug      - Run test with detailed debugging info');
    console.log('');
    console.log('Examples:');
    console.log('  node test-runner.js hi');
    console.log('  node test-runner.js send "Hello"');
    console.log('  node test-runner.js all');
    console.log('  node test-runner.js debug');
    console.log('  DEBUG=true node test-runner.js hi');
    console.log('');
    console.log('📋 Prerequisites:');
    console.log('1. Start your Dor app: npm start (port 3000)');
    console.log('2. Start test server: cd DorTest && npm start (port 4000)');
    console.log('3. Run tests: node test-runner.js hi');
    console.log('');
    console.log('🔧 Debugging:');
    console.log('  - Use "debug" command for detailed logging');
    console.log('  - Set DEBUG=true environment variable for verbose output');
    console.log('  - Check server status first: node test-runner.js status');
    break;
} 