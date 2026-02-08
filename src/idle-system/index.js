const aiBrain = require('../ai-brain');
const logger = require('../utils/logger');

class IdleSystem {
  constructor() {
    this.lastActivity = Date.now();
    this.intervalId = null;
    this.IDLE_TIMEOUT = 10000; // 10 seconds of no activity triggers idle behavior
  }

  start() {
    if (this.intervalId) return;
    logger.info('Idle System started');

    this.intervalId = setInterval(() => {
      const now = Date.now();
      if (now - this.lastActivity > this.IDLE_TIMEOUT) {
        logger.info('Idle detected, triggering behavior...');
        aiBrain.processEvent({ type: 'IDLE' });
        this.resetTimer(); // Reset so it doesn't trigger immediately again?
        // Or keep triggering every 10s?
        // Let's reset for now so it triggers periodically but only if still idle.
      }
    }, 5000); // Check every 5 seconds
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resetTimer() {
    this.lastActivity = Date.now();
  }
}

module.exports = new IdleSystem();
