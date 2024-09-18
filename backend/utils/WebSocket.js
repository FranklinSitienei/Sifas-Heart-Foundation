const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    // Send leaderboard updates to connected clients
    socket.on('getLeaderboard', async () => {
        try {
            const topDonors = await User.find().sort({ totalDonated: -1 }).limit(10);
            socket.emit('leaderboardUpdate', topDonors);
        } catch (err) {
            console.error('Error fetching leaderboard data', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});
