export function setupChatSocket(io) {
  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`⚡ WebSocket client connected: ${socket.id}`);

    // User registers their active presence
    socket.on('user_online', (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        io.emit('online_users_list', Array.from(onlineUsers.keys()));
        console.log(`👤 User online: ${userId}`);
      }
    });

    // Join a specific room (e.g., project room or direct conversation room)
    socket.on('join_chat', ({ userId, partnerId, projectId }) => {
      const room = projectId 
        ? `project_${projectId}` 
        : [userId, partnerId].sort().join('_');
      socket.join(room);
      console.log(`🚪 Socket ${socket.id} joined room: ${room}`);
    });

    // Handle new message event
    socket.on('send_message', (messageData) => {
      const room = messageData.project_id 
        ? `project_${messageData.project_id}` 
        : [messageData.sender_id, messageData.receiver_id].sort().join('_');

      // Broadcast to room
      io.to(room).emit('receive_message', messageData);

      // Also notify receiver directly if online in another tab
      const receiverSocketId = onlineUsers.get(messageData.receiver_id);
      if (receiverSocketId && receiverSocketId !== socket.id) {
        io.to(receiverSocketId).emit('message_notification', messageData);
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ senderId, receiverId, projectId }) => {
      const room = projectId ? `project_${projectId}` : [senderId, receiverId].sort().join('_');
      socket.to(room).emit('user_typing', { senderId });
    });

    socket.on('typing_stop', ({ senderId, receiverId, projectId }) => {
      const room = projectId ? `project_${projectId}` : [senderId, receiverId].sort().join('_');
      socket.to(room).emit('user_stopped_typing', { senderId });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('online_users_list', Array.from(onlineUsers.keys()));
          console.log(`🔌 User disconnected: ${userId}`);
          break;
        }
      }
    });
  });
}
