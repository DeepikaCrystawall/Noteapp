const PALETTE = [
  { name: 'violet', bg: '#ede9fe', text: '#5b21b6', cursor: '#7c3aed', ring: '#8b5cf6' },
  { name: 'sky', bg: '#e0f2fe', text: '#0369a1', cursor: '#0284c7', ring: '#0ea5e9' },
  { name: 'emerald', bg: '#d1fae5', text: '#047857', cursor: '#059669', ring: '#10b981' },
  { name: 'amber', bg: '#fef3c7', text: '#b45309', cursor: '#d97706', ring: '#f59e0b' },
  { name: 'rose', bg: '#ffe4e6', text: '#be123c', cursor: '#e11d48', ring: '#f43f5e' },
  { name: 'indigo', bg: '#e0e7ff', text: '#3730a3', cursor: '#4f46e5', ring: '#6366f1' },
  { name: 'teal', bg: '#ccfbf1', text: '#0f766e', cursor: '#0d9488', ring: '#14b8a6' },
  { name: 'orange', bg: '#ffedd5', text: '#c2410c', cursor: '#ea580c', ring: '#f97316' },
];

export function getUserColor(userId) {
  if (!userId) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
