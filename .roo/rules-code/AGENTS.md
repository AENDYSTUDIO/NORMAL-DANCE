# Project Coding Rules (Non-Obvious Only)

- **Server architecture**: Use `server.ts` for custom Socket.IO integration with `/api/socketio` path (not standard `/socket.io`)
- **Wallet system**: Phantom wallet only with custom event emitter in `wallet-adapter.tsx` (not standard wallet-adapter-react patterns)
- **Deflationary model**: 2% burn applied via `DeflationaryModel` class for all token transactions
- **Database pattern**: Global Prisma instance from `src/lib/db.ts` - never create new instances
- **TypeScript exceptions**: Web3 code has intentionally relaxed types (`noImplicitAny: false`, `no-non-null-assertion: off`)
- **Error handling**: Wallet operations return 0 on error (silent failures), never throw
- **Build system**: Production builds use `tsx` directly, Next.js build is disabled
- **IPFS implementation**: Custom redundancy system in `src/lib/ipfs-enhanced.ts` with multi-gateway fallback
- **Solana integration**: Fixed program IDs in `wallet-adapter.tsx` - NDT_PROGRAM_ID, TRACKNFT_PROGRAM_ID, STAKING_PROGRAM_ID (never change)
- **File chunking**: Files >10MB automatically chunked in `ipfs-enhanced.ts` with manifest reconstruction
- **Mobile testing**: Requires extensive React Native module mocking in `mobile-app/jest.setup.js`
- **Token formatting**: Russian locale formatting for SOL amounts using `formatSol()`
- **MCP server**: Development uses `tsx watch`, production uses standard Node.js