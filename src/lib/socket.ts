import { io } from 'socket.io-client';

const socket = io({
  transports: ['polling'], // Force polling to ensure connectivity in proxy environments
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
});

export default socket;
