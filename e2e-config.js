// E2E Test Configuration
// Copy this file to e2e-config.local.js and update with your actual values

module.exports = {
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'your-supabase-url',
    anonKey: process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'
  },

  // Test Data Configuration
  testData: {
    phoneNumber: '1234567890',
    phoneId: '123456789',
    userName: 'John Doe',
    tenantId: process.env.TEST_TENANT_ID || 'your-tenant-id'
  },

  // Database IDs for verification (replace with actual IDs from your database)
  databaseIds: {
    // These should be actual IDs from your Supabase database
    userId: process.env.TEST_USER_ID || 'test-user-id',
    serviceId: process.env.TEST_SERVICE_ID || 'test-service-id',
    providerId: process.env.TEST_PROVIDER_ID || 'test-provider-id',
    locationId: process.env.TEST_LOCATION_ID || 'test-location-id'
  },

  // Test URLs
  urls: {
    testServer: 'http://localhost:4000',
    dorApp: 'http://localhost:3000'
  },

  // Test timeouts
  timeouts: {
    messageWait: 1000, // Wait between messages
    databaseWait: 2000, // Wait for database operations
    requestTimeout: 15000 // HTTP request timeout
  },

  // Test validation
  validation: {
    // Expected response patterns
    patterns: {
      onboarding: /welcome|name/i,
      mainMenu: /menu|book/i,
      serviceList: /service|choose/i,
      locationList: /location|choose/i,
      providerList: /provider|choose/i,
      dateList: /date|choose/i,
      timeList: /time|slot/i,
      bookingConfirmation: /confirmed|appointment/i
    }
  }
}; 