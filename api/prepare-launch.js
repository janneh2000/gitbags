// GitBags — Serverless API: Prepare Token Launch
// Correct Bags API: https://public-api-v2.bags.fm/api/v1/
//
// Flow:
//   1. POST /token-launch/create-token-info   → get tokenMint + tokenMetadata (IPFS URI)
//   2. POST /fee-share/config                 → get meteoraConfigKey + fee-share setup tx
//   3. POST /token-launch/create-launch-transaction → get signed launch tx
//   Frontend signs & broadcasts both txs with Phantom

const BASE = 'https://public-api-v2.bags.fm/api/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'BAGS_API_KEY not configured',
      hint: 'Add BAGS_API_KEY to Vercel environment variables',
      docUrl: 'https://dev.bags.fm'
    });
  }

  const { name, symbol, description, imageUrl, creatorWallet, feeShares, repoUrl, website } = req.body;

  if (!name || !symbol || !creatorWallet) {
    return res.status(400).json({ error: 'name, symbol, and creatorWallet are required' });
  }
  if (!feeShares?.length) {
    return res.status(400).json({ error: 'feeShares array is required' });
  }
  const totalPct = feeShares.reduce((s, f) => s + (f.percentage || 0), 0);
  if (Math.round(totalPct) !== 100) {
    return res.status(400).json({ error: `Fee shares must total 100%, got ${totalPct}%` });
  }

  const headers = { 'x-api-key': apiKey };

  try {
    // STEP 1: Create token info + metadata (multipart/form-data)
    const form = new FormData();
    form.append('name', name);
    form.append('symbol', symbol.toUpperCase());
    form.append('description', description || `Support open-source contributors of ${repoUrl || name}`);
    if (imageUrl) form.append('imageUrl', imageUrl);
    if (website || repoUrl) form.append('website', website || repoUrl);

    const infoRes = await fetch(`${BASE}/token-launch/create-token-info`, {
      method: 'POST',
      headers,
      body: form,
    });
    if (!infoRes.ok) {
      const err = await infoRes.json().catch(() => ({ message: infoRes.statusText }));
      throw new Error(`[Token Info] ${err.message || JSON.stringify(err)}`);
    }
    const infoData = await infoRes.json();
    const { tokenMint, tokenMetadata } = infoData.response;

    // STEP 2: Create fee-share config transaction
    const claimersArray = feeShares.map(f => f.wallet);
    const basisPointsArray = feeShares.map(f => Math.round(f.percentage * 100));

    const feeConfigRes = await fetch(`${BASE}/fee-share/config`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payer: creatorWallet,
        baseMint: tokenMint,
        claimersArray,
        basisPointsArray,
        bagsConfigType: 'fa29606e-5e48-4c37-827f-4b03d58ee23d',
      }),
    });
    if (!feeConfigRes.ok) {
      const err = await feeConfigRes.json().catch(() => ({ message: feeConfigRes.statusText }));
      throw new Error(`[Fee Config] ${err.message || JSON.stringify(err)}`);
    }
    const feeConfigData = await feeConfigRes.json();
    const { meteoraConfigKey, transactions: feeShareTxs, needsCreation } = feeConfigData.response;

    // STEP 3: Create launch transaction
    const launchRes = await fetch(`${BASE}/token-launch/create-launch-transaction`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ipfs: tokenMetadata,
        tokenMint,
        wallet: creatorWallet,
        initialBuyLamports: 0,
        configKey: meteoraConfigKey,
      }),
    });
    if (!launchRes.ok) {
      const err = await launchRes.json().catch(() => ({ message: launchRes.statusText }));
      throw new Error(`[Launch Tx] ${err.message || JSON.stringify(err)}`);
    }
    const launchData = await launchRes.json();

    return res.status(200).json({
      success: true,
      tokenMint,
      tokenMetadata,
      meteoraConfigKey,
      needsCreation,
      feeShareTransactions: needsCreation ? (feeShareTxs || []).map(t => t.transaction) : [],
      launchTransaction: launchData.response,
      viewUrl: `https://bags.fm/token/${tokenMint}`,
    });

  } catch (err) {
    console.error('[GitBags API]', err.message);
    return res.status(500).json({ error: err.message });
  }
}