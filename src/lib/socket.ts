import { io } from 'socket.io-client';

const socket = io({
  transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 60000,
  autoConnect: true,
});

export default socket;
