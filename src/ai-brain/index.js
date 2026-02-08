const eventEngine = require('../event-engine');
const ttsEngine = require('../tts-engine');
const logger = require('../utils/logger');
const memorySystem = require('../memory-system');

class AIBrain {
  constructor() {
    this.personality = "playful, funny, slightly chaotic";
  }

  async processEvent(event) {
    logger.info(`AI Brain processing event: ${event.type}`);
    memorySystem.addEvent(event);

    // Mock AI Logic
    let response = {};

    switch (event.type) {
      case 'CHAT_MESSAGE':
        response = await this.generateChatResponse(event.payload);
        break;
      case 'NEW_SUBSCRIBER':
        response = await this.generateSubscriberReaction(event.payload);
        break;
      case 'IDLE':
        response = await this.generateIdleBehavior();
        break;
      default:
        logger.warn(`Unknown event type: ${event.type}`);
        return;
    }

    // Dispatch AI actions
    if (response.text) {
      // Use TTS Engine for speech
      ttsEngine.speak(response.text);
    }
    if (response.animation) {
      eventEngine.dispatch('AI_ANIMATION', { animation: response.animation });
    }
    if (response.object) {
       eventEngine.dispatch('AI_SPAWN_OBJECT', { object: response.object });
    }
  }

  async generateChatResponse(payload) {
    // In a real implementation, this would call OpenAI
    const responses = [
      `Oh, ${payload.author} says "${payload.message}"? Interesting!`,
      `I totally agree with ${payload.author}!`,
      `Wait, ${payload.author}, what do you mean by that?`,
      `Haha, classic ${payload.author}.`
    ];
    const text = responses[Math.floor(Math.random() * responses.length)];

    return {
      text: text,
      animation: 'talk',
      object: { type: 'text', content: payload.message, author: payload.author }
    };
  }

  async generateSubscriberReaction(payload) {
    return {
      text: `Welcome to the chaos, ${payload.user}!`,
      animation: 'jump',
      object: { type: 'text', content: payload.user, isSubscriber: true }
    };
  }

  async generateIdleBehavior() {
    const thoughts = [
      "Is anyone there?",
      "I'm bored...",
      "Maybe I should do a backflip.",
      "Thinking about digital sheep."
    ];
    return {
      text: thoughts[Math.floor(Math.random() * thoughts.length)],
      animation: 'idle'
    };
  }
}

module.exports = new AIBrain();
