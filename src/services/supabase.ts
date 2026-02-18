import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET = 'Wall-MapuApi';

export async function uploadProductImage(
  file: File,
  shopId: string,
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `products/${shopId}/product_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadShopImage(
  file: File,
  shopId: string,
  type: 'logo' | 'banner',
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `shops/${shopId}/${type}_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBannerImage(
  file: File,
  shopId: string,
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `banners/${shopId}/banner_${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(publicUrl: string): Promise<void> {
  const urlObj = new URL(publicUrl);
  const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${BUCKET}/`);
  if (pathParts.length < 2) return;

  const filePath = decodeURIComponent(pathParts[1]);
  await supabase.storage.from(BUCKET).remove([filePath]);
}
