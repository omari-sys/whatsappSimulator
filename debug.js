const axios = require('axios');
const http = require('http');

const TEST_SERVER_URL = 'http://localhost:4000';
const DOR_APP_URL = 'http://localhost:3000';

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve({ running: true, status: res.statusCode });
    });
    
    req.on('error', (err) => {
      resolve({ running: false, error: err.code });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false, error: 'TIMEOUT' });
    });
    
    req.end();
  });
}

async function debugSetup() {
  console.log('🔍 DorTest Debug Diagnostic');
  console.log('============================');
  console.log('');
  
  // Check if test server is running
  console.log('1️⃣ Checking Test Server (Port 4000)...');
  const testServerStatus = await checkPort(4000);
  if (testServerStatus.running) {
    console.log('   ✅ Test server is running');
    try {
      const response = await axios.get(`${TEST_SERVER_URL}/`, { timeout: 5000 });
      console.log(`   📊 Status: ${response.status}`);
      console.log(`   📝 Name: ${response.data.name}`);
    } catch (error) {
      console.log(`   ⚠️  Server running but API not responding: ${error.message}`);
    }
  } else {
    console.log(`   ❌ Test server is not running (${testServerStatus.error})`);
    console.log('   💡 Start it with: cd DorTest && npm start');
  }
  console.log('');
  
  // Check if Dor app is running
  console.log('2️⃣ Checking Dor App (Port 3000)...');
  const dorAppStatus = await checkPort(3000);
  if (dorAppStatus.running) {
    console.log('   ✅ Dor app is running');
    try {
      const response = await axios.get(`${DOR_APP_URL}/`, { timeout: 5000 });
      console.log(`   📊 Status: ${response.status}`);
    } catch (error) {
      console.log(`   ⚠️  App running but root endpoint not responding: ${error.message}`);
    }
  } else {
    console.log(`   ❌ Dor app is not running (${dorAppStatus.error})`);
    console.log('   💡 Start it with: cd Dor && npm start');
  }
  console.log('');
  
  // Test communication between servers
  console.log('3️⃣ Testing Communication...');
  if (testServerStatus.running && dorAppStatus.running) {
    try {
      console.log('   📤 Sending test message from test server to Dor app...');
      const response = await axios.post(`${TEST_SERVER_URL}/send/hi`, {}, { timeout: 10000 });
      console.log(`   ✅ Communication successful: ${response.status}`);
      console.log(`   📊 Test result: ${response.data.test}`);
    } catch (error) {
      console.log(`   ❌ Communication failed: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Response status: ${error.response.status}`);
      }
    }
  } else {
    console.log('   ⚠️  Skipping communication test - servers not running');
  }
  console.log('');
  
  // Check dependencies
  console.log('4️⃣ Checking Dependencies...');
  try {
    const packageJson = require('./package.json');
    console.log('   ✅ package.json found');
    console.log(`   📦 Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`);
    console.log(`   🔧 Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).length}`);
  } catch (error) {
    console.log('   ❌ package.json not found or invalid');
  }
  console.log('');
  
  // Summary
  console.log('📋 Summary:');
  if (testServerStatus.running && dorAppStatus.running) {
    console.log('   🎉 Both servers are running! You should be able to run tests.');
    console.log('   💡 Try: node test-runner.js hi');
  } else {
    console.log('   ⚠️  Some servers are not running. Please start them first.');
    if (!testServerStatus.running) {
      console.log('   🔧 Start test server: cd DorTest && npm start');
    }
    if (!dorAppStatus.running) {
      console.log('   🔧 Start Dor app: cd Dor && npm start');
    }
  }
  console.log('');
}

// Run the debug diagnostic
debugSetup().catch(console.error); 