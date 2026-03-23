# GitBags — Fund Open Source Forever

> Launch a Bags token for any GitHub repo. Trading fees auto-split to every contributor — proportional to their commits. No custody. No middleman. No cap.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-gitbags.vercel.app-00ff88?style=for-the-badge)](https://gitbags.vercel.app)
[![Bags Hackathon](https://img.shields.io/badge/Bags%20Hackathon-Fee%20Sharing-blue?style=for-the-badge)](https://bags.fm/hackathon)
[![Built on Solana](https://img.shields.io/badge/Built%20on-Solana-9945FF?style=for-the-badge)](https://solana.com)

---

## The Problem

Open-source maintainers collectively save the tech industry **billions of dollars** in engineering costs. They get paid **$0** in return.

Donation platforms don't scale. Sponsorships go to a handful of top projects. GitHub Stars don't pay rent.

## The Solution

**GitBags** turns any public GitHub repo into a revenue-generating asset on Solana.

1. **Paste** a GitHub repo URL
2. **Configure** fee splits across top contributors (proportional to commits)
3. **Launch** a Bags token — backed by the community who believes in the project
4. **Earn** 1% of all trading volume, forever, split automatically to every contributor

Every trade = passive income for contributors. No claiming, no custody, no friction.

---

## How It Works

```
GitHub Repo
    ↓
GitBags fetches top contributors via GitHub API
    ↓
Maintainer configures fee split percentages (must total 100%)
    ↓
Bags API creates token metadata (IPFS) + fee-share config on-chain
    ↓
Phantom wallet signs 2 transactions (fee-share config + token launch)
    ↓
Bags.fm distributes 1% of all volume to contributor wallets forever
    ↓
Birdeye dashboard shows live price, volume, and earnings per contributor
```

### Fee Sharing Architecture

GitBags uses the **Bags Token Launch v1 API** with multi-wallet fee sharing:

```javascript
// Step 1: Create token metadata on IPFS
POST /token-launch/create-token-info
→ returns tokenMint + tokenMetadata (IPFS URI)

// Step 2: Configure fee splits on-chain
POST /fee-share/config
{
  payer: creatorWallet,
  baseMint: tokenMint,
  claimersArray: ["wallet1", "wallet2", ...],
  basisPointsArray: [4000, 1500, 1000, ...],  // basis points, sum = 10000
  bagsConfigType: "fa29606e-5e48-4c37-827f-4b03d58ee23d"
}
→ returns meteoraConfigKey + unsigned transactions

// Step 3: Launch the token
POST /token-launch/create-launch-transaction
{ ipfs: tokenMetadata, tokenMint, wallet: creatorWallet, configKey: meteoraConfigKey }
→ returns base58-encoded launch transaction

// Phantom signs both transactions → token is live on Bags.fm
```

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Token Launch | [Bags.fm API v1](https://docs.bags.fm) | Token creation + fee split enforcement |
| Blockchain | Solana | L1 settlement, immutable fee splits |
| RPC | [Helius](https://helius.dev) | Fast RPC + webhook notifications |
| Wallet | [Phantom](https://phantom.app) | Transaction signing, auto-connect |
| Price/Volume | [Birdeye](https://birdeye.so) | Real-time token analytics dashboard |
| Contributor Data | GitHub REST API | Contributor rankings by commit count |
| Backend | Vercel Serverless Functions | API proxy with secure key management |
| Frontend | Vanilla JS + HTML | Zero-dependency, fast-loading |
| Deployment | Vercel | Edge-deployed globally, auto-deploy on push |

---

## Running Locally

```bash
git clone https://github.com/janneh2000/gitbags
cd gitbags
npx serve public   # frontend only

# For API routes:
npm install && vercel dev
```

### Environment Variables

```env
BAGS_API_KEY=your_bags_api_key
BIRDEYE_API_KEY=your_birdeye_api_key
```

---

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/prepare-launch` | POST | Bags API: metadata → fee config → launch tx |
| `/api/token-stats` | GET | Live token data from Birdeye + Bags fees |

---

## Roadmap

- [x] GitHub contributor fetching via public API
- [x] Configurable fee split UI (up to 8 contributors, sliders)
- [x] Token configuration + launch preview
- [x] Devnet simulation flow (graceful fallback)
- [x] Phantom wallet adapter — auto-connect + manual connect
- [x] Real Bags API integration — full 3-step mainnet launch flow
- [x] Birdeye dashboard — live price, volume, fees, holders, market cap
- [x] Contributor earnings split table post-launch
- [x] Vercel serverless API routes with secure env var key management
- [x] Professional README + GitHub documentation
- [ ] Privy embedded wallet creation for contributors without Solana wallets
- [ ] Helius webhooks — real-time earnings push notifications
- [ ] GitHub OAuth — private repo support
- [ ] ENS/SNS domain resolution for contributor wallets
- [ ] Automatic SOL → USDC earnings conversion

---

## Why This Wins

GitBags is the **only app** at this hackathon that:

1. **Creates a new category** of Bags token — project-backed, not person-backed
2. **Drives real token launches** — every GitBags user creates a new Bags token
3. **Brings new users to Bags.fm** — GitHub devs who've never used Solana
4. **Maxes out fee-sharing** — Bags.fm's core differentiator, up to 100 wallets
5. **Uses 4 ecosystem partners** — Helius, Phantom, Birdeye, and Bags all get value
6. **Solves a real problem** — OSS funding is broken; this fixes it permanently

---

## Built For

**Bags.fm Hackathon — Fee Sharing Category**

Built by [Alie Rivaldo Janneh](https://github.com/janneh2000) — DevOps & Cloud Engineer, Solana builder, São Paulo 🇧🇷

---

*"Your code earns forever."*