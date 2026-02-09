class EventEngine {
  constructor() {
    this.animationQueue = [];
  }

  processAIResponse(aiData, author, originalMessage) {
    // aiData is { text, emotion, action }

    const commands = [];

    // 1. Text to Speech command
    commands.push({
      type: 'tts',
      text: aiData.text,
      emotion: aiData.emotion
    });

    // 2. 3D Text command (show the user's message as a floating object)
    commands.push({
      type: 'text3d',
      content: originalMessage,
      author: author,
      style: aiData.emotion
    });

    // 3. Animation command
    let duration = 2000;
    if (aiData.action === 'dance') duration = 5000;
    if (aiData.action === 'eat') duration = 3000;

    commands.push({
      type: 'animation',
      name: aiData.action,
      duration: duration
    });

    return commands;
  }
}

module.exports = new EventEngine();
