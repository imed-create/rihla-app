import { create } from 'zustand';

interface AIBubbleState {
  shouldOpen: boolean;
  triggerOpen: () => void;
  consumeTrigger: () => void;
}

export const useAIBubbleStore = create<AIBubbleState>((set) => ({
  shouldOpen: false,
  triggerOpen: () => set({ shouldOpen: true }),
  consumeTrigger: () => set({ shouldOpen: false }),
}));
