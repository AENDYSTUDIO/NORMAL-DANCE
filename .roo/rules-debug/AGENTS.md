# Project Debug Rules (Non-Obvious Only)

- **Server debugging**: Debug via `server.ts` (not Next.js), Socket.IO on `/api/socketio` path (not standard `/socket.io`)
- **Wallet debugging**: Custom event emitter in `wallet-adapter.tsx`, check for silent failures (returns 0 on error)
- **Database debugging**: Global Prisma instance in `src/lib/db.ts`, connection issues may persist across requests
- **Web3 debugging**: Relaxed TypeScript types (`noImplicitAny: false`, `no-non-null-assertion: off`) may hide runtime issues
- **Mobile debugging**: Real React Native modules unavailable - all functionality mocked in `mobile-app/jest.setup.js`
- **IPFS debugging**: Multi-gateway fallback system - check all gateways (ipfs.io, pinata.cloud, cloudflare-ipfs.com) if one fails
- **Solana debugging**: Fixed program IDs must match exactly - NDT_PROGRAM_ID, TRACKNFT_PROGRAM_ID, STAKING_PROGRAM_ID
- **Deflationary model**: 2% burn happens automatically - verify burn events and treasury distribution in transactions
- **IPFS chunking**: Large files chunked with manifest - debug manifest integrity and reconstruction issues
- **MCP server**: Debug via `npm run mcp:dev` with hot reload, separate from main application
- **Socket.IO server**: Custom `server.ts` handles both Next.js and Socket.IO - watch for port conflicts
- **Mobile app**: All React Native modules mocked - real functionality unavailable in debug mode