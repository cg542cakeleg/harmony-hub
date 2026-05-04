// Vercel serverless function — routes all /api/* requests to the Express app.
// The api-server is pre-built by esbuild (pnpm --filter @workspace/api-server run build)
// so this imports compiled JS, avoiding TypeScript compilation issues.
//
// Required Vercel env vars to enable full auth:
//   DATABASE_URL        — PostgreSQL connection string (e.g. from neon.tech)
//   SESSION_SECRET      — any long random string
//   GOOGLE_CLIENT_ID    — optional, for Google OAuth
//   GOOGLE_CLIENT_SECRET — optional, for Google OAuth

let cachedApp: ((req: any, res: any) => void) | null = null;
let loadError: string | null = null;

async function loadApp() {
  if (cachedApp) return cachedApp;
  if (loadError) return null;
  try {
    // Import from compiled output — avoids Vercel typechecking api-server source
    const mod = await import("../artifacts/api-server/dist/app.mjs" as string);
    cachedApp = mod.default as (req: any, res: any) => void;
    return cachedApp;
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load API server";
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const app = await loadApp();
  if (!app) {
    res.status(503).json({
      error: "Backend not available",
      message: "Set DATABASE_URL in Vercel environment variables to enable authentication.",
      detail: loadError,
    });
    return;
  }
  app(req, res);
}
