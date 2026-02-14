import { io } from 'socket.io-client';

// Dynamic URL based on current host (to support mobile on LAN)
const SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:3001`;

const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket']
});

socket.on('disconnect', () => {
    console.log('Socket disconnected');
});

export default socket;
