const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '';

export interface CloudinaryAsset {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  resourceType: 'image' | 'video' | 'raw';
}

/**
 * Upload to Cloudinary using an unsigned upload preset. Configure the preset
 * in the Cloudinary dashboard (Settings → Upload → Upload presets).
 */
export async function uploadToCloudinary(
  fileUri: string,
  resourceType: 'image' | 'video' = 'image',
): Promise<CloudinaryAsset> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary env vars missing');
  }

  const form = new FormData();
  // React Native FormData accepts the {uri, name, type} shape.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form.append('file', {
    uri: fileUri,
    name: `upload-${Date.now()}`,
    type: resourceType === 'image' ? 'image/jpeg' : 'video/mp4',
  } as any);
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: 'POST', body: form },
  );
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const json = await res.json();
  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
    resourceType,
  };
}

export function cdnUrl(publicId: string, opts: { w?: number; h?: number; q?: number } = {}) {
  const tx: string[] = ['f_auto'];
  if (opts.w) tx.push(`w_${opts.w}`);
  if (opts.h) tx.push(`h_${opts.h}`);
  tx.push(`q_${opts.q ?? 'auto'}`);
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${tx.join(',')}/${publicId}`;
}
