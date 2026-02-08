import { World } from './world.js';
import { Character } from './character.js';
import { Text3DSystem } from './text3d.js';

// Configuration
const WS_URL = 'ws://' + window.location.host;

// State
let world, character, textSystem;
let ws;
let isStarted = false;

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-overlay').style.display = 'none';
    isStarted = true;
    init();
});

function init() {
    console.log("Initializing Streamer-AI Frontend...");

    // Initialize World (Scene, Camera, Renderer)
    world = new World(document.getElementById('canvas-container'));

    // Initialize Character
    character = new Character(world.scene);

    // Initialize Text System
    textSystem = new Text3DSystem(world.scene);

    // Start Loop
    animate();

    // Connect WebSocket
    connectWebSocket();
}

function connectWebSocket() {
    const statusEl = document.getElementById('status');
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log("WebSocket connected!");
        statusEl.innerText = "Connected to AI Brain";
        statusEl.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        } catch (e) {
            console.error("Error parsing message:", e);
        }
    };

    ws.onclose = () => {
        console.log("WebSocket disconnected. Retrying...");
        statusEl.innerText = "Disconnected (Retrying...)";
        statusEl.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
        setTimeout(connectWebSocket, 3000);
    };
}

function handleServerMessage(message) {
    console.log("Server Message:", message);

    switch (message.type) {
        case 'chat':
            // Raw chat message (before AI processing - maybe show raw chat?)
            // For now, let's wait for processed commands.
            break;

        case 'ai-command':
            // Processed AI command from EventEngine
            executeCommand(message.command);
            break;

        case 'status':
            console.log("Status update:", message.message);
            break;
    }
}

function executeCommand(command) {
    if (!command) return;

    switch (command.type) {
        case 'tts':
            speak(command.text, command.emotion);
            break;

        case 'text3d':
            textSystem.createFloatingText(command.content, command.author, command.style);
            break;

        case 'animation':
            character.playAnimation(command.name, command.duration);
            break;
    }
}

function speak(text, emotion) {
    // Basic Web Speech API implementation
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech to prevent overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Improve voice selection logic
        const voices = window.speechSynthesis.getVoices();
        // Prioritize natural sounding voices
        const voice = voices.find(v => v.name.includes('Google US English')) ||
                      voices.find(v => v.name.includes('Microsoft Zira')) ||
                      voices.find(v => v.name.includes('Samantha')) || // macOS default
                      voices.find(v => v.lang.startsWith('en-US')) ||
                      voices[0];

        if (voice) utterance.voice = voice;

        // Adjust pitch/rate based on emotion (refined mapping)
        // Default values
        utterance.pitch = 1.0;
        utterance.rate = 1.0;

        if (emotion === 'excited' || emotion === 'happy') {
            utterance.pitch = 1.1; // Slightly higher
            utterance.rate = 1.1;  // Slightly faster
        } else if (emotion === 'bored') {
            utterance.pitch = 0.9; // Slightly lower
            utterance.rate = 0.9;  // Slightly slower
        } else if (emotion === 'angry') {
            utterance.pitch = 0.9; // Deeper
            utterance.rate = 1.2;  // Faster/Aggressive
        } else if (emotion === 'surprised') {
            utterance.pitch = 1.2; // High
            utterance.rate = 1.1;
        }

        window.speechSynthesis.speak(utterance);

        // Trigger lip sync animation on character (mock)
        // Duration = roughly 100ms per char
        if (character) character.startTalking(text.length * 100);
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (world && character && textSystem) {
        const delta = world.clock.getDelta();

        character.update(delta);
        textSystem.update(delta);
        world.render();
    }
}
