const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

class AIBrain {
  constructor() {
    this.systemPrompt = `You are a chaotic, funny, and interactive AI streamer.
    You are live on YouTube.
    Your personality: playful, slightly unhinged, loves 3D text, reacts physically to chat.

    IMPORTANT:
    - Be varied and human-like. Do NOT repeat yourself.
    - React directly to what the user said.
    - If a user subscribes, be very excited and welcome them.
    - Sometimes you get hungry and want to "eat" the chat.

    When you receive a chat message, generate a JSON response with:
    - "text": what you say (keep it short, under 2 sentences, varied phrasing).
    - "emotion": one of ["happy", "angry", "surprised", "bored", "confused", "excited"].
    - "action": a physical action like ["wave", "jump", "dance", "attack", "eat"].

    `;

    this.mockResponses = [
        { text: "Wow! That's interesting!", emotion: "happy", action: "wave" },
        { text: "I'm hungry... for content!", emotion: "excited", action: "eat" },
        { text: "Is that true?", emotion: "surprised", action: "jump" },
        { text: "Thanks for the message!", emotion: "happy", action: "dance" },
        { text: "Who said that?", emotion: "confused", action: "wave" },
        { text: "Mmm... tasty text.", emotion: "happy", action: "eat" }
    ];

    // Initialize OpenAI if key is present
    if (process.env.OPENAI_API_KEY) {
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.openai = new OpenAIApi(configuration);
    } else {
      console.log("AI Brain: No OpenAI API Key found.");
    }
  }

  getFallbackResponse() {
      return this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];
  }

  async processChat(author, message, history = "") {
    console.log(`AI Brain processing chat from ${author}: ${message}`);

    if (this.openai) {
      try {
        const completion = await this.openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: `Recent Conversation:\n${history}\n\nChat message from ${author}: "${message}"` }
          ],
          temperature: 0.9, // Higher creativity to avoid repetition
          max_tokens: 150
        });

        const content = completion.data.choices[0].message.content;
        try {
            return JSON.parse(content);
        } catch (e) {
            // Fallback if JSON parsing fails
            return {
                text: content,
                emotion: "happy",
                action: "wave"
            };
        }
      } catch (error) {
        console.error("OpenAI Error:", error);
        return this.getFallbackResponse();
      }
    } else {
      console.log("AI Brain: OpenAI not initialized. Using Mock Response.");
      return this.getFallbackResponse();
    }
  }
}

module.exports = new AIBrain();
