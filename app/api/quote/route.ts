import { NextResponse } from 'next/server';

export const revalidate = 60; // 60秒キャッシュ（1分間のアクセス集中対策）

export async function GET() {
  try {
    const [spcxRes, jpyRes] = await Promise.all([
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPCX'),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/JPY=X')
    ]);

    const spcxData = await spcxRes.json();
    const jpyData = await jpyRes.json();

    const spcxPrice = spcxData.chart.result[0].meta.regularMarketPrice;
    const jpyRate = jpyData.chart.result[0].meta.regularMarketPrice;

    return NextResponse.json({ spcxPrice, jpyRate });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}