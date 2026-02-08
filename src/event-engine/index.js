const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class EventEngine {
  constructor() {
    this.clients = new Set();
  }

  addClient(ws) {
    this.clients.add(ws);
    logger.info('Frontend client connected');

    ws.on('message', (message) => {
      logger.info('Received message from frontend:', message.toString());
      // Handle frontend messages here if needed (e.g., animation complete)
    });

    ws.on('close', () => {
      this.clients.delete(ws);
      logger.info('Frontend client disconnected');
    });

    ws.on('error', (err) => {
      logger.error('WebSocket error:', err);
    });
  }

  /**
   * Dispatches an event to the frontend
   * @param {string} type - Event type (e.g., 'CHAT_MESSAGE', 'SUBSCRIBER', 'AI_RESPONSE')
   * @param {object} payload - Data for the event
   */
  dispatch(type, payload) {
    const event = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type,
      payload
    };

    logger.info(`Dispatching event: ${type}`);

    const message = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    }
  }
}

module.exports = new EventEngine();
