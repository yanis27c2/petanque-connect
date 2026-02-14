import { io } from 'socket.io-client';

const SOCKET_URL = "https://petanque-connect.onrender.com";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket']
});

socket.on('disconnect', () => {
    console.log('Socket disconnected');
});

export default socket;
