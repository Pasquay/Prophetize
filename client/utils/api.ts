import * as SecureStore from 'expo-secure-store';
import backendUrl from '../constants/backendUrl';

const baseUrl = backendUrl;


// Helper function for getting the token
const getToken = async (): Promise<string | null> => {
    const token = await SecureStore.getItemAsync('access_token');
    if(token){
        return token;
    } else {
        return null;
    }
}

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
    const response = await fetch(baseUrl+endpoint, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });
    return { ok: response.ok, data: await safeJson(response) };
}

export const get = async(endpoint:string) => {
    const token = await getToken();
    const response = await fetch(baseUrl+endpoint, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    });
    return { ok: response.ok, data: await safeJson(response) };
}

