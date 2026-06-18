import { NextResponse } from 'next/server';

export const revalidate = 60; // 60秒キャッシュ

export async function GET() {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };

    const [spcxRes, jpyRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPCX', { headers }),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/JPY=X', { headers })
    ]);

    if (!spcxRes.ok || !jpyRes.ok) {
      throw new Error(`API blocked: SPCX ${spcxRes.status}, JPY ${jpyRes.status}`);
    }

    const spcxData = await spcxRes.json();
    const jpyData = await jpyRes.json();

    const spcxPrice = spcxData.chart.result[0].meta.regularMarketPrice;
    const jpyRate = jpyData.chart.result[0].meta.regularMarketPrice;

    return NextResponse.json({ spcxPrice, jpyRate });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Fetch Error:", errorMessage);
    return NextResponse.json({ error: 'Failed to fetch', details: errorMessage }, { status: 500 });
  }
}