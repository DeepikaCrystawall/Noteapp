import { create } from 'zustand';

export const useTeamStore = create((set) => ({
  teams: [],
  activeTeam: null,
  setTeams: (teams) => set({ teams }),
  setActiveTeam: (team) => set({ activeTeam: team }),
  addTeam: (team) => set((s) => ({ teams: [...s.teams, team] })),
}));
