class MemorySystem {
  constructor() {
    this.events = [];
    this.maxEvents = 50;
  }

  addEvent(event) {
    this.events.push({
      timestamp: new Date().toISOString(),
      ...event
    });
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  getRecentEvents(limit = 5) {
    return this.events.slice(-limit);
  }
}

module.exports = new MemorySystem();
