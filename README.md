# Dor Test Server

A WhatsApp simulation server for testing the Dor app responses. This test server runs on port 4000 and simulates WhatsApp by sending messages to your Dor app and capturing the responses.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd DorTest
npm install
```

### 2. Start Your Dor App
```bash
# In the main Dor directory
npm start
```
Your Dor app should be running on `http://localhost:3000`

### 3. Start the Test Server
```bash
# In the DorTest directory
npm start
```
The test server will start on `http://localhost:4000`

### 4. Run Tests
```bash
# Test "Hi" response
node test-runner.js hi

# Run all tests
node test-runner.js all

# Send custom message
node test-runner.js send "Hello"
```

## 📋 Available Endpoints

### Test Server Endpoints (Port 4000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server info and available endpoints |
| POST | `/send/hi` | Send "Hi" message to Dor app |
| POST | `/send/:message` | Send custom message to Dor app |
| GET | `/responses` | Get all captured responses |
| POST | `/:phoneNumber/test` | Test endpoint with phone number (POST with body: {message: "hi"}) |
| POST | `/test` | Simple test endpoint for Postman/curl (backward compatibility) |
| POST | `/test/hi` | Test "Hi" response contains welcome message |
| POST | `/test/clear` | Clear all test data |
| GET | `/test/results` | Get all test results |
| POST | `/test/run` | Run all tests |

## 🧪 Test Commands

### Using the Test Runner
```bash
# Test "Hi" response
node test-runner.js hi

# Run all tests
node test-runner.js all

# Send custom message
node test-runner.js send "Hello"

# Get captured responses
node test-runner.js responses

# Clear test data
node test-runner.js clear

# Check server status
node test-runner.js status
```

### Using Curl
```bash
# Test with phone number (new endpoint)
curl -X POST http://localhost:4000/0535305225/test \
  -H "Content-Type: application/json" \
  -d '{"message": "1"}'

# Test "Hi" response
curl -X POST http://localhost:4000/test/hi

# Send "Hi" message
curl -X POST http://localhost:4000/send/hi

# Send custom message
curl -X POST http://localhost:4000/send/Hello

# Get responses
curl http://localhost:4000/responses

# Run all tests
curl -X POST http://localhost:4000/test/run
```

## 📊 Test Results

### "Hi" Response Test
The test checks if the response to "Hi" contains:
- ✅ Welcome message
- ✅ Name request
- ✅ Onboarding instructions

Example successful response:
```json
{
  "test": "Hi Response Test",
  "status": "PASSED",
  "criteria": {
    "hasWelcome": true,
    "hasName": true,
    "hasOnboarding": true
  },
  "responseContent": "👋 Welcome to Test Hair Salon!\n\nFor first-time users, we need a few details to get started.\n\nPlease enter your full name:",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔧 How It Works

1. **Test Server** (Port 4000) simulates WhatsApp
2. **Sends messages** to Dor app (Port 3000) via webhook
3. **Captures responses** from Dor app
4. **Validates response content** against expected criteria
5. **Returns test results** with pass/fail status

### Message Flow
```
Test Server (4000) → Dor App (3000) → WhatsApp API
     ↓                    ↓              ↓
Captures Response ← HTTP Response ← WhatsApp Response
```

## 📝 Example Usage

### 1. Test "Hi" Response
```bash
# Start both servers
npm start          # Dor app on port 3000
cd DorTest && npm start  # Test server on port 4000

# Run test
node test-runner.js hi
```

Expected output:
```
🧪 Running "Hi" Response Test...

📊 Test: Hi Response Test
📈 Status: PASSED
⏰ Timestamp: 2024-01-01T12:00:00.000Z

📋 Test Criteria:
  ✅ Has Welcome: true
  ✅ Has Name: true
  ✅ Has Onboarding: true

📝 Response Content:
──────────────────────────────────────────────────
👋 Welcome to Test Hair Salon!

For first-time users, we need a few details to get started.

Please enter your full name:
──────────────────────────────────────────────────

🎉 TEST PASSED! The "Hi" response contains welcome message.
```

### 2. Send Custom Message
```bash
node test-runner.js send "Hello"
```

### 3. Check Captured Responses
```bash
node test-runner.js responses
```

## 🛠️ Configuration

### Test Configuration
Edit `test-server.js` to modify:
- `TEST_PHONE_NUMBER`: Phone number for testing
- `TEST_PHONE_ID`: WhatsApp phone ID
- `DOR_APP_URL`: URL of your Dor app

### Adding New Tests
1. Add test function in `test-server.js`
2. Add endpoint for the test
3. Add test to the test suite in `/test/run`

## 🔍 Troubleshooting

### Test Server Won't Start
```bash
# Check if port 4000 is available
netstat -an | findstr :4000

# Kill process using port 4000
taskkill /F /PID <PID>
```

### Dor App Not Responding
```bash
# Check if Dor app is running
curl http://localhost:3000

# Check Dor app logs for errors
```

### Test Failing
1. Ensure Dor app is running on port 3000
2. Check Dor app logs for errors
3. Verify WhatsApp token is valid
4. Check database connection

## 📁 File Structure

```
DorTest/
├── package.json          # Dependencies and scripts
├── test-server.js        # Main test server
├── test-runner.js        # CLI test runner
└── README.md            # This file
```

## 🎯 Next Steps

1. **Add more tests** for different scenarios
2. **Test booking flow** end-to-end
3. **Add response validation** for different message types
4. **Create test reports** with detailed results
5. **Add automated testing** in CI/CD pipeline

## 📞 Support

If you encounter issues:
1. Check both servers are running
2. Verify ports 3000 and 4000 are available
3. Check Dor app logs for errors
4. Ensure WhatsApp token is valid 