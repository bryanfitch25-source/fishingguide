import { createClient } from "@/lib/supabase-browser";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8 MB

export async function uploadPhoto(
  supabase: SupabaseBrowserClient,
  folder: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  if (!file.type.startsWith("image/")) return { url: null, error: "Please choose an image file." };
  if (file.size > MAX_PHOTO_BYTES) return { url: null, error: "Image is too large (max 8 MB)." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "You've been signed out — please sign in again." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (uploadError) return { url: null, error: uploadError.message };

  const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(path);
  return { url: publicUrlData.publicUrl, error: null };
}
