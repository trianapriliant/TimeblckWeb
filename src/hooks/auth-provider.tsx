
'use client';

import * as React from 'react';
import { useAuthState } from './use-auth';
import type { User } from 'firebase/auth';

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
}

const AuthContext = React.createContext<AuthContextValue>({
    user: null,
    loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const authState = useAuthState();

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
