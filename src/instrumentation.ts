export async function register() {
  // Background jobs only run in the Node.js server, not in the edge (middleware) runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startAidRequestNotifier } = await import("@/lib/aid-notifier");
    startAidRequestNotifier();
  }
}
