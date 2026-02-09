const EventEmitter = require('events');
const { google } = require('googleapis');
require('dotenv').config();

class YouTubeListener extends EventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.isMock = false;
    this.youtube = null;
    this.liveChatId = null;
    this.nextPageToken = null;
    this.pollingInterval = 10000; // Increased initial default
    this.startTime = Date.now();
    this.timeoutId = null;
  }

  async start(videoId, isMock = false) {
    this.stop(); // Ensure clean state
    console.log(`YouTube Listener: Starting... (Mock: ${isMock})`);
    this.startTime = Date.now();
    this.isMock = isMock;
    this.isConnected = false;

    if (this.isMock) {
        this.isConnected = true;
        this.pollMock();
        return;
    }

    // Real Mode
    if (process.env.YOUTUBE_API_KEY && videoId) {
        this.youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY
        });

        try {
            await this.getLiveChatId(videoId);
            console.log(`YouTube Listener: Connected to Live Chat ID: ${this.liveChatId}`);
            this.isConnected = true;
            this.pollChat();
        } catch (error) {
            console.error('YouTube Listener: Failed to connect to live chat:', error.message);
            console.log('YouTube Listener: Falling back to Mock Mode due to error.');
            this.isMock = true;
            this.isConnected = true;
            this.pollMock();
        }
    } else {
        console.log('YouTube Listener: Missing API Key or Video ID. Starting Mock Mode.');
        this.isMock = true;
        this.isConnected = true;
        this.pollMock();
    }
  }

  stop() {
      this.isConnected = false;
      if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
      }
  }

  async getLiveChatId(videoId) {
      const response = await this.youtube.videos.list({
          part: 'liveStreamingDetails',
          id: videoId
      });

      if (response.data.items.length === 0) {
          throw new Error('Video not found');
      }

      const details = response.data.items[0].liveStreamingDetails;
      if (!details || !details.activeLiveChatId) {
          throw new Error('No active live chat found (stream might be offline)');
      }

      this.liveChatId = details.activeLiveChatId;
  }

  async pollChat() {
      if (!this.isConnected || this.isMock) return;

      try {
          const response = await this.youtube.liveChatMessages.list({
              liveChatId: this.liveChatId,
              part: 'snippet,authorDetails',
              pageToken: this.nextPageToken
          });

          this.nextPageToken = response.data.nextPageToken;

          // Ensure we respect the API's requested interval, but don't go below 5s to be safe
          const apiInterval = response.data.pollingIntervalMillis || 10000;
          this.pollingInterval = Math.max(apiInterval, 10000);

          const messages = response.data.items;
          messages.forEach(msg => {
              const publishedAt = new Date(msg.snippet.publishedAt).getTime();
              if (publishedAt < this.startTime) return;

              const author = msg.authorDetails.displayName;
              const displayMessage = msg.snippet.displayMessage;
              const timestamp = msg.snippet.publishedAt;
              const type = msg.snippet.type;

              if (type === 'superChatEvent') {
                  this.emit('superchat', {
                      author: author,
                      message: displayMessage,
                      amount: msg.snippet.superChatDetails.amountDisplayString,
                      timestamp: timestamp
                  });
              } else if (type === 'newSponsorEvent') { // Subscription
                  this.emit('subscription', {
                      subscriber: author,
                      timestamp: timestamp
                  });
              } else {
                  // Default to chat
                  this.emit('chat', {
                      author: author,
                      message: displayMessage,
                      timestamp: timestamp
                  });
              }
          });

      } catch (error) {
          console.error('YouTube Listener: Error polling chat:', error.message);
          // Increase backoff on error
          this.pollingInterval = Math.min(this.pollingInterval * 2, 60000);
      }

      console.log(`YouTube Listener: Polling again in ${this.pollingInterval}ms`);
      this.timeoutId = setTimeout(() => this.pollChat(), this.pollingInterval);
  }

  pollMock() {
      if (!this.isConnected || !this.isMock) return;

      // Random event generation
      const rand = Math.random();

      if (rand < 0.05) { // 5% chance of subscription
          this.emit('subscription', {
              subscriber: `MockSub_${Math.floor(Math.random() * 1000)}`,
              timestamp: new Date().toISOString()
          });
      } else if (rand < 0.1) { // 5% chance of super chat
          this.emit('superchat', {
              author: `MockSuperFan_${Math.floor(Math.random() * 100)}`,
              message: "Keep up the great work!",
              amount: "$10.00",
              timestamp: new Date().toISOString()
          });
      } else { // 90% chance of chat
          const messages = ["Hello!", "Cool stream!", "Is this AI?", "Make it dance!", "Wow!", "Nice graphics"];
          const msg = messages[Math.floor(Math.random() * messages.length)];
           this.emit('chat', {
              author: `User_${Math.floor(Math.random() * 100)}`,
              message: msg,
              timestamp: new Date().toISOString()
          });
      }

      // Random interval between 2s and 10s
      const interval = Math.floor(Math.random() * 8000) + 2000;
      this.timeoutId = setTimeout(() => this.pollMock(), interval);
  }
}

module.exports = new YouTubeListener();
