import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';

const FILTERS = ['All', 'Bullish', 'Bearish', 'Neutral'];
const SOURCES = ['CNBC', 'Yahoo Finance', 'Reuters', 'Investing.com', 'CoinDesk', 'MarketWatch'];
const ACTIVE = { All: 'bg-white text-black border-white', Bullish: 'bg-bullish text-black border-bullish', Bearish: 'bg-bearish text-white border-bearish', Neutral: 'bg-neutral text-black border-neutral' };
const IDLE = { All: 'text-white border-white', Bullish: 'text-bullish border-bullish', Bearish: 'text-bearish border-bearish', Neutral: 'text-neutral border-neutral' };

export function FilterBar({ active, onChange, selectedSources = [], onSourcesChange = () => {} }) {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSource = (source) => onSourcesChange(selectedSources.includes(source) ? selectedSources.filter((item) => item !== source) : [...selectedSources, source]);
    const sourceLabel = selectedSources.length === 0 ? 'All Sources' : `${selectedSources.length} Source${selectedSources.length === 1 ? '' : 's'}`;
    return (_jsxs("div", { className: "flex flex-wrap items-start gap-3 mb-8", children: [FILTERS.map((filter) => (_jsx("button", { id: `filter-${filter.toLowerCase()}`, onClick: () => onChange(filter), className: `px-5 py-2 font-black text-sm uppercase tracking-widest border-2 transition-all duration-100 neo-shadow ${active === filter ? `${ACTIVE[filter]} translate-x-[2px] translate-y-[2px]` : `bg-transparent ${IDLE[filter]} hover:-translate-x-0.5 hover:-translate-y-0.5`}`, children: filter }, filter))), _jsxs("div", { className: "relative", children: [_jsx("button", { type: "button", onClick: () => setIsOpen(!isOpen), className: "min-w-52 px-4 py-2 bg-[#18181b] text-white border-2 border-white text-left text-xs font-black uppercase tracking-widest neo-shadow", children: sourceLabel }), isOpen && _jsxs("div", { className: "absolute z-30 top-full left-0 mt-2 min-w-64 bg-[#212126] border-2 border-white p-3 neo-shadow", children: [SOURCES.map((source) => _jsxs("label", { className: "flex items-center gap-3 px-2 py-2 text-xs font-bold uppercase text-white hover:bg-white/10 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: selectedSources.includes(source), onChange: () => toggleSource(source), className: "w-4 h-4 accent-red-500" }), source] }, source)), _jsx("button", { type: "button", onClick: () => onSourcesChange([]), className: "mt-2 w-full border-t border-white/20 pt-2 text-left text-[10px] font-black uppercase text-white/50 hover:text-white", children: "Clear sources" })] })] })] }));
}

