#!/usr/bin/env node

const { runE2ETest } = require('./e2e-test');
const config = require('./e2e-config');

console.log('🚀 Dor E2E Test Runner');
console.log('======================');
console.log('');

// Check if required environment variables are set
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('');
  console.log('💡 Please set these environment variables:');
  console.log('   export SUPABASE_URL="your-supabase-url"');
  console.log('   export SUPABASE_ANON_KEY="your-supabase-anon-key"');
  console.log('');
  console.log('📝 Or create a .env file in the DorTest directory:');
  console.log('   SUPABASE_URL=your-supabase-url');
  console.log('   SUPABASE_ANON_KEY=your-supabase-anon-key');
  console.log('');
  process.exit(1);
}

// Check if servers are running
async function checkServers() {
  const axios = require('axios');
  
  console.log('🔍 Checking if servers are running...');
  
  try {
    // Check test server
    await axios.get(config.urls.testServer, { timeout: 5000 });
    console.log('✅ Test server is running');
  } catch (error) {
    console.log('❌ Test server is not running');
    console.log('   Start it with: npm start');
    return false;
  }
  
  try {
    // Check Dor app
    await axios.get(config.urls.dorApp, { timeout: 5000 });
    console.log('✅ Dor app is running');
  } catch (error) {
    console.log('❌ Dor app is not running');
    console.log('   Start it with: cd ../Dor && npm start');
    return false;
  }
  
  return true;
}

// Main execution
async function main() {
  try {
    // Check servers first
    const serversOk = await checkServers();
    if (!serversOk) {
      console.log('');
      console.log('⚠️ Please start both servers before running the E2E test');
      process.exit(1);
    }
    
    console.log('');
    console.log('🎯 Starting E2E test...');
    console.log('');
    
    // Run the E2E test
    const result = await runE2ETest();
    
    console.log('');
    console.log('🏁 E2E Test completed');
    
    if (result.success) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed');
      if (result.error) {
        console.log(`Error: ${result.error}`);
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ E2E test runner failed:', error.message);
    process.exit(1);
  }
}

// Run the main function
main(); 