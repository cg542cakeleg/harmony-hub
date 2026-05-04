// Vercel serverless function — routes all /api/* requests to the Express app.
// Requires DATABASE_URL (and optionally SESSION_SECRET, GOOGLE_CLIENT_ID,
// GOOGLE_CLIENT_SECRET) to be set in Vercel environment variables.

let cachedApp: ((req: any, res: any) => void) | null = null;
let loadError: string | null = null;

async function loadApp() {
  if (cachedApp) return cachedApp;
  if (loadError) return null;
  try {
    const mod = await import("../artifacts/api-server/src/app.js");
    cachedApp = mod.default as (req: any, res: any) => void;
    return cachedApp;
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Failed to load API server";
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const app = await loadApp();
  if (!app) {
    res.status(503).json({
      error: "Backend not available",
      message:
        "Set DATABASE_URL in Vercel environment variables to enable authentication.",
      detail: loadError,
    });
    return;
  }
  app(req, res);
}
