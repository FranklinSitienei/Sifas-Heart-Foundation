const http = require('http');
const app = require('./app');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // adjust this to your front-end domain
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export the io instance to use in controllers
module.exports = io;
