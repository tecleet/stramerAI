require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const logger = require('./utils/logger');
const eventEngine = require('./event-engine');
const youtubeListener = require('./youtube-listener');
const idleSystem = require('./idle-system');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Also serve node_modules to simplify frontend imports
app.use('/node_modules', express.static(path.join(__dirname, '../node_modules')));

// API endpoint to manually trigger events
app.post('/api/trigger', express.json(), (req, res) => {
  const { type, payload } = req.body;
  if (!type) {
    return res.status(400).json({ error: 'Missing event type' });
  }

  // Directly process through AI Brain for now, or through YoutubeListener if we want to simulate source
  // For simplicity, let's use YoutubeListener's trigger method if available, or just call AI Brain
  // But AI Brain is not exported here.
  // Let's use youtubeListener since we imported it.

  youtubeListener.triggerEvent(type, payload || {});
  res.json({ success: true, message: `Triggered ${type}` });
});

// WebSocket connection
wss.on('connection', (ws) => {
  eventEngine.addClient(ws);
});

// Start the server
server.listen(PORT, () => {
  logger.info(`Streamer-AI server running on http://localhost:${PORT}`);

  // Start listeners
  youtubeListener.start();
  idleSystem.start();
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
