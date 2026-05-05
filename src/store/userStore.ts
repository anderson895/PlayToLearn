import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';
import { isFirebaseConfigured } from '@/services/firebase';
import { patchProfile } from '@/services/userProfile';

interface UserState {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User | null) => Promise<void>;
  hydrate: () => Promise<void>;
  addXp: (amount: number) => Promise<void>;
  loseHeart: () => Promise<void>;
  refillHearts: () => Promise<void>;
  completeLesson: (lessonId: string, xp: number) => Promise<void>;
  setSubscribed: (tier: 'plus' | 'family') => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@playtolearn/user';

const cacheLocally = async (user: User | null) => {
  if (!user) {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } else {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
};

const syncRemote = async (user: User | null, patch: Partial<User>) => {
  if (!isFirebaseConfigured || !user || user.id.startsWith('local-')) return;
  try {
    await patchProfile(user.id, patch);
  } catch {
    // Offline / rules issue — local cache wins, will retry next mutation.
  }
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  hydrated: false,

  setUser: async (user) => {
    set({ user });
    await cacheLocally(user);
  },

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ user: raw ? (JSON.parse(raw) as User) : null, hydrated: true });
  },

  addXp: async (amount) => {
    const u = get().user;
    if (!u) return;
    const next = { ...u, xp: u.xp + amount };
    set({ user: next });
    await cacheLocally(next);
    await syncRemote(next, { xp: next.xp });
  },

  loseHeart: async () => {
    const u = get().user;
    if (!u || u.isSubscribed) return;
    const next = { ...u, hearts: Math.max(0, u.hearts - 1) };
    set({ user: next });
    await cacheLocally(next);
    await syncRemote(next, { hearts: next.hearts });
  },

  refillHearts: async () => {
    const u = get().user;
    if (!u) return;
    const next = { ...u, hearts: 5 };
    set({ user: next });
    await cacheLocally(next);
    await syncRemote(next, { hearts: next.hearts });
  },

  completeLesson: async (lessonId, xp) => {
    const u = get().user;
    if (!u) return;
    const alreadyDone = u.completedLessons.includes(lessonId);
    const next: User = alreadyDone
      ? { ...u, xp: u.xp + xp }
      : {
          ...u,
          xp: u.xp + xp,
          streak: u.streak + 1,
          completedLessons: [...u.completedLessons, lessonId],
        };
    set({ user: next });
    await cacheLocally(next);
    await syncRemote(next, {
      xp: next.xp,
      streak: next.streak,
      completedLessons: next.completedLessons,
    });
  },

  setSubscribed: async (tier) => {
    const u = get().user;
    if (!u) return;
    const next: User = { ...u, isSubscribed: true, subscriptionTier: tier };
    set({ user: next });
    await cacheLocally(next);
    await syncRemote(next, { isSubscribed: true, subscriptionTier: tier });
  },

  logout: async () => {
    set({ user: null });
    await cacheLocally(null);
  },
}));
