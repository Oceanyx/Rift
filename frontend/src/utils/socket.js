import { io } from 'socket.io-client';

console.log("Socket connecting to:", import.meta.env.VITE_SOCKET_URL);

// Use environment variable for WebSocket URL
const socket = io(import.meta.env.VITE_SOCKET_URL);

export default socket;
