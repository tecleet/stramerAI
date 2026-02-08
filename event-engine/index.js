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
      style: aiData.emotion // color/font based on emotion?
    });

    // 3. Animation command
    commands.push({
      type: 'animation',
      name: aiData.action,
      duration: 2000 // duration in ms
    });

    return commands;
  }
}

module.exports = new EventEngine();
