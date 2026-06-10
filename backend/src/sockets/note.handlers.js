import noteService from "../services/note.service.js";
import logger from "../config/logger.js";

export default function noteHandlers(io, socket, activeUsers) {
  const userId = socket.user.id;

  socket.on("join:team", async (teamId) => {
    socket.join(`team:${teamId}`);
    socket.join(`user:${userId}`);
    logger.info("User joined team room", { userId, teamId });
  });

  socket.on("join:note", async (noteId) => {
    try {
      await noteService.getById(noteId, userId);
      socket.join(`note:${noteId}`);

      const collaborators = getNoteCollaborators(io, noteId, socket.id);
      socket.to(`note:${noteId}`).emit("user:joined", {
        id: userId,
        name: socket.user.name,
        socketId: socket.id,
      });

      socket.emit("collaborators:active", collaborators);
      logger.info("User joined note room", { userId, noteId });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("leave:note", (noteId) => {
    socket.leave(`note:${noteId}`);
    socket.to(`note:${noteId}`).emit("user:left", {
      userId,
      name: socket.user.name,
      socketId: socket.id,
    });
  });

  socket.on("note:editing", async (data) => {
    try {
      const { noteId, title, content, segments } = data;
      if (!noteId) return;
      await noteService.ensureWriteAccess(noteId, userId);
      socket.to(`note:${noteId}`).emit("note:editing", {
        noteId,
        title,
        content,
        segments,
        updatedBy: { id: userId, name: socket.user.name },
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("note:update", async (data) => {
    try {
      const { noteId, title, content } = data;
      const note = await noteService.update(
        noteId,
        userId,
        { title, content },
        { createVersion: false },
      );
      socket.to(`note:${noteId}`).emit("note:update", {
        ...note,
        updatedBy: { id: userId, name: socket.user.name },
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("note:create", async (data) => {
    try {
      const note = await noteService.create(userId, data);
      if (data.teamId) {
        io.to(`team:${data.teamId}`).emit("note:create", note);
      }
      socket.emit("note:create", note);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("note:delete", async (noteId) => {
    try {
      await noteService.delete(noteId, userId);
      io.to(`note:${noteId}`).emit("note:delete", { id: noteId });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("note:archive", async (noteId) => {
    try {
      const note = await noteService.archive(noteId, userId);
      io.to(`note:${noteId}`).emit("note:archive", note);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  socket.on("note:restore", async (noteId) => {
    try {
      const note = await noteService.restore(noteId, userId);
      io.to(`note:${noteId}`).emit("note:restore", note);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
}

function getNoteCollaborators(io, noteId, excludeSocketId) {
  const room = io.sockets.adapter.rooms.get(`note:${noteId}`);
  if (!room) return [];

  const collaborators = [];
  for (const socketId of room) {
    if (socketId === excludeSocketId) continue;
    const s = io.sockets.sockets.get(socketId);
    if (s?.user) {
      collaborators.push({ id: s.user.id, name: s.user.name, socketId });
    }
  }
  return collaborators;
}
