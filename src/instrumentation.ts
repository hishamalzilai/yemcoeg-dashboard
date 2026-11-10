export async function register() {
  // Background jobs only run in the Node.js server, not in the edge (middleware) runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startAidRequestNotifier } = await import("@/lib/aid-notifier");
    startAidRequestNotifier();

    // Create the ContactInfo table on first start (the app reads it for the contact page)
    const { ensureContactInfoTable } = await import("@/lib/contact-info");
    ensureContactInfoTable()
      .then(() => console.log("Contact info: table ready"))
      .catch((error) => console.error("Contact info: could not prepare table:", error));
  }
}
