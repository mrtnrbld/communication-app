const { Server } = require("socket.io");

const users = {}

const io = new Server(5500, {
    cors: {
        origin: "http://localhost:3000", // Replace with your client's origin
        methods: ["GET", "POST"] // Optional: specify allowed HTTP methods
    }
});

io.on("connection", (socket) => {
    console.log('new User')

    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', {message: message, username:users[socket.id]})
    })

    socket.on('new-user', username => {
        users[socket.id] = username
        socket.broadcast.emit('user-connected', username)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
