import { jsx as _jsx } from "react/jsx-runtime";
const CONFIG = {
    Bullish: {
        bg: 'bg-bullish',
        text: 'text-black',
        border: 'border-2 border-black',
        shadow: 'neo-shadow-bullish',
        label: 'BULLISH',
    },
    Bearish: {
        bg: 'bg-bearish',
        text: 'text-white',
        border: 'border-2 border-black',
        shadow: 'neo-shadow-bearish',
        label: 'BEARISH',
    },
    Neutral: {
        bg: 'bg-neutral',
        text: 'text-black',
        border: 'border-2 border-black',
        shadow: 'neo-shadow-neutral',
        label: 'NEUTRAL',
    },
};
export function SentimentBadge({ sentiment, size = 'md' }) {
    const c = CONFIG[sentiment] || CONFIG.Neutral;
    const sizeClass = size === 'sm'
        ? 'text-[10px] px-2 py-0.5'
        : 'text-xs px-3 py-1';
    return (_jsx("span", { className: `inline-block font-black uppercase tracking-wider ${sizeClass} ${c.bg} ${c.text} ${c.border} ${c.shadow}`, children: c.label }));
}
