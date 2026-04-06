import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const ca = request.nextUrl.searchParams.get("ca");

  if (!ca) {
    return NextResponse.json({ error: "Contract address required" }, { status: 400 });
  }

  try {
    // Fetch token pairs from DexScreener
    const tokenRes = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${ca}`,
      { next: { revalidate: 60 } }
    );
    const tokenData = await tokenRes.json();

    // Get the first/main pair
    const pair = Array.isArray(tokenData) ? tokenData[0] : null;

    // Also check boost data
    let boostData = null;
    try {
      const boostRes = await fetch(
        `https://api.dexscreener.com/token-boosts/latest/v1`,
        { next: { revalidate: 60 } }
      );
      const boosts = await boostRes.json();
      if (Array.isArray(boosts)) {
        boostData = boosts.find(
          (b: Record<string, string>) =>
            b.tokenAddress?.toLowerCase() === ca.toLowerCase()
        );
      }
    } catch {
      // Boost data is optional
    }

    if (!pair) {
      return NextResponse.json({ error: "Token not found on DexScreener" }, { status: 404 });
    }

    // Extract all the useful info
    const result = {
      // Token info
      name: pair.baseToken?.name || null,
      symbol: pair.baseToken?.symbol || null,

      // Images
      imageUrl: pair.info?.imageUrl || boostData?.icon || null,
      headerUrl: pair.info?.header || boostData?.header || null,

      // Links
      website: null as string | null,
      twitter: null as string | null,
      telegram: null as string | null,
      dexscreenerUrl: pair.url || `https://dexscreener.com/solana/${ca}`,

      // Description
      description: boostData?.description || null,

      // Market data
      priceUsd: pair.priceUsd || null,
      marketCap: pair.marketCap || null,
      fdv: pair.fdv || null,
      liquidity: pair.liquidity?.usd || null,
      volume24h: pair.volume?.h24 || null,
      priceChange24h: pair.priceChange?.h24 || null,

      // Boost info
      boostAmount: boostData?.totalAmount || 0,
      isBoosted: !!boostData,

      // DexScreener paid status (has info section = paid)
      dexPaid: !!(pair.info?.imageUrl || pair.info?.header),
    };

    // Extract social links
    if (pair.info?.websites?.length) {
      result.website = pair.info.websites[0].url;
    }
    if (pair.info?.socials?.length) {
      for (const social of pair.info.socials) {
        if (social.type === "twitter" && !result.twitter) {
          result.twitter = social.url;
        }
        if (social.type === "telegram" && !result.telegram) {
          result.telegram = social.url;
        }
      }
    }

    // Also check boost links
    if (boostData?.links?.length) {
      for (const link of boostData.links) {
        if (link.type === "twitter" && !result.twitter) {
          result.twitter = link.url;
        }
        if (link.type === "telegram" && !result.telegram) {
          result.telegram = link.url;
        }
        if (!link.type && !result.website) {
          result.website = link.url;
        }
      }
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to fetch from DexScreener" }, { status: 500 });
  }
}
