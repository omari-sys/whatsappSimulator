const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const TEST_SERVER_URL = 'http://localhost:4000';
const DOR_APP_URL = 'http://localhost:3000';

// Supabase configuration - you'll need to add these to your environment
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Test configuration
const TEST_PHONE_NUMBER = '1234567890';
const TEST_PHONE_ID = '123456789';
const TEST_USER_NAME = 'John Doe';
const TEST_TENANT_ID = 'your-tenant-id'; // Replace with your actual tenant ID

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
      timeout: 15000
    });
    
    console.log(`✅ Dor app response: ${response.status}`);
    
    return {
      success: true,
      status: response.status,
      data: response.data,
      testMode: response.data && response.data.testMode,
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

// Function to wait for a specified time
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to verify booking in database
async function verifyBookingInDatabase(userId, expectedServiceId, expectedProviderId, expectedDate) {
  try {
    console.log('🔍 Verifying booking in database...');
    
    // Query appointments table
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services(name),
        users(full_name),
        providers(full_name)
      `)
      .eq('user_id', userId)
      .eq('service_id', expectedServiceId)
      .eq('provider_id', expectedProviderId)
      .gte('slot_start', expectedDate)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Database query error:', error);
      return { success: false, error: error.message };
    }

    if (!appointments || appointments.length === 0) {
      console.log('❌ No booking found in database');
      return { success: false, error: 'No booking found' };
    }

    const booking = appointments[0];
    console.log('✅ Booking found in database:', {
      appointment_id: booking.appointment_id,
      service: booking.services?.name,
      provider: booking.providers?.full_name,
      slot_start: booking.slot_start,
      slot_end: booking.slot_end,
      status: booking.status
    });

    return { 
      success: true, 
      booking: booking,
      message: `Booking confirmed: ${booking.services?.name} with ${booking.providers?.full_name} on ${booking.slot_start}`
    };

  } catch (error) {
    console.error('❌ Error verifying booking:', error);
    return { success: false, error: error.message };
  }
}

// Main E2E test function
async function runE2ETest() {
  console.log('🧪 Starting E2E Test: Complete Booking Flow');
  console.log('============================================');
  console.log('');

  const testResults = [];
  let currentContext = {};

  try {
    // Step 1: Send "Hi" to start onboarding
    console.log('1️⃣ Step 1: Starting onboarding with "Hi"');
    const hiMessage = createTextMessage('Hi');
    const hiResult = await sendToDorApp(hiMessage);
    
    if (!hiResult.success) {
      throw new Error(`Failed to send "Hi" message: ${hiResult.error}`);
    }

    if (hiResult.testMode && hiResult.data.response) {
      console.log('✅ Onboarding started successfully');
      console.log(`📝 Response: ${hiResult.data.response.content}`);
      testResults.push({ step: 'onboarding_start', success: true, response: hiResult.data.response });
    } else {
      throw new Error('Expected onboarding response not received');
    }

    await wait(1000);

    // Step 2: Send user name
    console.log('');
    console.log('2️⃣ Step 2: Sending user name');
    const nameMessage = createTextMessage(TEST_USER_NAME);
    const nameResult = await sendToDorApp(nameMessage);
    
    if (!nameResult.success) {
      throw new Error(`Failed to send name: ${nameResult.error}`);
    }

    if (nameResult.testMode && nameResult.data.response) {
      console.log('✅ Name accepted successfully');
      console.log(`📝 Response: ${nameResult.data.response.content}`);
      testResults.push({ step: 'name_collection', success: true, response: nameResult.data.response });
      
      // Check if we're now in main menu
      if (nameResult.data.response.content.toLowerCase().includes('menu') || 
          nameResult.data.response.content.toLowerCase().includes('book')) {
        console.log('✅ Successfully reached main menu');
      }
    } else {
      throw new Error('Expected name confirmation response not received');
    }

    await wait(1000);

    // Step 3: Select booking option (usually "1" or "main_book")
    console.log('');
    console.log('3️⃣ Step 3: Selecting booking option');
    const bookingMessage = createTextMessage('1');
    const bookingResult = await sendToDorApp(bookingMessage);
    
    if (!bookingResult.success) {
      throw new Error(`Failed to select booking: ${bookingResult.error}`);
    }

    if (bookingResult.testMode && bookingResult.data.response) {
      console.log('✅ Booking option selected successfully');
      console.log(`📝 Response: ${bookingResult.data.response.content}`);
      testResults.push({ step: 'booking_selection', success: true, response: bookingResult.data.response });
    } else {
      throw new Error('Expected service list response not received');
    }

    await wait(1000);

    // Step 4: Select first service (assuming it's "1" or interactive)
    console.log('');
    console.log('4️⃣ Step 4: Selecting first service');
    const serviceMessage = createTextMessage('1');
    const serviceResult = await sendToDorApp(serviceMessage);
    
    if (!serviceResult.success) {
      throw new Error(`Failed to select service: ${serviceResult.error}`);
    }

    if (serviceResult.testMode && serviceResult.data.response) {
      console.log('✅ Service selected successfully');
      console.log(`📝 Response: ${serviceResult.data.response.content}`);
      testResults.push({ step: 'service_selection', success: true, response: serviceResult.data.response });
    } else {
      throw new Error('Expected location list response not received');
    }

    await wait(1000);

    // Step 5: Select first location
    console.log('');
    console.log('5️⃣ Step 5: Selecting first location');
    const locationMessage = createTextMessage('1');
    const locationResult = await sendToDorApp(locationMessage);
    
    if (!locationResult.success) {
      throw new Error(`Failed to select location: ${locationResult.error}`);
    }

    if (locationResult.testMode && locationResult.data.response) {
      console.log('✅ Location selected successfully');
      console.log(`📝 Response: ${locationResult.data.response.content}`);
      testResults.push({ step: 'location_selection', success: true, response: locationResult.data.response });
    } else {
      throw new Error('Expected provider list response not received');
    }

    await wait(1000);

    // Step 6: Select first provider
    console.log('');
    console.log('6️⃣ Step 6: Selecting first provider');
    const providerMessage = createTextMessage('1');
    const providerResult = await sendToDorApp(providerMessage);
    
    if (!providerResult.success) {
      throw new Error(`Failed to select provider: ${providerResult.error}`);
    }

    if (providerResult.testMode && providerResult.data.response) {
      console.log('✅ Provider selected successfully');
      console.log(`📝 Response: ${providerResult.data.response.content}`);
      testResults.push({ step: 'provider_selection', success: true, response: providerResult.data.response });
    } else {
      throw new Error('Expected date list response not received');
    }

    await wait(1000);

    // Step 7: Select first available date
    console.log('');
    console.log('7️⃣ Step 7: Selecting first available date');
    const dateMessage = createTextMessage('1');
    const dateResult = await sendToDorApp(dateMessage);
    
    if (!dateResult.success) {
      throw new Error(`Failed to select date: ${dateResult.error}`);
    }

    if (dateResult.testMode && dateResult.data.response) {
      console.log('✅ Date selected successfully');
      console.log(`📝 Response: ${dateResult.data.response.content}`);
      testResults.push({ step: 'date_selection', success: true, response: dateResult.data.response });
    } else {
      throw new Error('Expected time list response not received');
    }

    await wait(1000);

    // Step 8: Select first available time slot
    console.log('');
    console.log('8️⃣ Step 8: Selecting first available time slot');
    const timeMessage = createTextMessage('1');
    const timeResult = await sendToDorApp(timeMessage);
    
    if (!timeResult.success) {
      throw new Error(`Failed to select time: ${timeResult.error}`);
    }

    if (timeResult.testMode && timeResult.data.response) {
      console.log('✅ Time slot selected successfully');
      console.log(`📝 Response: ${timeResult.data.response.content}`);
      testResults.push({ step: 'time_selection', success: true, response: timeResult.data.response });
      
      // Check if booking was confirmed
      if (timeResult.data.response.content.toLowerCase().includes('confirmed') || 
          timeResult.data.response.content.toLowerCase().includes('appointment')) {
        console.log('✅ Booking confirmed successfully!');
      }
    } else {
      throw new Error('Expected booking confirmation response not received');
    }

    await wait(2000); // Wait a bit longer for database operations

    // Step 9: Verify booking in database
    console.log('');
    console.log('9️⃣ Step 9: Verifying booking in database');
    
    // Get the current date for verification
    const today = new Date().toISOString().split('T')[0];
    
    // You'll need to get the actual user_id, service_id, and provider_id from your test data
    // For now, we'll use placeholder values - you should replace these with actual values
    const verificationResult = await verifyBookingInDatabase(
      'test-user-id', // Replace with actual user_id
      'test-service-id', // Replace with actual service_id  
      'test-provider-id', // Replace with actual provider_id
      today
    );

    if (verificationResult.success) {
      console.log('✅ Database verification successful');
      console.log(`📝 ${verificationResult.message}`);
      testResults.push({ step: 'database_verification', success: true, booking: verificationResult.booking });
    } else {
      console.log('⚠️ Database verification failed:', verificationResult.error);
      testResults.push({ step: 'database_verification', success: false, error: verificationResult.error });
    }

    // Test Summary
    console.log('');
    console.log('📊 E2E Test Summary');
    console.log('===================');
    
    const totalSteps = testResults.length;
    const successfulSteps = testResults.filter(r => r.success).length;
    const failedSteps = totalSteps - successfulSteps;

    console.log(`📈 Total Steps: ${totalSteps}`);
    console.log(`✅ Successful: ${successfulSteps}`);
    console.log(`❌ Failed: ${failedSteps}`);
    console.log('');

    if (failedSteps === 0) {
      console.log('🎉 ALL TESTS PASSED! Complete booking flow works correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the details above.');
    }

    // Detailed results
    console.log('📋 Detailed Results:');
    testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${result.step}`);
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });

    return {
      success: failedSteps === 0,
      totalSteps,
      successfulSteps,
      failedSteps,
      results: testResults
    };

  } catch (error) {
    console.error('❌ E2E Test failed with error:', error.message);
    return {
      success: false,
      error: error.message,
      results: testResults
    };
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runE2ETest()
    .then(result => {
      console.log('');
      console.log('🏁 E2E Test completed');
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ E2E Test crashed:', error);
      process.exit(1);
    });
}

module.exports = {
  runE2ETest,
  sendToDorApp,
  verifyBookingInDatabase
}; 