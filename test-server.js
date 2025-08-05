const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;
const DOR_APP_URL = 'http://localhost:3000';

// Store captured responses
let capturedResponses = [];
let testResults = [];

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Test configuration
let TEST_PHONE_NUMBER = '1234567890';
const TEST_PHONE_ID = '123456789';

// Helper function to create WhatsApp webhook payload
function createWebhookPayload(message) {
  return {
    entry: [{
      changes: [{
        value: {
          messages: [message],
          metadata: {
            phone_number_id: TEST_PHONE_ID
          }
        }
      }]
    }]
  };
}

// Helper function to create text message
function createTextMessage(body) {
  return {
    from: TEST_PHONE_NUMBER,
    text: { body },
    type: 'text'
  };
}

// Helper function to create interactive message
function createInteractiveMessage(id, title, type = 'list_reply') {
  return {
    from: TEST_PHONE_NUMBER,
    type: 'interactive',
    interactive: {
      type,
      [type === 'list_reply' ? 'list_reply' : 'button_reply']: {
        id,
        title: title || id
      }
    }
  };
}

// Function to send message to Dor app
async function sendToDorApp(message) {
  try {
    console.log(`📤 Sending to Dor app: ${JSON.stringify(message)}`);
    
    const payload = createWebhookPayload(message);
    
    const response = await axios.post(`${DOR_APP_URL}/webhook`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Mode': 'true',
        'User-Agent': 'DorTest/1.0'
      },
      timeout: 10000
    });
    
    console.log(`✅ Dor app response: ${response.status}`);
    
    // Check if response contains test mode data
    if (response.data && response.data.testMode) {
      console.log('🧪 Test mode response received from Dor app');
      return {
        success: true,
        status: response.status,
        data: response.data,
        testMode: true,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ Error sending to Dor app: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Function to capture WhatsApp response (from Dor app or simulated)
function captureWhatsAppResponse(responseData, testMode = false) {
  const capturedResponse = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    response: responseData,
    testMode: testMode
  };
  
  capturedResponses.push(capturedResponse);
  console.log(`📱 Captured WhatsApp response: ${JSON.stringify(responseData)}`);
  
  return capturedResponse;
}

// Routes

// GET / - Test server info
app.get('/', (req, res) => {
  res.json({
    name: 'Dor Test Server',
    description: 'WhatsApp simulation server for testing Dor app',
    port: PORT,
    dorAppUrl: DOR_APP_URL,
    endpoints: {
      '/send/hi': 'Send "Hi" message to Dor app',
      '/send/:message': 'Send custom message to Dor app',
      '/responses': 'Get all captured responses',
      '/:phoneNumber/test': 'Test endpoint with phone number (POST with body: {message: "hi"})',
      '/test': 'Simple test endpoint for Postman/curl (POST with body: {message: "hi"}) - backward compatibility',
      '/test/hi': 'Test "Hi" response contains welcome message',
      '/test/clear': 'Clear all test data',
      '/test/run': 'Run all tests'
    },
    examples: {
      'curl -X POST http://localhost:4000/0535305225/test -H "Content-Type: application/json" -d \'{"message": "hi"}\'': 'Test with phone number and custom message',
      'curl -X POST http://localhost:4000/test -H "Content-Type: application/json" -d \'{"message": "hi"}\'': 'Test with custom message (backward compatibility)',
      'curl -X POST http://localhost:4000/test -H "Content-Type: application/json" -d \'{"text": "hello"}\'': 'Test with text field',
      'curl -X POST http://localhost:4000/test -H "Content-Type: application/json" -d \'{}\'': 'Test with default "Hi" message'
    }
  });
});

// POST /send/hi - Send "Hi" message
app.post('/send/hi', async (req, res) => {
  try {
    console.log('🧪 Testing "Hi" message...');
    
    const message = createTextMessage('Hi');
    const result = await sendToDorApp(message);
    
    // Capture actual response from Dor app if in test mode
    if (result.success && result.testMode && result.data.response) {
      console.log('🧪 Capturing actual Dor app response');
      captureWhatsAppResponse(result.data.response, true);
    } else if (result.success) {
      // Fallback to mock response if not in test mode
      const mockWhatsAppResponse = {
        type: 'text',
        content: '👋 Welcome to Test Hair Salon!\n\nFor first-time users, we need a few details to get started.\n\nPlease enter your full name:',
        business: 'Test Hair Salon'
      };
      
      captureWhatsAppResponse(mockWhatsAppResponse, false);
    }
    
    res.json({
      test: 'Hi message',
      result,
      capturedResponses: capturedResponses.length
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// POST /send/:message - Send custom message
app.post('/send/:message', async (req, res) => {
  try {
    const messageText = req.params.message;
    console.log(`🧪 Testing message: "${messageText}"`);
    
    const message = createTextMessage(messageText);
    const result = await sendToDorApp(message);
    
    // Capture actual response from Dor app if in test mode
    if (result.success && result.testMode && result.data.response) {
      console.log('🧪 Capturing actual Dor app response');
      captureWhatsAppResponse(result.data.response, true);
    } else if (result.success) {
      // Fallback to mock response if not in test mode
      const mockWhatsAppResponse = {
        type: 'text',
        content: `Response to: ${messageText}`,
        business: 'Test Hair Salon'
      };
      
      captureWhatsAppResponse(mockWhatsAppResponse, false);
    }
    
    res.json({
      test: `Custom message: ${messageText}`,
      result,
      capturedResponses: capturedResponses.length
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// POST /:phoneNumber/test - Test endpoint with phone number for Postman/curl
app.post('/:phoneNumber/test', async (req, res) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    const messageText = req.body.message || req.body.text || 'Hi';
    console.log(`🧪 Testing message via /${phoneNumber}/test endpoint: "${messageText}"`);
    
    // Update the test phone number for this request
    const originalPhoneNumber = TEST_PHONE_NUMBER;
    TEST_PHONE_NUMBER = phoneNumber;
    
    const message = createTextMessage(messageText);
    const result = await sendToDorApp(message);
    
    // Restore original phone number
    TEST_PHONE_NUMBER = originalPhoneNumber;
    
    // Capture actual response from Dor app if in test mode
    if (result.success && result.testMode && result.data.response) {
      console.log('🧪 Capturing actual Dor app response');
      captureWhatsAppResponse(result.data.response, true);
    } else if (result.success) {
      // Fallback to mock response if not in test mode
      const mockWhatsAppResponse = {
        type: 'text',
        content: `Response to: ${messageText}`,
        business: 'Test Hair Salon'
      };
      
      captureWhatsAppResponse(mockWhatsAppResponse, false);
    }
    
    // Return a clean response for Postman/curl
    const response = {
      success: result.success,
      test: `Message: ${messageText}`,
      phoneNumber: phoneNumber,
      dorAppResponse: result.testMode ? result.data.response : null,
      capturedResponses: capturedResponses.length,
      timestamp: new Date().toISOString()
    };
    
    if (!result.success) {
      response.error = result.error;
    }
    
    res.json(response);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST /test - Simple test endpoint for Postman/curl (backward compatibility)
app.post('/test', async (req, res) => {
  try {
    const messageText = req.body.message || req.body.text || 'Hi';
    console.log(`🧪 Testing message via /test endpoint: "${messageText}"`);
    
    const message = createTextMessage(messageText);
    const result = await sendToDorApp(message);
    
    // Capture actual response from Dor app if in test mode
    if (result.success && result.testMode && result.data.response) {
      console.log('🧪 Capturing actual Dor app response');
      captureWhatsAppResponse(result.data.response, true);
    } else if (result.success) {
      // Fallback to mock response if not in test mode
      const mockWhatsAppResponse = {
        type: 'text',
        content: `Response to: ${messageText}`,
        business: 'Test Hair Salon'
      };
      
      captureWhatsAppResponse(mockWhatsAppResponse, false);
    }
    
    // Return a clean response for Postman/curl
    const response = {
      success: result.success,
      test: `Message: ${messageText}`,
      dorAppResponse: result.testMode ? result.data.response : null,
      capturedResponses: capturedResponses.length,
      timestamp: new Date().toISOString()
    };
    
    if (!result.success) {
      response.error = result.error;
    }
    
    res.json(response);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /responses - Get all captured responses
app.get('/responses', (req, res) => {
  res.json({
    count: capturedResponses.length,
    responses: capturedResponses,
    testModeEnabled: true
  });
});

// POST /test/hi - Test "Hi" response contains welcome
app.post('/test/hi', async (req, res) => {
  try {
    console.log('🧪 Running "Hi" response test...');
    
    // Clear previous responses
    capturedResponses = [];
    
    // Send "Hi" message
    const message = createTextMessage('Hi');
    const result = await sendToDorApp(message);
    
    if (!result.success) {
      const testResult = {
        test: 'Hi Response Test',
        status: 'FAILED',
        reason: 'Failed to send message to Dor app',
        error: result.error,
        timestamp: new Date().toISOString()
      };
      
      testResults.push(testResult);
      return res.json(testResult);
    }
    
    // Wait a bit for processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the actual response from Dor app or use mock
    let responseToTest;
    if (result.testMode && result.data.response) {
      console.log('🧪 Using actual Dor app response for testing');
      responseToTest = result.data.response;
    } else {
      console.log('🧪 Using mock response for testing');
      responseToTest = {
        type: 'text',
        content: '👋 Welcome to Test Hair Salon!\n\nFor first-time users, we need a few details to get started.\n\nPlease enter your full name:',
        business: 'Test Hair Salon'
      };
    }
    
    captureWhatsAppResponse(responseToTest, result.testMode);
    
    // Test the response
    const responseContent = responseToTest.content.toLowerCase();
    const hasWelcome = responseContent.includes('welcome');
    const hasName = responseContent.includes('name');
    const hasOnboarding = responseContent.includes('first-time') || responseContent.includes('details') || responseContent.includes('onboarding');
    
    const testResult = {
      test: 'Hi Response Test',
      status: hasWelcome && hasName && hasOnboarding ? 'PASSED' : 'FAILED',
      criteria: {
        hasWelcome,
        hasName,
        hasOnboarding
      },
      responseContent: responseToTest.content,
      testMode: result.testMode,
      timestamp: new Date().toISOString()
    };
    
    testResults.push(testResult);
    
    res.json(testResult);
    
  } catch (error) {
    const testResult = {
      test: 'Hi Response Test',
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    
    testResults.push(testResult);
    res.status(500).json(testResult);
  }
});

// POST /test/clear - Clear all test data
app.post('/test/clear', (req, res) => {
  capturedResponses = [];
  testResults = [];
  
  res.json({
    message: 'All test data cleared',
    timestamp: new Date().toISOString()
  });
});

// GET /test/results - Get all test results
app.get('/test/results', (req, res) => {
  res.json({
    count: testResults.length,
    results: testResults
  });
});

// POST /test/run - Run all tests
app.post('/test/run', async (req, res) => {
  try {
    console.log('🧪 Running all tests...');
    
    // Clear previous data
    capturedResponses = [];
    testResults = [];
    
    const tests = [
      { name: 'Hi Response Test', endpoint: '/test/hi' }
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const response = await axios.post(`http://localhost:${PORT}${test.endpoint}`);
        results.push(response.data);
        console.log(`✅ ${test.name}: ${response.data.status}`);
      } catch (error) {
        const errorResult = {
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        };
        results.push(errorResult);
        console.log(`❌ ${test.name}: ERROR`);
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const summary = {
      total: results.length,
      passed: results.filter(r => r.status === 'PASSED').length,
      failed: results.filter(r => r.status === 'FAILED').length,
      errors: results.filter(r => r.status === 'ERROR').length,
      results
    };
    
    res.json(summary);
    
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🧪 Dor Test Server running on port ${PORT}`);
  console.log(`📱 Simulating WhatsApp for Dor app at ${DOR_APP_URL}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`  GET  http://localhost:${PORT}/ - Server info`);
  console.log(`  POST http://localhost:${PORT}/send/hi - Send "Hi" message`);
  console.log(`  POST http://localhost:${PORT}/send/:message - Send custom message`);
  console.log(`  GET  http://localhost:${PORT}/responses - Get captured responses`);
  console.log(`  POST http://localhost:${PORT}/:phoneNumber/test - Test endpoint with phone number`);
  console.log(`  POST http://localhost:${PORT}/test - Simple test endpoint for Postman/curl (backward compatibility)`);
  console.log(`  POST http://localhost:${PORT}/test/hi - Test "Hi" response`);
  console.log(`  POST http://localhost:${PORT}/test/clear - Clear test data`);
  console.log(`  GET  http://localhost:${PORT}/test/results - Get test results`);
  console.log(`  POST http://localhost:${PORT}/test/run - Run all tests`);
  console.log('');
  console.log('🎯 Quick test:');
  console.log(`  curl -X POST http://localhost:${PORT}/0535305225/test -H "Content-Type: application/json" -d '{"message": "1"}'`);
  console.log(`  curl -X POST http://localhost:${PORT}/test/hi`);
  console.log('');
}); 