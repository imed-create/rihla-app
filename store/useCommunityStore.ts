/**
 * RIHLA — Partner Community Store
 * ───────────────────────────────
 * Locally persisted forum posts and likes for the partner community.
 * Only the partner's own posts live here; the seeded discussions are
 * static content in the screen.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CommunityTopic = 'tips' | 'pricing' | 'equipment' | 'regions' | 'help';

export interface CommunityPost {
  id: string;
  author: string;
  topic: CommunityTopic;
  title: string;
  body: string;
  replies: number;
  likes: number;
  createdAt: string;
  /** True when this partner wrote the post. */
  mine: boolean;
}

interface CommunityState {
  posts: CommunityPost[];
  /** Post ids this partner has liked — including the seeded ones. */
  likedIds: string[];
  addPost: (data: Pick<CommunityPost, 'author' | 'topic' | 'title' | 'body'>) => CommunityPost;
  removePost: (id: string) => void;
  toggleLike: (id: string) => void;
  isLiked: (id: string) => boolean;
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      posts: [],
      likedIds: [],

      addPost: (data) => {
        const post: CommunityPost = {
          ...data,
          id: uid(),
          replies: 0,
          likes: 0,
          createdAt: new Date().toISOString(),
          mine: true,
        };
        set((s) => ({ posts: [post, ...s.posts] }));
        return post;
      },

      removePost: (id) => {
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== id),
          likedIds: s.likedIds.filter((likedId) => likedId !== id),
        }));
      },

      toggleLike: (id) => {
        set((s) => ({
          likedIds: s.likedIds.includes(id)
            ? s.likedIds.filter((likedId) => likedId !== id)
            : [...s.likedIds, id],
        }));
      },

      isLiked: (id) => get().likedIds.includes(id),
    }),
    {
      name: '@rihla_community',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
