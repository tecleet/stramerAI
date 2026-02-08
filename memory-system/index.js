class MemorySystem {
  constructor() {
    this.messages = [];
    this.maxMemory = 20;
    this.subscribers = new Set();
  }

  addMessage(user, message) {
    this.messages.push({
      user,
      message,
      timestamp: Date.now()
    });

    if (this.messages.length > this.maxMemory) {
      this.messages.shift();
    }
  }

  addSubscriber(user) {
    this.subscribers.add(user);
    // You could also log this to a persistent storage
  }

  getRecentContext() {
    return this.messages.map(m => `${m.user}: ${m.message}`).join('\n');
  }

  isSubscriber(user) {
    return this.subscribers.has(user);
  }
}

module.exports = new MemorySystem();
