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
            const refreshResponse = await fetch(baseUrl + '/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'},
                body: JSON.stringify(refreshToken)
            });
            if(refreshResponse.ok){
                const data = await refreshResponse.json();
                await SecureStore.setItemAsync('access_token', data);
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

