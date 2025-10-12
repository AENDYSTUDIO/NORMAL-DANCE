# Project Architecture Rules (Non-Obvious Only)

- **Server architecture**: Custom `server.ts` with Socket.IO on `/api/socketio` path (not standard Next.js server)
- **Wallet architecture**: Phantom-only wallet with custom event emitter system (not standard wallet-adapter-react patterns)
- **Deflationary economics**: 2% burn on all transactions creates automatic token scarcity and treasury distribution
- **Database architecture**: Global Prisma instance pattern creates singleton database access
- **Frontend-smart contract coupling**: Fixed program IDs create tight coupling between frontend and Solana programs
- **IPFS/Filecoin architecture**: Multi-gateway redundancy system with automatic fallback (ipfs.io, pinata.cloud, cloudflare-ipfs.com)
- **Mobile architecture**: Separate Expo app with complete module mocking layer, isolated from main app
- **Tokenomics**: 2% burn with 20% to staking rewards, 30% to treasury allocation (built into `deflationary-model.ts`)
- **MCP architecture**: Separate Model Context Protocol server creates additional service layer
- **File storage**: Large files automatically chunked with manifest-based reconstruction in `ipfs-enhanced.ts`
- **Event system**: Custom `walletEmitter` architecture for wallet state management
- **Build architecture**: `tsx` directly for production (Next.js build disabled) creates non-standard deployment flow