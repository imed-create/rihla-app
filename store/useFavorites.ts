import { create } from 'zustand';

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesState>((set) => ({
  favoriteIds: [],
  toggleFavorite: (id: string) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(id)
        ? state.favoriteIds.filter((favId) => favId !== id)
        : [...state.favoriteIds, id],
    })),
  clearFavorites: () => set({ favoriteIds: [] }),
}));
