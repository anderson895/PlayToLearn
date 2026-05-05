import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { User } from '@/types';

const COLLECTION = 'users';

function ref(uid: string) {
  if (!firestore) throw new Error('Firestore not configured');
  return doc(firestore, COLLECTION, uid);
}

function fromDoc(uid: string, data: DocumentData): User {
  return {
    id: uid,
    name: data.name ?? 'Learner',
    email: data.email ?? '',
    avatarUrl: data.avatarUrl,
    language: data.language ?? 'en',
    hearts: data.hearts ?? 5,
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    gems: data.gems ?? 100,
    isSubscribed: !!data.isSubscribed,
    subscriptionTier: data.subscriptionTier ?? 'free',
    completedLessons: data.completedLessons ?? [],
  };
}

export async function fetchProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(ref(uid));
  if (!snap.exists()) return null;
  return fromDoc(uid, snap.data());
}

export async function createProfile(
  uid: string,
  seed: { name: string; email: string },
): Promise<User> {
  const initial: Omit<User, 'id'> = {
    name: seed.name,
    email: seed.email,
    language: 'en',
    hearts: 5,
    xp: 0,
    streak: 0,
    gems: 100,
    isSubscribed: false,
    subscriptionTier: 'free',
    completedLessons: [],
  };
  await setDoc(ref(uid), { ...initial, createdAt: serverTimestamp() });
  return { id: uid, ...initial };
}

export async function patchProfile(uid: string, patch: Partial<User>): Promise<void> {
  // Strip the id field — it's the doc id, never the field.
  const { id: _id, ...rest } = patch;
  await updateDoc(ref(uid), { ...rest, updatedAt: serverTimestamp() });
}
