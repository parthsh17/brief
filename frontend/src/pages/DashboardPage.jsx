import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Header } from '../components/Header';
import { FilterBar } from '../components/FilterBar';
import { NewsCard } from '../components/NewsCard';

const API_BASE = import.meta.env.VITE_API_URL || '';
const POLL_INTERVAL_MS = 5 * 60 * 1000;
const displaySentiment = (value) => value === 'Very Bullish' ? 'Bullish' : value === 'Very Bearish' ? 'Bearish' : value;

export function DashboardPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedSources, setSelectedSources] = useState([]);
  const [lastEnrichedAt, setLastEnrichedAt] = useState(null);
  const [showRatingGuide, setShowRatingGuide] = useState(false);
  const activeFilterRef = useRef(activeFilter);
  const selectedSourcesRef = useRef(selectedSources);

  useEffect(() => { activeFilterRef.current = activeFilter; }, [activeFilter]);
  useEffect(() => { selectedSourcesRef.current = selectedSources; }, [selectedSources]);

  const fetchLastEnriched = useCallback(() => {
    fetch(`${API_BASE}/api/articles/last-enriched`, { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => data?.lastEnrichedAt && setLastEnrichedAt(new Date(data.lastEnrichedAt)))
      .catch(() => {});
  }, []);

  const fetchFeed = useCallback((filter, sources, showLoading = false) => {
    const params = new URLSearchParams({ page: '1' });
    if (filter !== 'All') params.set('sentiment', filter);
    sources.forEach((source) => params.append('sources', source));
    if (showLoading) { setIsLoading(true); setError(null); }
    fetch(`${API_BASE}/api/articles/feed?${params}`, { credentials: 'include' })
      .then((response) => {
        if (response.status === 401) { navigate('/login'); return null; }
        if (!response.ok) throw new Error('Failed to fetch articles');
        return response.json();
      })
      .then((data) => {
        if (!data) return;
        setArticles((data?.articles ?? data?.data?.articles ?? []).map((article) => ({
          id: article._id,
          source: article.source,
          originalTitle: article.title,
          url: article.url || article.originalUrl,
          timestamp: article.published_at || article.publishedAt,
          sentiment: displaySentiment(article.analysis?.sentiment?.label || article.sentiment || 'Neutral'),
          confidence: article.analysis?.sentiment?.confidence,
          topics: article.analysis?.topics || [],
          entities: article.analysis?.entities || {},
          aiSummary: article.analysis?.key_points || ['Summary pending...', '', ''],
          actionableInsight: article.analysis?.actionable_insight || article.actionableInsight || 'Insight pending â€” check back soon.',
          ratingExplanation: article.analysis?.rating_explanation,
          keyEvidence: article.analysis?.key_points || [],
        })));
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    fetchFeed(activeFilter, selectedSources, true);
    fetchLastEnriched();
  }, [activeFilter, selectedSources, fetchFeed, fetchLastEnriched]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchFeed(activeFilterRef.current, selectedSourcesRef.current);
      fetchLastEnriched();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchFeed, fetchLastEnriched]);

  return <div className="min-h-screen bg-[#18181b]">
    <Header />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div><h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-1">Market Feed</h1><p className="text-white/40 text-sm font-medium">AI-curated signals â€” updated every hour</p></div>
        <div className="border border-white/10 bg-surface px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">{lastEnrichedAt ? `AI last ran ${formatDistanceToNow(lastEnrichedAt, { addSuffix: true })}` : 'AI enrichment pending...'}</div>
      </div>
      <div className="flex items-start justify-between gap-4 flex-wrap"><FilterBar active={activeFilter} onChange={setActiveFilter} selectedSources={selectedSources} onSourcesChange={setSelectedSources} /><button type="button" onClick={() => setShowRatingGuide(!showRatingGuide)} className="px-4 py-2 border-2 border-white text-white text-xs font-black uppercase tracking-widest neo-shadow hover:-translate-x-0.5 hover:-translate-y-0.5">{showRatingGuide ? 'Hide rating guide' : 'How ratings work'}</button></div>
      {showRatingGuide && <section className="mb-8 bg-surface border-2 border-white p-5 neo-shadow"><h2 className="font-black uppercase text-lg mb-3">How Brief rates news</h2><p className="text-sm text-white/70 mb-4">The AI reads the articleâ€™s reported facts, then weighs their likely market direction, relevance, and certainty. Every card shows the result and why it received that rating.</p><div className="grid md:grid-cols-3 gap-3"><div className="border-l-4 border-bullish bg-bullish/10 p-3"><p className="font-black text-bullish uppercase text-sm">Bullish</p><p className="text-xs text-white/60 mt-1">Evidence suggests improving conditions or potential upward pressure.</p></div><div className="border-l-4 border-bearish bg-bearish/10 p-3"><p className="font-black text-bearish uppercase text-sm">Bearish</p><p className="text-xs text-white/60 mt-1">Evidence suggests weakening conditions or potential downward pressure.</p></div><div className="border-l-4 border-neutral bg-neutral/10 p-3"><p className="font-black text-neutral uppercase text-sm">Neutral</p><p className="text-xs text-white/60 mt-1">Evidence is mixed, uncertain, or unlikely to create a strong direction.</p></div></div><p className="text-[10px] text-white/40 uppercase tracking-widest mt-4">Confidence measures how strongly the available article evidence supports the rating. AI-generated information is not financial advice.</p></section>}
      {isLoading ? <p className="py-24 text-center text-white/40 uppercase font-bold">Loading signals...</p> : error ? <p className="py-24 text-center text-bearish">{error}</p> : articles.length === 0 ? <p className="py-24 text-center text-white/40 uppercase font-bold">No signals yet</p> : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">{articles.map((article) => <NewsCard key={article.id} item={article} />)}</div>}
    </main>
  </div>;
}


