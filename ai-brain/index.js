const { Configuration, OpenAIApi } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

class AIBrain {
  constructor() {
    this.systemPrompt = `You are a chaotic, funny, and interactive AI streamer.
    You are live on YouTube.
    Your personality: playful, slightly unhinged, loves 3D text, reacts physically to chat.

    When you receive a chat message, generate a JSON response with:
    - "text": what you say (keep it short, under 2 sentences).
    - "emotion": one of ["happy", "angry", "surprised", "bored", "confused"].
    - "action": a physical action like ["wave", "jump", "dance", "attack", "eat"].

    If someone subscribes, be very excited and welcome them.`;

    // Initialize OpenAI if key is present
    if (process.env.OPENAI_API_KEY) {
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.openai = new OpenAIApi(configuration);
    } else {
      console.log("AI Brain: No OpenAI API Key found. Using Mock Mode.");
    }
  }

  async processChat(author, message, history = "") {
    console.log(`AI Brain processing chat from ${author}: ${message}`);

    if (this.openai) {
      try {
        const completion = await this.openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: this.systemPrompt },
            { role: "user", content: `Context:\n${history}\n\nChat message from ${author}: "${message}"` }
          ],
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
        return this.mockResponse(author, message, history);
      }
    } else {
      return this.mockResponse(author, message, history);
    }
  }

  mockResponse(author, message, history) {
    const msg = message.toLowerCase();

    if (msg.includes("jump")) {
        return { text: "Boing! Boing! I love jumping!", emotion: "excited", action: "jump" };
    }
    if (msg.includes("dance")) {
        return { text: "Party time! Let's dance!", emotion: "happy", action: "dance" };
    }
    if (msg.includes("wave") || msg.includes("hello") || /\bhi\b/.test(msg)) {
        return { text: `Hello there, ${author}!`, emotion: "happy", action: "wave" };
    }

    const responses = [
      { text: `Hey ${author}! That's awesome!`, emotion: "happy", action: "jump" },
      { text: `I don't know about that, ${author}...`, emotion: "confused", action: "scratch_head" },
      { text: `Omg ${author}, you are hilarious!`, emotion: "happy", action: "laugh" },
      { text: `Boring! Next!`, emotion: "bored", action: "yawn" },
      { text: `Did you just say that?`, emotion: "surprised", action: "shock" }
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

module.exports = new AIBrain();
