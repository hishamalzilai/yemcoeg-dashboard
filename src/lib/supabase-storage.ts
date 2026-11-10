import { createClient } from "@supabase/supabase-js";

const PUBLIC_PATH = "/storage/v1/object/public/";

/**
 * Deletes Supabase Storage files given their public URLs
 * (e.g. images the mobile app uploaded to the `aid_requests` bucket).
 * Returns how many were deleted; never throws.
 */
export async function deleteSupabaseFiles(urls: string[]): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !serviceKey || urls.length === 0) return 0;

  // Group object paths by bucket: <supabaseUrl>/storage/v1/object/public/<bucket>/<path>
  const byBucket = new Map<string, string[]>();
  const base = supabaseUrl.replace(/\/+$/, "") + PUBLIC_PATH;
  for (const url of urls) {
    if (!url.startsWith(base)) continue;
    const rest = decodeURIComponent(url.slice(base.length).split("?")[0]);
    const slash = rest.indexOf("/");
    if (slash <= 0) continue;
    const bucket = rest.slice(0, slash);
    const path = rest.slice(slash + 1);
    if (!path) continue;
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), path]);
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  let deleted = 0;
  for (const [bucket, paths] of byBucket) {
    for (let i = 0; i < paths.length; i += 500) {
      const { data, error } = await supabase.storage.from(bucket).remove(paths.slice(i, i + 500));
      if (error) console.error(`Error deleting files from Supabase bucket "${bucket}":`, error.message);
      else deleted += data?.length ?? 0;
    }
  }
  return deleted;
}

const AID_ATTACHMENTS_PREFIX = `${PUBLIC_PATH}aid_requests/`;

/** Short-lived link to a private aid-request attachment, from its stored public URL. */
export async function signedAttachmentUrl(storedUrl: string): Promise<string | null> {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const base = supabaseUrl + AID_ATTACHMENTS_PREFIX;
  if (!supabaseUrl || !serviceKey || !storedUrl.startsWith(base)) return null;

  const path = decodeURIComponent(storedUrl.slice(base.length).split("?")[0]);
  if (!path || path.includes("..")) return null;

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.storage.from("aid_requests").createSignedUrl(path, 120);
  if (error || !data) return null;
  return data.signedUrl;
}
