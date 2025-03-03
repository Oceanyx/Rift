const socketIO = require('socket.io');
let io;

// Set up the WebSocket server
function setupWebSocketServer(server) {
  io = socketIO(server, {
    cors: {
      origin: '*', // Update for production security as needed
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Clients join a server room with "joinServer"
    socket.on('joinServer', (serverId) => {
      const room = `server_${serverId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Clients join a channel room with "joinChannel"
    socket.on('joinChannel', (channelId) => {
      const room = `channel_${channelId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Optional: leave events
    socket.on('leaveServer', (serverId) => {
      const room = `server_${serverId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on('leaveChannel', (channelId) => {
      const room = `channel_${channelId}`;
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// Broadcast an event to all clients in a specific server room
function broadcastToServer(serverId, payload) {
  if (!io) return;
  io.to(`server_${serverId}`).emit('server-event', payload);
}

// Broadcast an event to all clients in a specific channel room
function broadcastToChannel(channelId, payload) {
  if (!io) return;
  io.to(`channel_${channelId}`).emit('channel-event', payload);
}

module.exports = { setupWebSocketServer, broadcastToServer, broadcastToChannel };
