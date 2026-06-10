import { create } from 'zustand';

let count = 0;

const useToastStore = create((set, get) => ({
  toasts: [],
  toast: ({ title, description, variant }) => {
    const id = String(++count);
    set({ toasts: [...get().toasts, { id, title, description, variant }] });
    setTimeout(() => get().dismiss(id), 5000);
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = (props) => useToastStore.getState().toast(props);
export const useToast = () => {
  const { toasts, dismiss } = useToastStore();
  return { toasts, dismiss, toast: useToastStore.getState().toast };
};
