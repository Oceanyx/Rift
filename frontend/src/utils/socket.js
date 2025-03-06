import { io } from 'socket.io-client';
const socket = io('http://localhost:8000'); // adjust URL as needed
export default socket;