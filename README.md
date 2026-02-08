# Streamer-AI

A real-time AI Character Engine that runs as a live animated character on a YouTube Live stream.

## Features

- **Real-time AI Personality**: Reacts to chat and subscribers with personality.
- **Visuals**: 3D character and floating text in a web browser source.
- **Mock Integration**: Currently simulates YouTube events for testing.
- **Modular Architecture**: Designed for extensibility.

## Project Structure

- `src/server.js`: Main backend entry point.
- `src/ai-brain`: Handles logic and personality.
- `src/event-engine`: Dispatches events to frontend.
- `public/`: Frontend assets and code (Three.js).

## Setup

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the server:
    ```bash
    npm start
    ```
    The server runs on `http://localhost:3000`.

## OBS Setup

1.  Add a **Browser Source** in OBS.
2.  Set URL to `http://localhost:3000`.
3.  Set Width to `1920` and Height to `1080`.
4.  Enable "Shutdown source when not visible" if desired.
5.  Use Chroma Key filter if you want a transparent background (set background color in `public/js/scene.js` or enable transparency).

## Development

- Run in development mode with auto-restart:
  ```bash
  npm run dev
  ```
- Trigger manual events via API:
  ```bash
  curl -X POST http://localhost:3000/api/trigger -H "Content-Type: application/json" -d '{"type":"CHAT_MESSAGE", "payload":{"author":"User", "message":"Hello"}}'
  ```

- Run integration test:
  ```bash
  node test_integration.js
  ```
