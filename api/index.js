// Vercel serverless entry: every /api/* request is handled by the Express app.
// The app is compiled from src/ to dist/ during the build (npm run build).
import app from "../dist/app.js";

export default app;
