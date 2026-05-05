import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  type User as FirebaseUser,
} from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from './firebase';
import { createProfile, fetchProfile } from './userProfile';
import type { User } from '@/types';

// Required for the OAuth redirect to dismiss the in-app browser on iOS.
WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'playtolearn.token';

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

interface AuthResponse {
  token: string;
  user: User;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !firebaseAuth) return stubAuth(email);
  const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const profile = (await fetchProfile(cred.user.uid)) ?? (await ensureProfile(cred.user, email));
  const token = await cred.user.getIdToken();
  await setToken(token);
  return { token, user: profile };
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  if (!isFirebaseConfigured || !firebaseAuth) return stubAuth(email, name);
  const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const profile = await createProfile(cred.user.uid, { name, email });
  const token = await cred.user.getIdToken();
  await setToken(token);
  return { token, user: profile };
}

export async function logout() {
  if (firebaseAuth) {
    try {
      await signOut(firebaseAuth);
    } catch {
      // ignore — clearing local state is what matters
    }
  }
  await clearToken();
}

async function ensureProfile(fbUser: FirebaseUser, email: string): Promise<User> {
  return createProfile(fbUser.uid, {
    name: fbUser.displayName ?? email.split('@')[0],
    email,
  });
}

// Hook for Google sign-in. Lives here so screens just call useGoogleAuth() and
// get a stable signIn() function — no need to know about expo-auth-session.
export function useGoogleAuth() {
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  async function signIn(): Promise<AuthResponse | null> {
    if (!isFirebaseConfigured || !firebaseAuth) {
      throw new Error('Firebase is not configured.');
    }
    const result = await promptAsync();
    if (result?.type !== 'success') return null; // user cancelled or dismissed

    const idToken = result.params.id_token;
    if (!idToken) throw new Error('Google did not return an ID token.');

    const credential = GoogleAuthProvider.credential(idToken);
    const cred = await signInWithCredential(firebaseAuth, credential);
    const profile =
      (await fetchProfile(cred.user.uid)) ??
      (await ensureProfile(cred.user, cred.user.email ?? ''));
    const token = await cred.user.getIdToken();
    await setToken(token);
    return { token, user: profile };
  }

  return { signIn, response };
}

function stubAuth(email: string, name?: string): AuthResponse {
  const user: User = {
    id: `local-${Date.now()}`,
    name: name ?? email.split('@')[0],
    email,
    language: 'en',
    hearts: 5,
    xp: 0,
    streak: 0,
    gems: 100,
    isSubscribed: false,
    subscriptionTier: 'free',
    completedLessons: [],
  };
  return { token: 'dev-token', user };
}
