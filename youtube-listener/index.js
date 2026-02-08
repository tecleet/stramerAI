const EventEmitter = require('events');
const { google } = require('googleapis');
require('dotenv').config();

class YouTubeListener extends EventEmitter {
  constructor() {
    super();
    this.isConnected = false;
    this.youtube = null;
    this.liveChatId = null;
    this.nextPageToken = null;
    this.pollingInterval = 5000;
    this.startTime = Date.now();
  }

  async connect() {
    console.log('YouTube Listener: Connecting...');
    this.startTime = Date.now();

    if (process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_VIDEO_ID) {
        this.youtube = google.youtube({
            version: 'v3',
            auth: process.env.YOUTUBE_API_KEY
        });

        try {
            await this.getLiveChatId(process.env.YOUTUBE_VIDEO_ID);
            console.log(`YouTube Listener: Connected to Live Chat ID: ${this.liveChatId}`);
            this.isConnected = true;
            this.pollChat();
        } catch (error) {
            console.error('YouTube Listener: Failed to connect to live chat:', error.message);
            // Mock mode disabled for production
        }
    } else {
        console.log('YouTube Listener: Missing API Key or Video ID.');
        // Mock mode disabled for production
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
      if (!this.isConnected) return;

      try {
          const response = await this.youtube.liveChatMessages.list({
              liveChatId: this.liveChatId,
              part: 'snippet,authorDetails',
              pageToken: this.nextPageToken
          });

          this.nextPageToken = response.data.nextPageToken;

          // Use polling interval from API or default to 5s
          this.pollingInterval = response.data.pollingIntervalMillis || 5000;

          const messages = response.data.items;
          messages.forEach(msg => {
              const publishedAt = new Date(msg.snippet.publishedAt).getTime();
              // Only process messages that arrived after we connected to avoid flooding history
              if (publishedAt < this.startTime) return;

              const author = msg.authorDetails.displayName;
              const message = msg.snippet.displayMessage;
              const timestamp = msg.snippet.publishedAt;

              // Emit chat event
              this.emit('chat', {
                  author: author,
                  message: message,
                  timestamp: timestamp
              });
          });

      } catch (error) {
          console.error('YouTube Listener: Error polling chat:', error.message);
          // If 403 or similar, maybe stop polling or retry with backoff
          // For now, we continue but maybe increase interval?
      }

      setTimeout(() => this.pollChat(), this.pollingInterval);
  }

}

module.exports = new YouTubeListener();
