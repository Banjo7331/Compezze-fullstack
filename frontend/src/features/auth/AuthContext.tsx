import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from './api/authApi';
import type { UserDto } from './model/types'; 

const ACCESS_TOKEN_EXPIRY_MS = 900000; 

interface AuthContextState {
    isAuthenticated: boolean;
    currentUserId: string | null;
    currentUser: UserDto | null;
    isInitializing: boolean;
    logout: () => void;
    authenticate: (accessToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<Omit<AuthContextState, 'logout' | 'authenticate'>>({
        isAuthenticated: false,
        currentUserId: null,
        currentUser: null,
        isInitializing: true,
    });

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.error("Logout error (ignoring):", e);
        }
        
        localStorage.removeItem('accessToken');
        setState({
            isAuthenticated: false,
            currentUserId: null,
            currentUser: null,
            isInitializing: false,
        });
    }, []);

    const fetchUserData = async () => {
        try {
            const user = await authApi.getMe();
            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                currentUserId: user.id,
                currentUser: user,
            }));
        } catch (error) {
            console.error("Failed to fetch user data, attempting silent refresh...", error);
            await trySilentRefresh();
        }
    };
    
    const trySilentRefresh = async (): Promise<string | null> => {
        try {
            const response = await authApi.refresh(); 
            const newAccessToken = response.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            
            if (!state.isAuthenticated) {
                 const user = await authApi.getMe();
                 setState({
                    isAuthenticated: true,
                    currentUserId: user.id,
                    currentUser: user,
                    isInitializing: false
                 });
            }
            return newAccessToken;
        } catch (error) {
            if (state.isAuthenticated) {
                logout();
            } else {
                setState(s => ({ ...s, isInitializing: false }));
            }
            return null;
        }
    };

    const authenticate = async (accessToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        await fetchUserData();
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await fetchUserData();
            } else {
                await trySilentRefresh();
            }
            setState(prev => ({ ...prev, isInitializing: false }));
        };
        
        initializeAuth();
        
        const intervalId = setInterval(() => {
            if (state.isAuthenticated) {
                trySilentRefresh();
            }
        }, ACCESS_TOKEN_EXPIRY_MS - 30000);

        return () => clearInterval(intervalId);
    }, []); 

    return (
        <AuthContext.Provider value={{ ...state, logout, authenticate }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};