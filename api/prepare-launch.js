// GitBags — Serverless API: Prepare Token Launch
// Calls Bags REST API to create metadata + fee-share config + unsigned transaction
// Frontend receives the unsigned tx, signs with Phantom, then broadcasts

const BAGS_BASE_URL = 'https://api.bags.fm/api/v2';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.BAGS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'BAGS_API_KEY not configured',
      hint: 'Add BAGS_API_KEY to your Vercel environment variables at vercel.com/jannehs-projects/gitbags/settings/environment-variables',
      docUrl: 'https://dev.bags.fm'
    });
  }

  const { name, symbol, description, imageUrl, creatorWallet, feeShares, repoUrl } = req.body;

  // Validate
  if (!name || !symbol || !creatorWallet) {
    return res.status(400).json({ error: 'name, symbol, and creatorWallet are required' });
  }
  if (!feeShares || !Array.isArray(feeShares) || feeShares.length === 0) {
    return res.status(400).json({ error: 'feeShares array is required' });
  }
  const totalPct = feeShares.reduce((s, f) => s + f.percentage, 0);
  if (Math.round(totalPct) !== 100) {
    return res.status(400).json({ error: `Fee shares must total 100%, got ${totalPct}%` });
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
  };

  try {
    // ── STEP 1: Upload metadata ──────────────────────────────────────
    const metaBody = {
      name,
      symbol,
      description: description || `Support open-source contributors of ${repoUrl || name}`,
      ...(imageUrl ? { image: imageUrl } : {}),
      attributes: [
        { trait_type: 'Platform', value: 'GitBags' },
        { trait_type: 'Repository', value: repoUrl || '' },
        { trait_type: 'Contributors', value: String(feeShares.length) },
      ],
    };

    const metaRes = await fetch(`${BAGS_BASE_URL}/tokens/metadata`, {
      method: 'POST',
      headers,
      body: JSON.stringify(metaBody),
    });
    if (!metaRes.ok) {
      const err = await metaRes.json().catch(() => ({}));
      throw new Error(`Metadata upload failed: ${err.message || metaRes.statusText}`);
    }
    const { metadataUri } = await metaRes.json();

    // ── STEP 2: Create fee-share config ──────────────────────────────
    // Bags fee sharing: creator always first, then fee claimers
    // percentage values are in basis points of the creator's share
    // We distribute the creator's 50% of fees among contributors
    const feeClaimers = feeShares.map(f => ({
      wallet: f.wallet,
      percentageOfCreatorFees: Math.round(f.percentage * 100), // basis points
    }));

    const configRes = await fetch(`${BAGS_BASE_URL}/tokens/fee-share-config`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        creator: creatorWallet,
        feeClaimers,
        bagsConfigType: 'fa29606e-5e48-4c37-827f-4b03d58ee23d', // Default: 2%/2%
      }),
    });
    if (!configRes.ok) {
      const err = await configRes.json().catch(() => ({}));
      throw new Error(`Fee config failed: ${err.message || configRes.statusText}`);
    }
    const { configId } = await configRes.json();

    // ── STEP 3: Build unsigned token creation transaction ─────────────
    const createRes = await fetch(`${BAGS_BASE_URL}/tokens/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        creator: creatorWallet,
        metadataUri,
        configId,
        // Optional: initial buy (0 = no initial buy, cleaner for demo)
        initialBuyAmountSol: 0,
      }),
    });
    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(`Token creation failed: ${err.message || createRes.statusText}`);
    }
    const { transactions, mint } = await createRes.json();

    // Return unsigned transaction(s) + mint address to frontend
    return res.status(200).json({
      success: true,
      mint,
      transactions, // base64-encoded unsigned VersionedTransaction(s)
      configId,
      metadataUri,
      viewUrl: `https://bags.fm/token/${mint}`,
    });

  } catch (err) {
    console.error('[GitBags API Error]', err.message);
    return res.status(500).json({
      error: err.message,
      stage: 'bags_api',
    });
  }
}
