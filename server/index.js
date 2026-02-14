import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chat.js';
import teamRoutes from './routes/team.js';
import notificationRoutes from './routes/notifications.js';
import postRoutes from './routes/posts.js';
import newsRoutes from './routes/news.js';
import resultRoutes from './routes/results.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
// Force restart

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for local network dev
        methods: ["GET", "POST"]
    }
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// App State (In-memory for active sockets)
const activeUsers = new Map(); // userId -> socketId

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/results', resultRoutes);



// Socket Logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join_user', (userId) => {
        activeUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
        io.emit('user_status', { userId, status: 'online' });
    });

    // --- Contest room for team real-time updates ---
    socket.on('join_contest', (contestId) => {
        socket.join(`contest:${contestId}`);
        console.log(`Socket ${socket.id} joined contest:${contestId}`);
    });
    socket.on('leave_contest', (contestId) => {
        socket.leave(`contest:${contestId}`);
    });



    // --- DM / Conversation Chat ---
    socket.on('send_message', (data) => {
        io.to(data.conversationId).emit('receive_message', data);
    });

    socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('user_typing', data);
    });



    socket.on('disconnect', () => {
        let userId = null;
        for (const [uid, sid] of activeUsers.entries()) {
            if (sid === socket.id) {
                userId = uid;
                break;
            }
        }
        if (userId) {
            activeUsers.delete(userId);
            console.log(`User ${userId} disconnected`);
            io.emit('user_status', { userId, status: 'offline' });
        }
    });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
