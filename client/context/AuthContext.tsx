import React, {useState, useEffect, createContext, useContext} from 'react';
import * as SecureStore from 'expo-secure-store';
import { registerClearAuth } from '../utils/api';

type AuthContextType = {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    login: (userdata: any, token: string, refreshToken: string) => Promise<void>
    logout: () => Promise<void>
    clearAuth: () => Promise<void>
    updateUser: (partial: Record<string, unknown>) => void
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({children}:{children:React.ReactNode}) {
    const [user, setUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        registerClearAuth(clearAuth);
        const loadAuth = async () => {
            try{
                const storedToken = await SecureStore.getItemAsync('access_token');
                const storedUser = await SecureStore.getItemAsync('user');
                if(storedToken) setToken(storedToken);
                if(storedUser) setUser(JSON.parse(storedUser));
            } finally {
                setIsLoading(false);
            }    
        };
        loadAuth();
    }, []); 

    const pickUserFields = (u: any) => ({
        id: u?.id ?? null,
        email: u?.email ?? null,
        username: u?.username ?? u?.user_metadata?.username ?? null,
        avatar_url: u?.avatar_url ?? u?.user_metadata?.avatar_url ?? null,
        created_at: u?.created_at ?? null,
    });

    const login = async (userData:any, accessToken:string, refreshToken:string) => {
        setIsLoading(true);
        try{
            await SecureStore.setItemAsync('access_token', accessToken);
            await SecureStore.setItemAsync('refresh_token', refreshToken);
            const slim = pickUserFields(userData);
            await SecureStore.setItemAsync('user', JSON.stringify(slim));
            setUser(slim);
            setToken(accessToken);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try{
            await clearAuth();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const clearAuth = async() => {
        try{
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            await SecureStore.deleteItemAsync('user');
            setUser(null);
            setToken(null);
        } catch (err) {
            console.error('clearAuth error:', err);
        }
    };

    const updateUser = (partial: Record<string, unknown>) => {
        setUser((prev: any) => {
            if (!prev) return prev;
            const next = { ...prev, ...partial };
            const slim = pickUserFields(next);
            SecureStore.setItemAsync('user', JSON.stringify(slim)).catch(() => {});
            return next;
        });
    };
    
    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, clearAuth, updateUser }}>
            {children}
        </AuthContext.Provider>
    );  

}

export const useAuth = () => useContext(AuthContext)!;