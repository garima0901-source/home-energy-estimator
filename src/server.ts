// Local entry point. On Vercel, api/index.js serves the same app.
import app from "./app.ts";
import { env } from "./config.ts";

app.listen(env.port, () => {
  console.log(`Estimator running on http://localhost:${env.port}`);
  console.log(`CRM: ${env.hubspotToken ? "HubSpot (live)" : "demo (in-memory)"} · AI: ${env.anthropicKey ? env.claudeModel : "template text (no ANTHROPIC_API_KEY)"}`);
});
