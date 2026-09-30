import { useEffect, useState } from 'react';

const EMPTY_VALUE = '-';
const formatValue = (value, suffix = '') => value === null || value === undefined || value === '' ? EMPTY_VALUE : `${value}${suffix}`;
const formatDate = (value) => {
  if (!value) return EMPTY_VALUE;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : date.toLocaleString();
};
const cards = [
  ['Total articles', 'total_articles'], ['Processed articles', 'total_processed_articles'], ['Total sources', 'total_sources'], ['API calls', 'api_calls'],
  ['AI tokens spent', 'total_tokens_spent'], ['Processing failures', 'processing_failures'], ['Success rate', 'processing_success_rate', '%'], ['Processed last 24h', 'articles_processed_24h'], ['Pending articles', 'articles_pending'], ['Deleted after 24h', 'articles_deleted'],
];

export function AdminPage() {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => { fetch('/api/admin/metrics', { credentials: 'include' }).then((response) => response.json()).then((body) => setMetrics(body.data)).catch(() => {}); }, []);
  return <main className="min-h-screen bg-[#18181b] text-white p-8"><div className="max-w-6xl mx-auto"><h1 className="text-4xl font-black uppercase mb-8">System Metrics</h1><div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">{cards.map(([label, key, suffix]) => <div key={key} className="bg-surface border-2 border-white p-5"><p className="text-white/40 text-xs uppercase">{label}</p><p className="text-2xl font-black mt-2">{formatValue(metrics?.[key], suffix || '')}</p></div>)}</div><div className="grid md:grid-cols-2 gap-4 mb-8"><div className="bg-surface border-2 border-white p-5"><p className="text-white/40 text-xs uppercase">Last fetched</p><p className="font-bold mt-2">{formatDate(metrics?.last_fetched_at)}</p></div><div className="bg-surface border-2 border-white p-5"><p className="text-white/40 text-xs uppercase">Last processed</p><p className="font-bold mt-2">{formatDate(metrics?.last_processed_at)}</p></div></div><section className="bg-surface border-2 border-white p-6 overflow-x-auto"><h2 className="font-black uppercase mb-4">Sources</h2><table className="w-full text-left text-xs"><thead><tr className="border-b border-white/20 text-white/40 uppercase"><th className="p-3">Source</th><th className="p-3">Status</th><th className="p-3">Fetched</th><th className="p-3">Processed</th><th className="p-3">Last fetched</th><th className="p-3">Last error</th></tr></thead><tbody>{(metrics?.sources || []).map((source) => <tr key={source.name || 'unknown-source'} className="border-b border-white/10"><td className="p-3 font-bold">{formatValue(source.name)}</td><td className="p-3 uppercase text-bullish">{formatValue(source.status)}</td><td className="p-3">{formatValue(source.articles_fetched)}</td><td className="p-3">{formatValue(source.articles_processed)}</td><td className="p-3">{formatDate(source.last_fetched_at)}</td><td className="p-3 text-bearish">{formatValue(source.last_error)}</td></tr>)}</tbody></table></section></div></main>;
}

