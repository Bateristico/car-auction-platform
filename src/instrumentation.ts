export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamically import to avoid issues with client-side
    const { initializeCronJobs } = await import("./lib/cron")
    initializeCronJobs()
  }
}
