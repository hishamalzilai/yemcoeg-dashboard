// Sends the WhatsApp "request received" confirmation for aid requests that were
// inserted directly into the database (the mobile app writes to Supabase and never
// calls this server). Runs inside the Next.js server process, started from
// src/instrumentation.ts.

import { prisma } from "@/lib/prisma";
import { sendWhatsApp, aidRequestReceivedMessage } from "@/lib/whatsapp";

const INTERVAL_MS = 60_000;
// Only confirm recent requests, so old rows are never messaged after a deploy.
const LOOKBACK_MS = 6 * 60 * 60 * 1000;
const BATCH_SIZE = 20;

let started = false;
let running = false;

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
      // Claim the row first so a request is never confirmed twice.
      const claimed = await prisma.aidRequest.updateMany({
        where: { id: r.id, whatsappSent: false },
        data: { whatsappSent: true },
      });
      if (claimed.count !== 1) continue;

      const requestId = r.transactionId || r.id.split("-")[0].toUpperCase();
      const ok = await sendWhatsApp(r.phone, aidRequestReceivedMessage(r.fullName, requestId));
      if (!ok) console.error(`Aid notifier: confirmation for request ${requestId} was not sent`);
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

  console.log("Aid notifier: started (checks for new aid requests every 60s)");
  setTimeout(tick, 10_000);
  setInterval(tick, INTERVAL_MS);
}
