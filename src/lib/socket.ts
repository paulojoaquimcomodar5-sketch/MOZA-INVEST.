import { io } from 'socket.io-client';

const socket = io({
  transports: ['websocket'], // Use websocket only to avoid xhr poll errors in this environment
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 45000,
  autoConnect: true,
});

export default socket;
