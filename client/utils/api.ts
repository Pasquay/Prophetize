import * as SecureStore from 'expo-secure-store';
import backendUrl from '../constants/backendUrl';

const baseUrl = backendUrl;

let _clearAuth: (() => Promise<void>) | null = null;

export const registerClearAuth = (fn: () => Promise<void>) => {
    _clearAuth = fn;
};

// Helper function for getting the token
const getToken = async (): Promise<string | null> => {
    const accessToken = await SecureStore.getItemAsync('access_token');
    if(accessToken){
        return accessToken;
    } else {
        return null;
    }
}

const getRefreshToken = async (): Promise<string | null> => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    if(refreshToken){
        return refreshToken;
    } else {
        return null;
    }
 }
 
const handleResponse = async (response: Response, retryFn?: ()=> Promise<Response>) => {
    if (response.status === 401) {
        const refreshToken = await getRefreshToken();
        if(refreshToken){
            const refreshResponse = await fetch(baseUrl + '/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'},
                body: JSON.stringify({ refresh_token: refreshToken })
            });
            if(refreshResponse.ok){
                const data = await refreshResponse.json();
                if (data?.access_token) {
                    await SecureStore.setItemAsync('access_token', data.access_token);
                }
                if(retryFn){
                    const retried = await retryFn();
                    return { ok: retried.ok, data: await safeJson(retried)};
                }
                return { ok: true, data };
            }
        }
        await _clearAuth?.();
        return { ok: false, data: null};
    }
    return { ok: response.ok, data: await safeJson(response) };
};

const safeJson = async (response: Response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        console.error('Non-JSON response from', response.url, ':', text);
        return { error: text };
    }
};

export const post = async(endpoint:string, body?:object) => {
    const token = await getToken();
    const doRequest = () => fetch(baseUrl+endpoint, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });
    const response = await doRequest();
    return handleResponse(response, doRequest);
}

export const get = async(endpoint:string) => {
    const token = await getToken();
    const doRequest = () => fetch(baseUrl+endpoint, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    });
    const response = await doRequest();
    return handleResponse(response, doRequest);
}

export type LeaderboardPeriod = 'weekly' | 'all_time';

export type LeaderboardApiEntry = {
    rank: number;
    user_id: string;
    username: string;
    avatar_url: string | null;
    wins: number;
    profit_pct: number;
    is_current_user?: boolean;
};

export type LeaderboardApiMeta = {
    page: number;
    limit: number;
    has_next_page: boolean;
    total_records: number;
    total_pages: number;
};

export type LeaderboardApiResponse = {
    data: LeaderboardApiEntry[];
    meta: LeaderboardApiMeta;
};

export type MyLeaderboardPositionResponse = {
    position: number;
    username: string;
    avatar_url: string | null;
    wins: number;
    profit_pct: number;
};

export const getLeaderboard = async (
    period: LeaderboardPeriod,
    page: number = 0,
    limit: number = 10
) => {
    const params = new URLSearchParams({
        period,
        page: String(page),
        limit: String(limit),
    });

    return get(`/leaderboard?${params.toString()}`);
};

export const getMyLeaderboardPosition = async (period: LeaderboardPeriod) => {
    const params = new URLSearchParams({ period });
    return get(`/leaderboard/me?${params.toString()}`);
};

