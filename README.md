# Crossgigs

**Agent-verified gig marketplace powered by Crossmint**

Complete jobs and receive instant USDC payments on base-sepolia testnet.

## Features

- 🎯 **Proof of Work Submission** - Freelancers provide deliverable links and descriptions before receiving payment
- 💰 **Instant USDC Payments** - Automated payments via Crossmint wallet integration on base-sepolia
- 🔗 **Blockchain Verification** - All transactions are recorded on-chain with clickable BaseScan links
- 📦 **Community Pool** - Transparent display of available funds for job payments
- ✅ **Job Management** - Track active and completed gigs with full submission history

## Tech Stack

- **Frontend**: React 19, TailwindCSS 4, shadcn/ui components
- **Backend**: Express, tRPC 11 for type-safe APIs
- **Database**: MySQL/TiDB with Drizzle ORM
- **Blockchain**: Crossmint API for wallet operations and USDC transfers
- **Authentication**: Manus OAuth

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- MySQL/TiDB database
- Crossmint API key (staging or production)

### Installation

```bash
# Clone the repository
git clone https://github.com/joycieland/crossgigs.git
cd crossgigs

# Install dependencies
pnpm install

# Set up environment variables
# Copy .env.example to .env and fill in your credentials
# Required: DATABASE_URL, API_KEY (Crossmint), JWT_SECRET

# Push database schema
pnpm db:push

# Seed sample jobs (optional)
node seed-jobs.mjs

# Start development server
pnpm dev
```

### Environment Variables

Key environment variables needed:

- `API_KEY` - Crossmint API key (staging: `sk_staging_...` or production: `sk_...`)
- `DATABASE_URL` - MySQL connection string
- `JWT_SECRET` - Secret for session management
- `VITE_APP_ID` - Manus OAuth application ID

## Usage

1. **Browse Available Gigs** - View all active jobs with payment amounts
2. **Submit Work** - Click "Submit Work", provide deliverable link and description
3. **Enter Wallet Address** - Provide your Ethereum wallet address for payment
4. **Receive Payment** - Instant USDC transfer on base-sepolia with transaction hash
5. **View History** - Check completed jobs with deliverable links and transaction details

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   └── lib/        # tRPC client setup
├── server/             # Express backend
│   ├── routers.ts      # tRPC API routes
│   ├── db.ts           # Database queries
│   ├── crossmint.ts    # Crossmint integration
│   └── _core/          # Framework plumbing
├── drizzle/            # Database schema
└── shared/             # Shared types and constants
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test jobs.test.ts
```

## Deployment

This project is designed to work with Manus hosting:

1. Create a checkpoint: `webdev_save_checkpoint`
2. Click "Publish" in the Manus UI
3. Get your `yourname.manus.space` domain
4. Optional: Bind custom domain in Settings → Domains

## License

MIT

## Acknowledgments

- Built with [Manus](https://manus.im)
- Powered by [Crossmint](https://crossmint.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
