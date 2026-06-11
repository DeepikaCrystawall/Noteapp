import { create } from 'zustand';
import { io } from 'socket.io-client';
import { env } from '@/config/env';

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  connect: (token) => {
    const existing = get().socket;
    if (existing?.connected) return existing;

    const socket = io(env.socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => set({ connected: true }));
    socket.on('disconnect', () => set({ connected: false }));

    set({ socket });
    return socket;
  },
  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },
}));
