const WebSocket = require('ws');
const http = require('http');

function runTest() {
  console.log('Starting integration test...');

  const ws = new WebSocket('ws://localhost:3000');

  ws.on('open', () => {
    console.log('Connected to WebSocket');

    // Trigger an event via API
    const postData = JSON.stringify({
      type: 'CHAT_MESSAGE',
      payload: {
        author: 'TestUser',
        message: 'Hello Integration!'
      }
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/trigger',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = http.request(options, (res) => {
      console.log(`API Trigger Response: ${res.statusCode}`);
      if (res.statusCode !== 200) {
        console.error('Failed to trigger event');
        process.exit(1);
      }
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      process.exit(1);
    });

    req.write(postData);
    req.end();
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('Received WebSocket message:', message);

    if (message.type === 'AI_SPEAK') {
      console.log('Received AI_SPEAK:', message.payload);
    }
    if (message.type === 'AI_SPAWN_OBJECT') {
      console.log('Received AI_SPAWN_OBJECT:', message.payload);
      if (message.payload.object && message.payload.object.type === 'text') {
         console.log('Test Passed: Object payload structure is correct');
         ws.close();
         process.exit(0);
      } else {
         console.error('Test Failed: Incorrect object payload structure', message.payload);
         ws.close();
         process.exit(1);
      }
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    process.exit(1);
  });

  // Timeout
  setTimeout(() => {
    console.error('Test Timed Out');
    ws.close();
    process.exit(1);
  }, 5000);
}

runTest();
