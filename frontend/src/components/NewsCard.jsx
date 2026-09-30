import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { SentimentBadge } from './SentimentBadge';

const INSIGHT_BG = { Bullish: 'bg-bullish/10 border-l-4 border-bullish', Bearish: 'bg-bearish/10 border-l-4 border-bearish', Neutral: 'bg-neutral/10 border-l-4 border-neutral' };
const INSIGHT_TEXT = { Bullish: 'text-bullish', Bearish: 'text-bearish', Neutral: 'text-neutral' };

export function NewsCard({ item, style }) {
  const [showExplanation, setShowExplanation] = useState(false);
  const timeAgo = item.timestamp ? formatDistanceToNow(new Date(item.timestamp), { addSuffix: true }) : '-';
  return <article style={style} className="bg-surface border-2 border-white neo-shadow flex flex-col gap-4 p-5 animate-slide-up">
    <div className="flex items-start justify-between gap-3"><div className="flex-1"><p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">{item.source}</p><h2 className="text-sm font-bold text-white leading-snug line-clamp-3">{item.originalTitle}</h2></div><div className="shrink-0 text-right"><SentimentBadge sentiment={item.sentiment} size="sm" />{item.confidence != null && <p className="text-[9px] text-white/40 mt-2">{Math.round(item.confidence * 100)}% confidence</p>}</div></div>
    {item.topics?.length > 0 && <div className="flex flex-wrap gap-1">{item.topics.map((topic) => <span key={topic} className="text-[9px] uppercase border border-white/20 px-2 py-1 text-white/50">{topic}</span>)}</div>}
    {item.entities && (item.entities.companies?.length || item.entities.tickers?.length) > 0 && <p className="text-[10px] uppercase tracking-widest text-white/40">Entities: {[...(item.entities.companies || []), ...(item.entities.tickers || [])].join(', ')}</p>}
    <div className="border-t border-white/10" /><div><p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">AI Summary</p><ul className="space-y-1.5">{item.aiSummary.map((point, index) => <li key={index} className="flex gap-2 text-xs text-white/80 leading-relaxed"><span className="text-white/30 font-bold shrink-0">0{index + 1}</span><span>{point}</span></li>)}</ul></div>
    <div className={`p-3 ${INSIGHT_BG[item.sentiment] || INSIGHT_BG.Neutral}`}><p className="text-[10px] font-black uppercase tracking-widest mb-1 text-white/40">Actionable Insight</p><p className={`text-xs leading-relaxed font-semibold ${INSIGHT_TEXT[item.sentiment] || INSIGHT_TEXT.Neutral}`}>{item.actionableInsight}</p></div>
    <button type="button" onClick={() => setShowExplanation(!showExplanation)} className="text-left text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white border-t border-white/10 pt-3">{showExplanation ? 'Hide rating explanation ↑' : 'Why this rating? ↓'}</button>
    {showExplanation && <div className="bg-black/20 border border-white/10 p-3 text-xs text-white/70 leading-relaxed"><p>{item.ratingExplanation || 'This rating is based on the article facts, detected topics and entities, and the model confidence.'}</p>{item.keyEvidence?.length > 0 && <ul className="mt-2 list-disc list-inside">{item.keyEvidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>}</div>}
    <div className="flex items-center justify-between mt-auto pt-1"><span className="text-[10px] text-white/30 uppercase tracking-wider font-bold">{timeAgo}</span><a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/50 uppercase tracking-wider font-black border-b border-white/20 hover:text-white hover:border-white transition-colors">Read Original →</a></div>
  </article>;
}
