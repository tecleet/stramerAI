const eventEngine = require('../event-engine');
const logger = require('../utils/logger');

class TTSEngine {
  constructor() {
    this.useBackendTTS = false; // Set to true if API key is available
  }

  async speak(text) {
    logger.info(`TTS Engine processing: "${text}"`);

    if (this.useBackendTTS) {
      // TODO: Implement backend TTS (OpenAI Audio, Google Cloud TTS, etc.)
      // const audioUrl = await this.generateAudio(text);
      // eventEngine.dispatch('AI_AUDIO', { url: audioUrl });
    } else {
      // Fallback to frontend TTS
      eventEngine.dispatch('AI_SPEAK', { text });
    }
  }
}

module.exports = new TTSEngine();
