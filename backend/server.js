const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: 
        '*',
        methods: ["GET", "POST", "DELETE", "PUT"],
      credentials: true, // Allow credentials if necessary
    },
  });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export the io instance to use in controllers
module.exports = io;
