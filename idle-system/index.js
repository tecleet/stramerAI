const EventEmitter = require('events');

class IdleSystem extends EventEmitter {
  constructor() {
    super();
    this.lastActivity = Date.now();
    this.idleThreshold = 10000; // 10 seconds of inactivity triggers idle
    this.checkInterval = null;
    this.isIdle = false;
  }

  start() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastActivity > this.idleThreshold && !this.isIdle) {
        this.isIdle = true;
        this.triggerIdleBehavior();
      }
    }, 2000);
  }

  reset() {
    this.lastActivity = Date.now();
    this.isIdle = false;
  }

  triggerIdleBehavior() {
    console.log("Idle System: Triggering idle behavior...");
    const idleActions = ['look_around', 'stretch', 'check_phone', 'hum'];
    const randomAction = idleActions[Math.floor(Math.random() * idleActions.length)];

    this.emit('idle', {
      action: randomAction,
      text: "Is anyone there? It's awfully quiet..."
    });
  }

  stop() {
    clearInterval(this.checkInterval);
    this.checkInterval = null;
  }
}

module.exports = new IdleSystem();
