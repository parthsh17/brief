import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthStoreContext';
export function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    const initials = user?.displayName
        ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2)
        : 'AT';
    return (_jsx("header", { className: "sticky top-0 z-50 bg-[#18181b] border-b-2 border-white", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-black text-xl uppercase tracking-tighter text-white neo-shadow-brand px-1.5 py-0.5 border-2 border-bullish text-bullish", children: "Brief" }), _jsx("span", { className: "hidden sm:block text-[10px] uppercase tracking-widest text-white/30 font-bold", children: "AI Financial Intelligence" })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [user?.photoURL ? (_jsx("img", { src: user.photoURL, alt: user?.displayName || 'Google profile', referrerPolicy: 'no-referrer', className: "w-8 h-8 border-2 border-white object-cover" })) : (_jsx("div", { className: "w-8 h-8 bg-bullish border-2 border-white flex items-center justify-center", children: _jsx("span", { className: "text-black text-[10px] font-black", children: initials }) })), _jsx("span", { className: "hidden sm:block text-xs text-white/60 font-semibold", children: user?.displayName })] }), _jsx("button", { id: "logout-btn", onClick: handleLogout, className: "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 border-2 border-white text-white neo-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-white hover:text-black transition-all duration-100", children: "Logout" })] })] }) }));
}
