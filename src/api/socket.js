import { io } from 'socket.io-client';

const SOCKET_URL = `http://${window.location.hostname}:3001`;

const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket']
});

socket.on('disconnect', () => {
    console.log('Socket disconnected');
});

export default socket;
