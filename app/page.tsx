'use client';
import { useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TOTAL_SHARES = 13_111_111_111; // SpaceXの仮定発行済株式数
const ELON_PERCENTAGE = 0.42;
const ELON_SHARES = TOTAL_SHARES * ELON_PERCENTAGE;

// ★あなたの「GitHubユーザー名/レポジトリ名」に変更してください
const GITHUB_REPO = 'Ni-devx/spacex-wealth-tracker'; 

function useAnimatedValue(targetValue: number) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const prevValueRef = useRef(targetValue);

  useEffect(() => {
    if (targetValue === prevValueRef.current || targetValue === 0) return;
    const startValue = prevValueRef.current === 0 ? targetValue : prevValueRef.current;
    const startTime = Date.now();
    const duration = 60000; // 1分かけてアニメーション

    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      setDisplayValue(startValue + (targetValue - startValue) * progress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = targetValue;
      }
    };
    requestAnimationFrame(animate);
  }, [targetValue]);

  return displayValue;
}

export default function Home() {
  const [currency, setCurrency] = useState<'USD' | 'JPY'>('USD');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        const res = await fetch('/api/quote');
        const data = await res.json();
        if (data.spcxPrice) {
          setCurrentPrice(data.spcxPrice);
          setCurrentRate(data.jpyRate);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/public/history.json`);
        if (res.ok) setHistory(await res.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();
  }, []);

  const rawWealth = currentPrice > 0 
    ? (ELON_SHARES * currentPrice * (currency === 'JPY' ? currentRate : 1)) 
    : 0;
  
  const animatedWealth = useAnimatedValue(rawWealth);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 p-8 rounded-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-xl text-zinc-400 font-medium">Elon Musk / SpaceX Asset Tracker</h1>
          <div className="text-4xl md:text-5xl font-mono font-bold text-emerald-400 mt-4">
            {currency === 'USD' ? '$' : '¥'}
            {(animatedWealth || rawWealth).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-2">※1分かけて緩やかに更新されます</p>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => setCurrency(c => c === 'USD' ? 'JPY' : 'USD')}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm font-medium transition"
          >
            {currency === 'USD' ? '表示を 日本円(JPY) に切り替え' : '表示を 米ドル(USD) に切り替え'}
          </button>
        </div>

        <div className="h-64 w-full">
          <h2 className="text-sm text-zinc-400 mb-2">歴史データ (3時間ごと更新)</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleDateString()} stroke="#52525b" />
              <YAxis stroke="#52525b" domain={['auto', 'auto']} hide />
              <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }} />
              <Line type="monotone" dataKey="spcxPrice" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}