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
Bags SDK launches token with feeClaimers array on-chain
    ↓
Bags.fm distributes 1% of all volume to contributor wallets
    ↓
Contributors earn forever — even if they stop coding
```

### Fee Sharing Architecture

GitBags uses the **Bags Token Launch v2 API** with multi-wallet fee sharing:

```typescript
const feeShares = contributors.map(c => ({
  wallet: c.solanaWallet,          // resolved via Privy embedded wallets
  percentage: c.splitPercentage    // configured by maintainer
}));

await sdk.tokenLaunch.createTokenInfo({
  name: repoName,
  symbol: ticker,
  description: `Support contributors of ${repoSlug}`,
  image: iconUrl,
  feeShares,                       // up to 100 wallets supported
});
```

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Token Launch | [Bags.fm SDK](https://docs.bags.fm) | Token creation + fee split enforcement |
| Blockchain | Solana | L1 settlement, immutable fee splits |
| RPC | [Helius](https://helius.dev) | Fast RPC + webhook notifications |
| Wallet Infra | [Privy](https://privy.io) | Embedded wallets for non-crypto contributors |
| Contributor Data | GitHub REST API | Contributor rankings by commit count |
| Price/Volume | [Birdeye](https://birdeye.so) | Real-time token analytics |
| Frontend | Vanilla JS + HTML | Zero-dependency, fast-loading |
| Deployment | Vercel | Edge-deployed globally |

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/arivaldo/gitbags
cd gitbags

# No install needed — pure HTML/JS
# Just open public/index.html in your browser

# Or serve locally
npx serve public
```

### Environment Variables (for real token launch)

```env
BAGS_API_KEY=your_bags_api_key_from_developer_portal
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_key
PRIVY_APP_ID=your_privy_app_id
```

Get your Bags API key at: [bags.fm/developers](https://bags.fm/developers)

---

## Demo Flow

1. Visit [gitbags.vercel.app](https://gitbags.vercel.app)
2. Paste any public GitHub repo (try `https://github.com/solana-labs/solana`)
3. See top contributors fetched live from GitHub API
4. Adjust fee split sliders (must total 100%)
5. Configure token name + ticker
6. Launch token (devnet simulation — real launch requires Bags API key + Solana wallet)

---

## Roadmap

- [x] GitHub contributor fetching via public API
- [x] Configurable fee split UI (up to 8 contributors)
- [x] Token configuration + launch preview
- [x] Devnet simulation flow
- [ ] Phantom wallet adapter integration
- [ ] Real Bags API integration (mainnet launch)
- [ ] Privy embedded wallet creation for contributors
- [ ] Helius webhooks for real-time earnings notifications
- [ ] Birdeye dashboard — live volume + earnings per contributor
- [ ] GitHub OAuth — private repo support
- [ ] ENS/SNS domain resolution for contributor wallets
- [ ] Automatic SOL → USDC earnings conversion

---

## Why This Wins

GitBags is the **only app** at this hackathon that:

1. **Creates a new category** of Bags token — project-backed, not person-backed
2. **Drives real token launches** — every GitBags user creates a new Bags token
3. **Brings new users to Bags.fm** — GitHub devs who've never used Solana
4. **Maxes out fee-sharing** — the core differentiator of Bags.fm
5. **Uses 4 ecosystem partners** — Helius, Privy, Birdeye, and Bags all get value

---

## Built For

**Bags.fm Hackathon — Fee Sharing Category**

Built by [Alie Rivaldo Janneh](https://github.com/arivaldo) — DevOps & Cloud Engineer, Solana builder, São Paulo 🇧🇷

---

*"Your code earns forever."*
