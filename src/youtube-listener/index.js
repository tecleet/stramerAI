const aiBrain = require('../ai-brain');
const logger = require('../utils/logger');

class YoutubeListener {
  constructor() {
    this.isListening = false;
  }

  start() {
    if (this.isListening) return;
    this.isListening = true;
    logger.info('YouTube Listener started');

    if (process.env.SIMULATE_EVENTS === 'true') {
      this.simulateEvents();
    }
  }

  simulateEvents() {
    setInterval(() => {
      const types = ['CHAT_MESSAGE', 'NEW_SUBSCRIBER'];
      const type = types[Math.floor(Math.random() * types.length)];

      let payload = {};
      if (type === 'CHAT_MESSAGE') {
        const messages = ['Hello!', 'Is this real?', 'Can you jump?', 'Haha funny!'];
        const authors = ['User123', 'StreamFan', 'GamerX', 'Viewer01'];
        payload = {
          author: authors[Math.floor(Math.random() * authors.length)],
          message: messages[Math.floor(Math.random() * messages.length)]
        };
      } else {
        payload = { user: `NewSub${Math.floor(Math.random() * 100)}` };
      }

      logger.info(`Simulating event: ${type}`);
      aiBrain.processEvent({ type, payload });
    }, 15000); // Every 15 seconds
  }

  // Method to manually trigger an event (useful for testing integration)
  triggerEvent(type, payload) {
    logger.info(`Manually triggering event: ${type}`);
    aiBrain.processEvent({ type, payload });
  }
}

module.exports = new YoutubeListener();
