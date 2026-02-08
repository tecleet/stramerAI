const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const youtubeListener = require('./youtube-listener');
const aiBrain = require('./ai-brain');
const eventEngine = require('./event-engine');
const memorySystem = require('./memory-system');
const idleSystem = require('./idle-system');

// Initialize Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.send(JSON.stringify({ type: 'status', message: 'Connected to Streamer-AI Backend' }));
});

// Broadcast function
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Start Idle System
idleSystem.start();
idleSystem.on('idle', (data) => {
    console.log('Idle Event:', data);
    // Create an idle command directly or process via AI?
    // Let's create a simple command for now.
    const commands = [
        { type: 'tts', text: data.text, emotion: 'bored' },
        { type: 'animation', name: data.action, duration: 3000 }
    ];

    commands.forEach(cmd => {
        broadcast({ type: 'ai-command', command: cmd });
    });
});

// Connect YouTube Listener
youtubeListener.connect();

// Listen to YouTube events
youtubeListener.on('chat', async (data) => {
  console.log('New Chat Message:', data);

  // 1. Reset Idle
  idleSystem.reset();

  // 2. Get Context and Add to Memory
  const history = memorySystem.getRecentContext();
  memorySystem.addMessage(data.author, data.message);

  // 3. Process with AI Brain
  // In a real app, you might want to debounce or queue these to avoid spamming the AI
  const aiResponse = await aiBrain.processChat(data.author, data.message, history);
  console.log('AI Response:', aiResponse);

  if (aiResponse) {
      // 4. Convert to Commands
      const commands = eventEngine.processAIResponse(aiResponse, data.author, data.message);

      // 5. Broadcast commands
      commands.forEach(cmd => {
          broadcast({ type: 'ai-command', command: cmd });
      });
  } else {
      console.log("AI Response was null (likely error or quota exceeded), skipping commands.");
  }

  // Also send the raw chat for display if needed
  broadcast({ type: 'chat', data });
});

youtubeListener.on('subscription', async (data) => {
  console.log('New Subscription:', data);

  idleSystem.reset();
  memorySystem.addSubscriber(data.subscriber);

  // Generate special welcome
  const aiResponse = {
      text: `Welcome to the stream, ${data.subscriber}! You are awesome!`,
      emotion: 'excited',
      action: 'dance'
  };

  const commands = eventEngine.processAIResponse(aiResponse, data.subscriber, "SUBSCRIBED!");

  commands.forEach(cmd => {
      broadcast({ type: 'ai-command', command: cmd });
  });

  broadcast({ type: 'subscription', data });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
