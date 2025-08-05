# Dor E2E Test Suite

This E2E (End-to-End) test suite tests the complete booking flow from onboarding to database verification.

## 🎯 What It Tests

The E2E test covers the complete user journey:

1. **Onboarding Start** - User sends "Hi" and gets welcome message
2. **Name Collection** - User provides their full name
3. **Main Menu** - User reaches the main menu
4. **Booking Selection** - User selects booking option
5. **Service Selection** - User chooses a service
6. **Location Selection** - User chooses a location
7. **Provider Selection** - User chooses a provider
8. **Date Selection** - User chooses a date
9. **Time Selection** - User chooses a time slot
10. **Database Verification** - Verifies the booking was saved correctly

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `DorTest` directory:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
TEST_TENANT_ID=your-tenant-id
TEST_USER_ID=your-test-user-id
TEST_SERVICE_ID=your-test-service-id
TEST_PROVIDER_ID=your-test-provider-id
TEST_LOCATION_ID=your-test-location-id
```

### 3. Update Test Configuration

Edit `e2e-config.js` with your actual database IDs:

```javascript
module.exports = {
  // ... existing config
  databaseIds: {
    userId: 'actual-user-id-from-your-database',
    serviceId: 'actual-service-id-from-your-database',
    providerId: 'actual-provider-id-from-your-database',
    locationId: 'actual-location-id-from-your-database'
  }
};
```

## 🏃‍♂️ Running the Tests

### Prerequisites

1. **Start Dor App:**
   ```bash
   cd ../Dor
   npm start
   ```

2. **Start Test Server:**
   ```bash
   cd DorTest
   npm start
   ```

### Run E2E Test

```bash
npm run e2e
```

Or run directly:

```bash
node run-e2e.js
```

## 📊 Test Output

The test will show detailed progress for each step:

```
🧪 Starting E2E Test: Complete Booking Flow
============================================

1️⃣ Step 1: Starting onboarding with "Hi"
✅ Onboarding started successfully
📝 Response: 👋 Welcome to Test Business!...

2️⃣ Step 2: Sending user name
✅ Name accepted successfully
📝 Response: ✅ Thank you, John Doe!...

...

📊 E2E Test Summary
===================
📈 Total Steps: 9
✅ Successful: 9
❌ Failed: 0

🎉 ALL TESTS PASSED! Complete booking flow works correctly.
```

## 🔍 Database Verification

The test verifies that the booking was correctly saved in your Supabase database by:

1. Querying the `appointments` table
2. Checking the booking details (service, provider, time)
3. Verifying the appointment status
4. Confirming the correct user association

## 🛠️ Customization

### Modify Test Data

Edit the test data in `e2e-test.js`:

```javascript
const TEST_USER_NAME = 'Your Test User';
const TEST_PHONE_NUMBER = 'your-test-phone';
```

### Add Custom Validation

Add custom validation patterns in `e2e-config.js`:

```javascript
validation: {
  patterns: {
    customStep: /your-pattern/i
  }
}
```

### Modify Test Flow

Edit the test steps in `e2e-test.js` to match your specific flow:

```javascript
// Add custom steps
console.log('🔟 Step 10: Custom step');
const customMessage = createTextMessage('custom-input');
const customResult = await sendToDorApp(customMessage);
```

## 🐛 Troubleshooting

### Common Issues

1. **"Missing environment variables"**
   - Ensure `.env` file exists with correct values
   - Check that Supabase credentials are valid

2. **"Test server is not running"**
   - Start the test server: `npm start`

3. **"Dor app is not running"**
   - Start the Dor app: `cd ../Dor && npm start`

4. **"Database verification failed"**
   - Check that database IDs in config are correct
   - Verify Supabase connection
   - Ensure test data exists in database

### Debug Mode

Run with debug logging:

```bash
DEBUG=true npm run e2e
```

### Manual Testing

Test individual steps using the test server:

```bash
# Test onboarding
curl -X POST http://localhost:4000/test \
  -H "Content-Type: application/json" \
  -d '{"message": "hi"}'

# Test name collection
curl -X POST http://localhost:4000/test \
  -H "Content-Type: application/json" \
  -d '{"message": "John Doe"}'
```

## 📝 Test Reports

The test generates detailed reports including:

- Step-by-step progress
- Response validation
- Database verification results
- Success/failure summary
- Error details for failed steps

## 🔄 Continuous Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    cd DorTest
    npm install
    npm run e2e
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 📚 Related Files

- `e2e-test.js` - Main test logic
- `e2e-config.js` - Configuration
- `run-e2e.js` - Test runner
- `test-server.js` - Test server for message simulation
- `package.json` - Dependencies and scripts 