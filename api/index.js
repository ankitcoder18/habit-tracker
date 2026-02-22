// Vercel serverless function handler
// Using dynamic import for ESM compatibility in serverless

let app;

export default async function handler(req, res) {
  if (!app) {
    const module = await import('../backend/server.js');
    app = module.default;
  }
  return app(req, res);
}
