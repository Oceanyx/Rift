import { io } from 'socket.io-client';
const socket = io('http://localhost:5173'); // adjust URL as needed
export default socket;