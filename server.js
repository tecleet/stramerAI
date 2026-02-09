const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const youtubeListener = require('./youtube-listener');
const aiBrain = require('./ai-brain');
const eventEngine = require('./event-engine');
const memorySystem = require('./memory-system');
const idleSystem = require('./idle-system');
require('dotenv').config();

// Configuration
const CONFIG_FILE = 'config.json';
let config = {
    videoId: process.env.YOUTUBE_VIDEO_ID || '',
    mockMode: false
};

// Load Config
if (fs.existsSync(CONFIG_FILE)) {
    try {
        const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        config = { ...config, ...savedConfig };
        console.log('Loaded config:', config);
    } catch (e) {
        console.error('Error loading config:', e);
    }
}

function saveConfig() {
    try {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (e) {
        console.error('Error saving config:', e);
    }
}

// Initialize Express
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send current settings
  ws.send(JSON.stringify({ type: 'settings', data: config }));

  ws.on('message', (message) => {
    try {
        const data = JSON.parse(message);
        console.log('Received:', data);

        if (data.type === 'update-settings') {
            config.videoId = data.videoId;
            config.mockMode = data.mockMode;
            saveConfig();

            // Restart Listener
            youtubeListener.start(config.videoId, config.mockMode);

            broadcast({ type: 'status', message: 'Settings updated & Listener restarted' });
            // Broadcast new settings to all clients
            broadcast({ type: 'settings', data: config });
        }
    } catch (e) {
        console.error("Error processing message:", e);
    }
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
    const commands = [
        { type: 'tts', text: data.text, emotion: 'bored' },
        { type: 'animation', name: data.action, duration: 3000 }
    ];

    commands.forEach(cmd => {
        broadcast({ type: 'ai-command', command: cmd });
    });
});

// Start YouTube Listener with initial config
youtubeListener.start(config.videoId, config.mockMode);

// Listen to YouTube events
youtubeListener.on('chat', async (data) => {
  console.log('New Chat Message:', data);

  idleSystem.reset();
  const history = memorySystem.getRecentContext();
  memorySystem.addMessage(data.author, data.message);

  const aiResponse = await aiBrain.processChat(data.author, data.message, history);
  console.log('AI Response:', aiResponse);

  if (aiResponse) {
    const commands = eventEngine.processAIResponse(aiResponse, data.author, data.message);

    commands.forEach(cmd => {
        broadcast({ type: 'ai-command', command: cmd });
    });
  } else {
    // Fallback if AI is down or not configured
    console.log("No AI response (Mock/Error).");
    const fallbackResponse = {
        text: `Thanks ${data.author}!`,
        emotion: "happy",
        action: "wave"
    };
    const commands = eventEngine.processAIResponse(fallbackResponse, data.author, data.message);
    commands.forEach(cmd => {
        broadcast({ type: 'ai-command', command: cmd });
    });
  }

  broadcast({ type: 'chat', data });
});

youtubeListener.on('subscription', async (data) => {
  console.log('New Subscription:', data);

  idleSystem.reset();
  memorySystem.addSubscriber(data.subscriber);

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

youtubeListener.on('superchat', async (data) => {
    console.log('New Super Chat:', data);

    idleSystem.reset();
    memorySystem.addMessage(data.author, `SUPER CHAT: ${data.message} (${data.amount})`);

    try {
        const history = memorySystem.getRecentContext();
        const prompt = `[SUPER CHAT from ${data.author} for ${data.amount}]: ${data.message}`;

        const generatedResponse = await aiBrain.processChat(data.author, prompt, history);

        if (generatedResponse) {
            const commands = eventEngine.processAIResponse(generatedResponse, data.author, `SUPER CHAT: ${data.message}`);
            commands.forEach(cmd => {
                broadcast({ type: 'ai-command', command: cmd });
            });
        } else {
            throw new Error("AI Brain returned null");
        }

    } catch (e) {
        console.error("Error processing super chat AI:", e);
        // Fallback
        const aiResponse = {
            text: `WOW! ${data.author}, thank you so much for the ${data.amount}! You are incredible!`,
            emotion: 'excited',
            action: 'jump'
        };
        const commands = eventEngine.processAIResponse(aiResponse, data.author, `SUPER CHAT: ${data.message}`);
        commands.forEach(cmd => {
            broadcast({ type: 'ai-command', command: cmd });
        });
    }

    broadcast({ type: 'superchat', data });
  });

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
