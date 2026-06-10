import noteService from '../services/note.service.js';

const typingUsers = new Map();

export default function presenceHandlers(io, socket) {
  const userId = socket.user.id;

  socket.on('typing:start', async ({ noteId }) => {
    try {
      await noteService.ensureWriteAccess(noteId, userId);
      if (!typingUsers.has(noteId)) typingUsers.set(noteId, new Map());
      typingUsers.get(noteId).set(userId, { name: socket.user.name, socketId: socket.id });

      socket.to(`note:${noteId}`).emit('typing:start', {
        userId,
        name: socket.user.name,
      });
    } catch {
      /* viewers cannot broadcast typing */
    }
  });

  socket.on('typing:stop', ({ noteId }) => {
    const noteTypers = typingUsers.get(noteId);
    if (noteTypers) noteTypers.delete(userId);

    socket.to(`note:${noteId}`).emit('typing:stop', { userId });
  });

  socket.on('cursor:update', async ({ noteId, position }) => {
    try {
      await noteService.ensureWriteAccess(noteId, userId);
      socket.to(`note:${noteId}`).emit('cursor:update', {
        userId,
        name: socket.user.name,
        position,
      });
    } catch {
      /* viewers cannot broadcast cursor */
    }
  });

  socket.on('disconnect', () => {
    for (const [noteId, typers] of typingUsers.entries()) {
      if (typers.has(userId)) {
        typers.delete(userId);
        socket.to(`note:${noteId}`).emit('typing:stop', { userId });
        socket.to(`note:${noteId}`).emit('user:left', {
          userId,
          name: socket.user.name,
        });
      }
    }
  });
}
