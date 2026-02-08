const EventEmitter = require('events');

class YouTubeListener extends EventEmitter {
  constructor() {
    super();
    this.isConnected = false;
  }

  connect() {
    console.log('YouTube Listener: Connecting...');
    // In a real implementation, this would connect to the YouTube Live Chat API
    this.isConnected = true;
    console.log('YouTube Listener: Connected (Mock Mode)');

    // Start simulation if in mock mode
    this.startSimulation();
  }

  startSimulation() {
    console.log('YouTube Listener: Starting simulation...');
    const users = ['Viewer1', 'FanBoy99', 'CoolCat', 'DevGuru', 'StreamLover'];
    const messages = [
      'Hello!',
      'Is this real?',
      'Make the character jump!',
      'Can you say my name?',
      'Wow, 3D text!',
      'What is your favorite color?',
      'Python is better than JS',
      'React is awesome'
    ];

    setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      this.emit('chat', {
        author: randomUser,
        message: randomMsg,
        timestamp: new Date().toISOString()
      });
    }, 10000); // Emit a message every 10 seconds

    // Simulate subscription every 30 seconds
    setInterval(() => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        this.emit('subscription', {
            subscriber: randomUser,
            timestamp: new Date().toISOString()
        });
    }, 30000);
  }
}

module.exports = new YouTubeListener();
