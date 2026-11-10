// Sends the WhatsApp "request received" confirmation for aid requests that were
// inserted directly into the database (the mobile app writes to Supabase and never
// calls this server). Runs inside the Next.js server process, started from
// src/instrumentation.ts.

import { prisma } from "@/lib/prisma";
import { sendAidConfirmation } from "@/lib/whatsapp";

const INTERVAL_MS = 5_000;
// Only confirm recent requests, so old rows are never messaged after a deploy.
const LOOKBACK_MS = 6 * 60 * 60 * 1000;
const BATCH_SIZE = 20;
// Temporary failures (rate limit / Wasender down) are retried with growing waits:
// 15s, 30s, 60s, 2m, 4m (~8 minutes in total), then we give up.
const MAX_ATTEMPTS = 6;
const RETRY_BASE_MS = 15_000;

let started = false;
let running = false;
const attempts = new Map<string, { n: number; nextAt: number }>();

async function tick() {
  if (running) return;
  running = true;
  try {
    const pending = await prisma.aidRequest.findMany({
      where: { whatsappSent: false, createdAt: { gte: new Date(Date.now() - LOOKBACK_MS) } },
      select: { id: true, transactionId: true, fullName: true, phone: true },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
    });

    for (const r of pending) {
      // Still waiting before retrying this one
      const prev = attempts.get(r.id);
      if (prev && prev.nextAt > Date.now()) continue;

      // Claim the row first so a request is never confirmed twice.
      const claimed = await prisma.aidRequest.updateMany({
        where: { id: r.id, whatsappSent: false },
        data: { whatsappSent: true },
      });
      if (claimed.count !== 1) continue;

      const requestId = r.transactionId || r.id.split("-")[0].toUpperCase();
      const result = await sendAidConfirmation(r.phone, r.fullName, requestId);

      if (result === "sent") {
        attempts.delete(r.id);
      } else if (result === "phone-limit") {
        attempts.delete(r.id); // too many for this number: stays marked, no message
      } else if (result === "global-limit") {
        // Hourly cap reached: put it back and wait, without using up retry attempts
        await prisma.aidRequest.update({ where: { id: r.id }, data: { whatsappSent: false } });
        break;
      } else if (result === "retry") {
        const n = (prev?.n ?? 0) + 1;
        if (n < MAX_ATTEMPTS) {
          attempts.set(r.id, { n, nextAt: Date.now() + RETRY_BASE_MS * 2 ** (n - 1) });
          // Release the claim so the next tick tries again, and stop this batch:
          // if WhatsApp is throttling us, sending more now only makes it worse.
          await prisma.aidRequest.update({ where: { id: r.id }, data: { whatsappSent: false } });
          console.warn(`Aid notifier: request ${requestId} will be retried (attempt ${n}/${MAX_ATTEMPTS})`);
          break;
        }
        attempts.delete(r.id);
        console.error(`Aid notifier: giving up on request ${requestId} after ${MAX_ATTEMPTS} attempts`);
      } else {
        console.error(`Aid notifier: confirmation for request ${requestId} was not sent`);
      }
    }
  } catch (error) {
    console.error("Aid notifier error:", error);
  } finally {
    running = false;
  }
}

export function startAidRequestNotifier() {
  if (started) return;
  started = true;

  if (!process.env.WASENDER_API_KEY) {
    console.warn("Aid notifier: WASENDER_API_KEY is not set — WhatsApp confirmations are disabled");
    return;
  }

  console.log(`Aid notifier: started (checks for new aid requests every ${INTERVAL_MS / 1000}s)`);
  setTimeout(tick, 5_000);
  setInterval(tick, INTERVAL_MS);
}
