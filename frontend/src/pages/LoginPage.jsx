import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthStoreContext';
export function LoginPage() {
    const { login, user, isLoading } = useAuth();
    const navigate = useNavigate();
    useEffect(() => { if (!isLoading && user)
        navigate('/dashboard', { replace: true }); }, [user, isLoading, navigate]);
    return _jsxs("main", { className: "min-h-screen bg-[#18181b] flex flex-col items-center justify-center px-4", children: [_jsxs("div", { className: "mb-10 text-center", children: [_jsx("span", { className: "font-black text-4xl uppercase tracking-tighter text-bullish border-2 border-bullish px-3 py-1 inline-block", children: "Brief" }), _jsx("p", { className: "mt-3 text-white/40 text-xs uppercase tracking-widest font-bold", children: "AI Financial Intelligence" })] }), _jsxs("div", { className: "w-full max-w-sm bg-surface border-2 border-white neo-shadow p-8", children: [_jsx("h1", { className: "text-2xl font-black text-white uppercase mb-2", children: "Sign In" }), _jsx("p", { className: "text-white/40 text-sm mb-8", children: "Continue securely with your Google account." }), _jsx("button", { id: "google-signin-btn", onClick: () => void login(), className: "w-full px-5 py-3 border-2 border-white bg-white text-black font-black text-sm uppercase tracking-widest neo-shadow", children: "Sign in with Google" })] })] });
}
