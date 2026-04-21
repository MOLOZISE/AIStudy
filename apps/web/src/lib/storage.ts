import { supabase } from './supabase';

export async function uploadPostImage(file: File, postId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `posts/${postId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('posts').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  const { data } = supabase.storage.from('posts').getPublicUrl(path);
  return data.publicUrl;
}
