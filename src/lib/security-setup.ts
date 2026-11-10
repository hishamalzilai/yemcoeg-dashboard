// Security settings applied on every server start. Every step is idempotent and independent:
// one failing never blocks the others, and each logs a clear "Security:" line.

import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

/** Published in the project's history, so it must never be accepted again. */
export const DEFAULT_ADMIN_PASSWORD = "123456";

const AID_BUCKET = "aid_requests";

async function step(name: string, run: () => Promise<string | void>) {
  try {
    const note = await run();
    console.log(`Security: ${name}: ${note ?? "ok"}`);
  } catch (error) {
    // One line, so it is easy to find in the logs (database errors span several lines)
    const message = (error instanceof Error ? error.message : String(error)).replace(/\s+/g, " ").trim();
    console.error(`Security: ${name}: FAILED: ${message.slice(-300)}`);
  }
}

/** Replaces the default password on any admin still using it, if ADMIN_NEW_PASSWORD is set. */
async function secureDefaultAdmins(): Promise<string> {
  const admins = await prisma.admin.findMany({ select: { id: true, email: true, password: true } });
  const weak: typeof admins = [];
  for (const admin of admins) {
    if (await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, admin.password)) weak.push(admin);
  }
  if (weak.length === 0) return "no account uses the default password";

  const replacement = process.env.ADMIN_NEW_PASSWORD;
  if (!replacement || replacement.length < 12 || replacement === DEFAULT_ADMIN_PASSWORD) {
    return `WARNING: these accounts still have the default password and cannot log in until ADMIN_NEW_PASSWORD (12+ chars) is set: ${weak.map((a) => a.email).join(", ")}`;
  }
  const hash = await bcrypt.hash(replacement, 12);
  await prisma.admin.updateMany({ where: { id: { in: weak.map((a) => a.id) } }, data: { password: hash } });
  return `replaced the default password on ${weak.length} account(s). Remove ADMIN_NEW_PASSWORD now.`;
}

/**
 * Tracking now needs the transaction number AND the last 4 digits of the phone.
 * The old function accepted the 6-digit number alone, so requests could be enumerated.
 */
async function secureTracking(): Promise<string> {
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.get_tracking_status_v2(tracking_id text, phone_last4 text)
    RETURNS TABLE (
      "transactionId" text, "fullName" text, "aidType" text, "status" text,
      "notes" text, "createdAt" text, "updatedAt" text
    )
    LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
    AS $fn$
      SELECT r."transactionId", r."fullName", r."aidType", r."status", r."notes",
             to_char(r."createdAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
             to_char(r."updatedAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
      FROM "AidRequest" r
      WHERE phone_last4 ~ '^[0-9]{4}$'
        AND r."transactionId" = tracking_id
        AND right(regexp_replace(r."phone", '[^0-9]', '', 'g'), 4) = phone_last4
      LIMIT 1
    $fn$`);

  await prisma.$executeRawUnsafe(`
    DO $do$
    BEGIN
      REVOKE ALL ON FUNCTION public.get_tracking_status_v2(text, text) FROM PUBLIC;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        GRANT EXECUTE ON FUNCTION public.get_tracking_status_v2(text, text) TO anon;
        IF to_regprocedure('public.get_tracking_status(text)') IS NOT NULL THEN
          REVOKE ALL ON FUNCTION public.get_tracking_status(text) FROM PUBLIC, anon, authenticated;
        END IF;
      END IF;
    END $do$`);

  await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema'`);

  const rows = await prisma.$queryRawUnsafe<{ is_open: boolean | null }[]>(`
    SELECT CASE
      WHEN to_regprocedure('public.get_tracking_status(text)') IS NULL THEN false
      WHEN NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN false
      ELSE has_function_privilege('anon', 'public.get_tracking_status(text)', 'EXECUTE')
    END AS is_open`);
  return rows[0]?.is_open
    ? "WARNING: new function ready, but the old get_tracking_status is STILL callable by the public. Run in Supabase SQL Editor: REVOKE ALL ON FUNCTION public.get_tracking_status(text) FROM PUBLIC, anon, authenticated;"
    : "transaction number + phone required; old function closed";
}

/**
 * The app may still upload attachments, but the public can no longer list, read,
 * overwrite or delete them. RESTRICTIVE policies apply on top of any existing ones.
 */
async function secureAttachmentPolicies(): Promise<string> {
  await prisma.$executeRawUnsafe(`
    DO $do$
    DECLARE
      cmd text;
      policy_name text;
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN RETURN; END IF;
      FOREACH cmd IN ARRAY ARRAY['SELECT', 'UPDATE', 'DELETE'] LOOP
        policy_name := 'aid_requests_block_public_' || lower(cmd);
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = policy_name
        ) THEN
          EXECUTE format(
            'CREATE POLICY %I ON storage.objects AS RESTRICTIVE FOR %s TO anon, authenticated USING (bucket_id <> %L)',
            policy_name, cmd, '${AID_BUCKET}'
          );
        END IF;
      END LOOP;
    END $do$`);
  return "public list/read/overwrite/delete blocked";
}

async function makeAttachmentBucketPrivate(): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return "skipped: Supabase is not configured";
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.storage.updateBucket(AID_BUCKET, { public: false });
  if (error) throw new Error(error.message);
  return "bucket is private";
}

export async function applySecuritySetup() {
  await step("default admin password", secureDefaultAdmins);
  await step("tracking", secureTracking);
  await step("attachment policies", secureAttachmentPolicies);
  await step("attachment bucket", makeAttachmentBucketPrivate);
}
