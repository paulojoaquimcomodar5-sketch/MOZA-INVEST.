import { io } from 'socket.io-client';

const socket = io({
  transports: ['polling', 'websocket'], // Start with polling for better compatibility on mobile data
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 45000,
  autoConnect: true,
});

export default socket;
