# Streamer-AI: Real-time AI Character Engine

This project is a real-time AI Character Engine designed to run as a live animated character on a YouTube Live stream. It reacts to viewers, chat messages, and subscriptions with voice, animations, and 3D text.

## Features

- **AI Personality**: Powered by OpenAI (or mock mode), the character has a personality and reacts dynamically to chat.
- **3D Visualization**: Built with Three.js, featuring a 3D character and floating 3D text for chat messages.
- **Voice (TTS)**: The character speaks responses using Text-to-Speech (currently Web Speech API).
- **Event System**: Handles chat messages, subscriptions, and idle behaviors.
- **Modular Architecture**: Separate modules for AI, Events, TTS, Memory, and Frontend.

## Prerequisites

- Node.js (v16+)
- A modern web browser (Chrome/Edge recommended for Speech Synthesis)
- OBS Studio (for streaming)

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file and add your OpenAI API Key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
   If no key is provided, the system runs in "Mock Mode" with pre-defined responses.

## Running the Engine

1. Start the server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to:
   `http://localhost:3000`
3. Click the **"START ENGINE"** button to initialize audio and animations.

## Streaming with OBS

1. Open OBS Studio.
2. Add a **Browser Source**.
3. Set the URL to `http://localhost:3000`.
4. Set Width: 1920, Height: 1080.
5. Enable "Control audio via OBS" if you want the TTS to be captured directly as an audio source (you might need to interact with the browser source to start audio context).
   - *Tip*: Interacting with a Browser Source in OBS can be done by right-clicking the source -> "Interact". Then click "START ENGINE".
6. Chroma Key: The background is dark gray/black. You can change the background color in `frontend/js/world.js` to Green (`0x00ff00`) if you want to make it transparent over a game capture.

## Project Structure

- `server.js`: Main entry point, handles WebSocket and YouTube events.
- `youtube-listener/`: Connects to YouTube Live API (currently mock simulation).
- `ai-brain/`: Processes events and generates personality-driven responses.
- `event-engine/`: Converts AI decisions into animation commands.
- `tts-engine/`: Manages text-to-speech.
- `frontend/`: Three.js application for the visual representation.
- `memory-system/`: Stores recent interactions.
- `idle-system/`: Triggers behaviors when inactive.

## Customization

- **Character**: Modify `frontend/js/character.js` to change the appearance or animations.
- **Personality**: Edit the system prompt in `ai-brain/index.js`.
- **YouTube Connection**: Implement the real YouTube Live Chat API in `youtube-listener/index.js`.
