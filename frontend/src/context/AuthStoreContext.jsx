import { createContext, useContext } from "react";
export const AuthStoreContext = createContext(null);
export function useAuth() {
    const ctx = useContext(AuthStoreContext);
    if (!ctx)
        throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
