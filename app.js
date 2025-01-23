require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const engine = require('ejs-mate');
const { Server } = require("socket.io");


const routes = require('./routes');

const app = express();
const port = 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Root route redirect to login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Use routes
app.use('/', routes);

// Create HTTP server and attach Socket.IO
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "https://d0ec-112-211-58-173.ngrok-free.app",
        methods: ["GET", "POST"]
    }
});

const users = {};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

io.on("connection", (socket) => {
    console.log('new User');

    // Chat signals
    socket.on('send-chat-message', data => {
        // Check if message contains an attachment
        if (data.attachment) {
            // Basic validation for file size
            const fileSize = Buffer.from(data.attachment.data.split(',')[1], 'base64').length;
            if (fileSize > MAX_FILE_SIZE) {
                socket.emit('error', 'File size too large. Maximum size is 5MB');
                return;
            }

            // Broadcast message with attachment
            socket.broadcast.emit('chat-message', {
                message: data.message,
                username: users[socket.id],
                attachment: {
                    name: data.attachment.name,
                    type: data.attachment.type,
                    data: data.attachment.data
                }
            });
        } else {
            // Broadcast regular message (your existing logic)
            socket.broadcast.emit('chat-message', {
                message: data.message,
                username: users[socket.id]
            });
        }
    });

    socket.on('new-user', username => {
        users[socket.id] = username
        socket.broadcast.emit('user-connected', username)
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
        console.log('user disconnected');
    });


    // Voice signals
    socket.on('signal', (data) => {
        socket.broadcast.emit('signal', data);
    });

    // Handle any errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.emit('error', 'An error occurred while processing your message');
    });
});