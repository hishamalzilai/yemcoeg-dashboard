// Contact page info (address, phones, socials, map location) shown in the mobile app.
// The app reads the "ContactInfo" table directly from Supabase (read-only via RLS);
// admins edit it from /admin/dashboard/contact.

import { prisma } from "@/lib/prisma";

export const CONTACT_INFO_ID = "main";

// Yemeni Community HQ in Egypt (Dokki, Giza) — from the official Google Maps place.
export const DEFAULT_LATITUDE = 30.0405289;
export const DEFAULT_LONGITUDE = 31.2071998;
export const DEFAULT_MAP_URL =
  "https://www.google.com/maps/place/%D9%85%D9%82%D8%B1+%D8%A7%D9%84%D8%AC%D8%A7%D9%84%D9%8A%D8%A9+%D8%A7%D9%84%D9%8A%D9%85%D9%86%D9%8A%D8%A9+%D9%81%D9%8A+%D9%85%D8%B5%D8%B1/@30.0405289,31.2071998,17z/data=!4m6!3m5!1s0x145847c521cdb18d:0xe5eda73ee7f9a194!8m2!3d30.0405289!4d31.2071998!16s%2Fg%2F11wqrwp1rt";
export const DEFAULT_ADDRESS =
  "25 شارع الدقي، الدور الرابع، متفرع من ميدان المساحة، محافظة الجيزة، جمهورية مصر العربية.";

/** Text fields an admin can edit (besides latitude/longitude). */
export const CONTACT_TEXT_FIELDS = [
  "address",
  "phone",
  "supportPhone",
  "email",
  "whatsapp",
  "facebookUrl",
  "instagramUrl",
  "xUrl",
  "mapUrl",
] as const;

let ensured: Promise<void> | null = null;

/**
 * Creates the ContactInfo table (if missing), makes it read-only for the app's public
 * Supabase roles, and seeds the default row. Idempotent and safe to call on every start.
 */
export function ensureContactInfoTable(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ContactInfo" (
          "id"           TEXT PRIMARY KEY DEFAULT 'main',
          "address"      TEXT NOT NULL DEFAULT '',
          "phone"        TEXT NOT NULL DEFAULT '',
          "supportPhone" TEXT NOT NULL DEFAULT '',
          "email"        TEXT NOT NULL DEFAULT '',
          "whatsapp"     TEXT NOT NULL DEFAULT '',
          "facebookUrl"  TEXT NOT NULL DEFAULT '',
          "instagramUrl" TEXT NOT NULL DEFAULT '',
          "xUrl"         TEXT NOT NULL DEFAULT '',
          "latitude"     DOUBLE PRECISION NOT NULL DEFAULT ${DEFAULT_LATITUDE},
          "longitude"    DOUBLE PRECISION NOT NULL DEFAULT ${DEFAULT_LONGITUDE},
          "mapUrl"       TEXT NOT NULL DEFAULT '',
          "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);

      // Supabase: the app (anon key) may only READ this table; writes go through the dashboard.
      await prisma.$executeRawUnsafe(`ALTER TABLE "ContactInfo" ENABLE ROW LEVEL SECURITY`);
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
            GRANT SELECT ON "ContactInfo" TO anon;
            IF NOT EXISTS (
              SELECT 1 FROM pg_policies
              WHERE schemaname = 'public' AND tablename = 'ContactInfo' AND policyname = 'Public can read contact info'
            ) THEN
              CREATE POLICY "Public can read contact info" ON "ContactInfo" FOR SELECT TO anon USING (true);
            END IF;
          END IF;
        END $$`);

      await prisma.contactInfo.upsert({
        where: { id: CONTACT_INFO_ID },
        update: {},
        create: {
          id: CONTACT_INFO_ID,
          address: DEFAULT_ADDRESS,
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          mapUrl: DEFAULT_MAP_URL,
        },
      });
    })().catch((error) => {
      ensured = null; // retry on the next call
      throw error;
    });
  }
  return ensured;
}

export async function getContactInfo() {
  await ensureContactInfoTable();
  return prisma.contactInfo.findUniqueOrThrow({ where: { id: CONTACT_INFO_ID } });
}
