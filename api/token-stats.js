// GitBags — Token Analytics API
// Fetches live token data from Birdeye for the earnings dashboard

const BIRDEYE_BASE = 'https://public-api.birdeye.so';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mint } = req.query;
  if (!mint) return res.status(400).json({ error: 'mint address required' });

  const birdeyeKey = process.env.BIRDEYE_API_KEY || '';

  try {
    const headers = {
      'X-API-KEY': birdeyeKey,
      'x-chain': 'solana',
    };

    // Fetch token overview + price in parallel
    const [overviewRes, priceRes] = await Promise.all([
      fetch(`${BIRDEYE_BASE}/defi/token_overview?address=${mint}`, { headers }),
      fetch(`${BIRDEYE_BASE}/defi/price?address=${mint}`, { headers }),
    ]);

    const [overview, price] = await Promise.all([
      overviewRes.json().catch(() => ({})),
      priceRes.json().catch(() => ({})),
    ]);

    // Bags fee data (public endpoint, no key needed)
    const feesRes = await fetch(
      `https://api.bags.fm/api/v2/tokens/${mint}/lifetime-fees`
    ).catch(() => null);
    const fees = feesRes ? await feesRes.json().catch(() => ({})) : {};

    return res.status(200).json({
      success: true,
      token: {
        address: mint,
        name: overview.data?.name || 'Unknown',
        symbol: overview.data?.symbol || '???',
        price: price.data?.value || 0,
        priceChange24h: overview.data?.priceChange24hPercent || 0,
        volume24h: overview.data?.v24hUSD || 0,
        liquidity: overview.data?.liquidity || 0,
        marketCap: overview.data?.mc || 0,
        holders: overview.data?.holder || 0,
        totalFeesUsd: fees.totalFeesUsd || 0,
        creatorFeesUsd: fees.creatorFeesUsd || 0,
        viewUrl: `https://bags.fm/token/${mint}`,
        birdeyeUrl: `https://birdeye.so/token/${mint}?chain=solana`,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
