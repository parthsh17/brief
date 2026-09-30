import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthStoreContext';
export function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-[#18181b] flex items-center justify-center", children: _jsx("span", { className: "text-white font-black text-2xl uppercase tracking-widest animate-flicker", children: "Brief" }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
