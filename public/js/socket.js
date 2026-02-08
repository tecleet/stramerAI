export function initSocket(character, textManager) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);

    socket.onopen = () => {
        console.log('Connected to WebSocket server');
        document.getElementById('status').textContent = 'Connected';
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('Received event:', data.type, data.payload);

            switch (data.type) {
                case 'AI_SPEAK':
                    character.speak(data.payload.text);
                    break;
                case 'AI_ANIMATION':
                    character.playAnimation(data.payload.animation);
                    break;
                case 'AI_SPAWN_OBJECT':
                    // If it's a text object
                    if (data.payload.object && data.payload.object.type === 'text') {
                        textManager.createFloatingText(data.payload.object.content, data.payload.object.author || 'AI');
                    }
                    break;
                case 'CHAT_MESSAGE':
                    // Optionally display chat immediately
                    textManager.createFloatingText(data.payload.message, data.payload.author);
                    break;
                case 'IDLE':
                    character.playAnimation('idle');
                    break;
                default:
                    console.warn('Unknown event type:', data.type);
            }
        } catch (e) {
            console.error('Error parsing WebSocket message:', e);
        }
    };

    socket.onclose = () => {
        console.log('Disconnected from WebSocket server');
        document.getElementById('status').textContent = 'Disconnected';
        // Reconnect logic could be added here
        setTimeout(() => initSocket(character, textManager), 3000);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}
