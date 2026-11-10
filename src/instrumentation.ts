export async function register() {
  // Background jobs only run in the Node.js server, not in the edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startAidRequestNotifier } = await import("@/lib/aid-notifier");
    startAidRequestNotifier();

    // Create the ContactInfo table on first start (the app reads it for the contact page)
    const { ensureContactInfoTable } = await import("@/lib/contact-info");
    ensureContactInfoTable()
      .then(() => console.log("Contact info: table ready"))
      .catch((error) => console.error("Contact info: could not prepare table:", error));

    // Only on the real server: a local .env points at production, and running this from a
    // developer machine (or during a build) would change the live storage settings.
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      const { applySecuritySetup } = await import("@/lib/security-setup");
      applySecuritySetup().catch((error) => console.error("Security: setup failed:", error));
    }
  }
}
