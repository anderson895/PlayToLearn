import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseStorage, isFirebaseConfigured } from './firebase';

export interface UploadedAsset {
  url: string;
  path: string;
}

/**
 * Generic upload helper. Uses Firebase Storage when configured. Falls back to
 * the local file URI so the UI keeps working in pure-demo mode.
 */
export async function uploadAsset(localUri: string, path: string): Promise<UploadedAsset> {
  if (!isFirebaseConfigured || !firebaseStorage) {
    return { url: localUri, path };
  }
  const res = await fetch(localUri);
  const blob = await res.blob();
  const ref = storageRef(firebaseStorage, path);
  await uploadBytes(ref, blob);
  const url = await getDownloadURL(ref);
  return { url, path };
}
