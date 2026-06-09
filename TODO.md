# TODO - Fix Vercel correct responses after deployment

- [x] Implement proper Vercel API handlers for `/api/chat`, `/api/chat/stream`, `/api/documents`, etc. (avoid rewrite-to-TS-file approach)
- [x] Update `vercel.json` to only handle SPA routing to `index.html` (remove risky `/api/*` rewrite)
- [x] Verify `server.ts` exports an Express app usable in serverless context (no `app.listen` on Vercel)
- [x] Make build/start scripts consistent with Vercel (avoid `dist/server.cjs` dependency)
- [x] Add `/api/health` endpoint to confirm API is reachable
- [x] Validate locally (build); serverless handlers compile




