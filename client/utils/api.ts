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

export const post = async(endpoint:string, body:object) => {
    const token = await getToken();
    const response = await fetch(baseUrl+endpoint, {
        method: 'POST',
        headers: {
            'Content-Type':'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });
    return { ok: response.ok, data: await response.json() };
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
    return { ok: response.ok, data: await response.json() };
}

