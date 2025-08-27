Vercel deployment (client-only)
--------------------------------
This repository was adjusted to deploy the **client (Vite React)** app as a static site on Vercel.

Changes made:
- root `package.json` "build" now runs `vite build` (client build).
- Added `build:server` to separately bundle the server if needed.
- Added `build:full` to run both client and server builds.
- Added `vercel.json` instructing Vercel to serve `dist/public` (where the Vite build outputs).

How to deploy on Vercel (recommended):
1. In Vercel dashboard, create a new project pointing to this repo.
2. Let Vercel detect the framework; if needed, set:
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
3. Deploy. The static client will be served. The Express server is NOT deployed on Vercel with this config (use Render/Railway to host the server).

To build server locally (if you want to run Express):
- Run: `npm run build:full`
- Then: `node dist/index.js`

Notes on MemStorage:
- The in-memory `MemStorage` is ephemeral and will not persist across process restarts or serverless invocations.
