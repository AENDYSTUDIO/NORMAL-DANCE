a# Project Ask Rules (Non-Obvious Only)

- **Server architecture**: Uses `server.ts` with Socket.IO on `/api/socketio` path (not standard Next.js server)
- **Wallet system**: Phantom wallet only with custom event emitter in `wallet-adapter.tsx` (not standard patterns)
- **Deflationary model**: 2% burn on all transactions implemented in `deflationary-model.ts` (affects all token operations)
- **Database pattern**: Global Prisma instance in `src/lib/db.ts` - never create new instances
- **TypeScript configuration**: Web3 code has relaxed types (`noImplicitAny: false`, `no-non-null-assertion: off`)
- **Error handling**: Wallet operations return 0 on error instead of throwing (silent failures)
- **Mobile app**: Separate Expo app with extensive React Native module mocking for testing
- **Build process**: Production builds use `tsx` directly, Next.js build is disabled
- **IPFS system**: Custom redundancy in `ipfs-enhanced.ts` with multi-gateway fallback (ipfs.io, pinata.cloud, cloudflare-ipfs.com)
- **Solana integration**: Fixed program IDs - NDT_PROGRAM_ID, TRACKNFT_PROGRAM_ID, STAKING_PROGRAM_ID in `wallet-adapter.tsx`
- **File chunking**: Large files automatically chunked in `ipfs-enhanced.ts` with manifest-based reconstruction
- **MCP server**: Separate Model Context Protocol server architecture in `src/mcp/server.ts`
- **Russian locale**: All SOL/token formatting uses Russian locale conventions
- **Custom event system**: Global `walletEmitter` in `wallet-adapter.tsx` for wallet state management