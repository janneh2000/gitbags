// GitBags — Token Analytics API
// Uses correct Bags API endpoint + Birdeye for live token data

const BIRDEYE_BASE = 'https://public-api.birdeye.so';
const BAGS_BASE = 'https://public-api-v2.bags.fm/api/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { mint } = req.query;
  if (!mint) return res.status(400).json({ error: 'mint address required' });

  const birdeyeKey = process.env.BIRDEYE_API_KEY || '';
  const bagsKey = process.env.BAGS_API_KEY || '';

  try {
    const birdeyeHeaders = { 'X-API-KEY': birdeyeKey, 'x-chain': 'solana' };
    const bagsHeaders = { 'x-api-key': bagsKey };

    const [overviewRes, priceRes, feesRes] = await Promise.all([
      fetch(`${BIRDEYE_BASE}/defi/token_overview?address=${mint}`, { headers: birdeyeHeaders }),
      fetch(`${BIRDEYE_BASE}/defi/price?address=${mint}`, { headers: birdeyeHeaders }),
      fetch(`${BAGS_BASE}/token-launch/lifetime-fees?tokenMint=${mint}`, { headers: bagsHeaders }),
    ]);

    const [overview, price, fees] = await Promise.all([
      overviewRes.json().catch(() => ({})),
      priceRes.json().catch(() => ({})),
      feesRes.json().catch(() => ({})),
    ]);

    return res.status(200).json({
      success: true,
      token: {
        address: mint,
        name: overview.data?.name || '',
        symbol: overview.data?.symbol || '',
        price: price.data?.value || 0,
        priceChange24h: overview.data?.priceChange24hPercent || 0,
        volume24h: overview.data?.v24hUSD || 0,
        liquidity: overview.data?.liquidity || 0,
        marketCap: overview.data?.mc || 0,
        holders: overview.data?.holder || 0,
        totalFeesUsd: fees.response?.totalFees || 0,
        creatorFeesUsd: fees.response?.creatorFees || 0,
        viewUrl: `https://bags.fm/token/${mint}`,
        birdeyeUrl: `https://birdeye.so/token/${mint}?chain=solana`,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}