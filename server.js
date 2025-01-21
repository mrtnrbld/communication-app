const { Server } = require("socket.io");

const users = {}
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

const io = new Server(5500, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log('new User')

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

    // Handle any errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.emit('error', 'An error occurred while processing your message');
    });
});