import { create } from 'zustand';

export const useNoteStore = create((set) => ({
  activeNote: null,
  collaborators: [],
  typingUsers: [],
  cursors: {},
  setActiveNote: (note) => set({ activeNote: note }),
  setCollaborators: (collaborators) => set({ collaborators }),
  addCollaborator: (user) => set((s) => {
    const id = user.id || user.userId;
    if (!id) return s;
    return {
      collaborators: [
        ...s.collaborators.filter((c) => c.id !== id),
        { id, name: user.name, socketId: user.socketId },
      ],
    };
  }),
  removeCollaborator: (userId) => set((s) => ({
    collaborators: s.collaborators.filter((c) => c.id !== userId),
  })),
  setTypingUsers: (typingUsers) => set({ typingUsers }),
  addTypingUser: (user) => set((s) => ({ typingUsers: [...s.typingUsers.filter((u) => u.userId !== user.userId), user] })),
  removeTypingUser: (userId) => set((s) => ({ typingUsers: s.typingUsers.filter((u) => u.userId !== userId) })),
  updateCursor: (userId, data) => set((s) => ({ cursors: { ...s.cursors, [userId]: data } })),
  removeCursor: (userId) => set((s) => {
    const next = { ...s.cursors };
    delete next[userId];
    return { cursors: next };
  }),
  clearNoteState: () => set({ activeNote: null, collaborators: [], typingUsers: [], cursors: {} }),
}));
