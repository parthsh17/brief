import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL || '';
export function ArticleDetailsPage() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    useEffect(() => { fetch(`${API}/api/articles/${id}`, { credentials: 'include' }).then((r) => r.json()).then((d) => setArticle(d.data?.article)); }, [id]);
    if (!article)
        return _jsx("main", { className: "min-h-screen bg-[#18181b] text-white p-8", children: "Loading article..." });
    return _jsx("main", { className: "min-h-screen bg-[#18181b] text-white p-8", children: _jsxs("div", { className: "max-w-3xl mx-auto", children: [_jsx(Link, { to: "/dashboard", className: "text-bullish text-xs uppercase font-black", children: "\u2190 Feed" }), _jsx("p", { className: "text-white/40 text-xs uppercase mt-8", children: article.source }), _jsx("h1", { className: "text-4xl font-black uppercase mt-2", children: article.title }), _jsx("ul", { className: "my-8 space-y-3", children: article.analysis?.key_points?.map((point) => _jsx("li", { className: "border-l-4 border-bullish pl-4 text-white/80", children: point }, point)) }), _jsx("a", { href: article.url, target: "_blank", rel: "noreferrer", className: "text-bullish font-black uppercase text-xs", children: "Read original \u2192" })] }) });
}

