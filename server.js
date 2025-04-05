const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('joinRoom', ({ roomId, nickname, color }) => {
    // Join the room
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Map()
      });
    }
    
    const room = rooms.get(roomId);
    
    // Add user to room
    room.users.set(socket.id, { 
      nickname, 
      color,
      socketId: socket.id
    });
    
    // Send current users to the new user
    const usersList = Array.from(room.users.values()).map(user => ({
      id: user.socketId,
      nickname: user.nickname,
      color: user.color
    }));
    socket.emit('currentUsers', usersList);
    
    // Notify others in the room
    socket.to(roomId).emit('userJoined', { 
      id: socket.id, 
      nickname, 
      color 
    });
    
    // Send welcome message
    socket.emit('message', {
      id: 'system-welcome',
      text: `Welcome to room ${roomId}!`,
      sender: 'System',
      senderColor: '#666',
      timestamp: Date.now()
    });
    
    // Notify others about new user
    socket.to(roomId).emit('message', {
      id: `system-join-${socket.id}`,
      text: `${nickname} joined the chat`,
      sender: 'System',
      senderColor: '#666',
      timestamp: Date.now()
    });
  });
  
  socket.on('sendMessage', ({ roomId, encryptedMessage, iv }) => {
    const room = rooms.get(roomId);
    if (room) {
      const user = room.users.get(socket.id);
      if (user) {
        const newMsg = {
          id: `${socket.id}-${Date.now()}`,
          encryptedMessage,
          iv,
          sender: user.nickname,
          senderColor: user.color,
          timestamp: Date.now()
        };
        
        // Send to everyone in the room including sender
        console.log(newMsg.encryptedMessage);
        io.to(roomId).emit('message', newMsg);
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find which room this user was in
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id);
        
        // Notify others in the room
        socket.to(roomId).emit('userLeft', socket.id);
        socket.to(roomId).emit('message', {
          id: `system-left-${socket.id}`,
          text: `${user.nickname} left the chat`,
          sender: 'System',
          senderColor: '#666',
          timestamp: Date.now()
        });
        
        // Remove user from room
        room.users.delete(socket.id);
        
        // Delete room if empty
        if (room.users.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (no users)`);
        }
        
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));