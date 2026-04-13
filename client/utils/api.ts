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

export type CreateMarketPayload = {
    title: string;
    description: string;
    category: string;
    endDate: string;
    options: string[];
    imageUrl?: string;
};

const CREATE_MARKET_ERROR_FALLBACK = 'Unable to submit market right now. Please try again.';

const normalizeCreateMarketError = (data: unknown): string => {
    if (!data || typeof data !== 'object') {
        return CREATE_MARKET_ERROR_FALLBACK;
    }

    const payload = data as Record<string, unknown>;
    const rawError = payload.error;

    if (typeof rawError === 'string') {
        const trimmed = rawError.trim();
        if (!trimmed) {
            return CREATE_MARKET_ERROR_FALLBACK;
        }

        // Never surface raw html/transport payloads in user-facing messages.
        if (trimmed.startsWith('<') || trimmed.toLowerCase().includes('syntaxerror')) {
            return CREATE_MARKET_ERROR_FALLBACK;
        }

        return trimmed;
    }

    return CREATE_MARKET_ERROR_FALLBACK;
};

export const createMarket = async (payload: CreateMarketPayload) => {
    const response = await post('/markets/create', payload);

    if (!response.ok) {
        const normalizedError = normalizeCreateMarketError(response.data);
        const normalizedData = response.data && typeof response.data === 'object'
            ? { ...(response.data as Record<string, unknown>), error: normalizedError }
            : { error: normalizedError };

        return {
            ...response,
            data: normalizedData,
        };
    }

    return response;
};

export type TradePayload = {
    optionId: number;
    shares: number;
};

export type TradeSnapshot = {
    balance: number;
    position: {
        optionId: number;
        sharesOwned: number;
    };
};

export type TradeResponse = {
    message: string;
    trade: {
        side: 'buy' | 'sell';
        optionId: number;
        shares: number;
        price: number;
        totalCost?: number;
        totalReturn?: number;
    };
    snapshot?: TradeSnapshot;
};

export const buyShares = async (payload: TradePayload) => {
    return post('/transaction/buy', payload);
};

export const sellShares = async (payload: TradePayload) => {
    return post('/transaction/sell', payload);
};

export type NotificationType = 'market' | 'leaderboard' | 'profile';

export type NotificationPayload = {
    type: NotificationType;
    recipient_user_id: string;
    title: string;
    body: string;
    target_path: string;
    target_signature: string;
};

export type NotificationRouteTarget =
    | { pathname: '/marketDetails'; params: { id: string } }
    | { pathname: '/tabs/leaderboard' }
    | { pathname: '/tabs/profile'; params?: { userId: string } };

export type NotificationPlatform = 'ios' | 'android' | 'web';

export const registerNotificationChannel = async (
    deviceToken: string,
    platform: NotificationPlatform
) => {
    return post('/notifications/register', {
        deviceToken,
        platform,
    });
};

type TriggerNotificationPayload = {
    type: NotificationType;
    recipientUserId: string;
    title: string;
    body: string;
    marketId?: number;
    profileUserId?: string;
};

export const triggerNotification = async (payload: TriggerNotificationPayload) => {
    return post('/notifications/trigger', payload);
};

export type FollowAction = 'follow' | 'unfollow';

export const followUser = async (targetUserId: string, action: FollowAction = 'follow') => {
    return post('/social/follow', { targetUserId, action });
};

export type CommentItem = {
    id: string;
    market_id: number;
    user_id: string;
    content: string;
    created_at: string;
};

export const getComments = async (marketId: number) => {
    return get(`/social/comments/${marketId}`);
};

export const createComment = async (marketId: number, content: string) => {
    return post('/social/comments', { marketId, content });
};

const parseTargetPath = (path: string) => {
    const [pathname, queryString = ''] = path.split('?');
    const query = new URLSearchParams(queryString);
    return { pathname, query };
};

export const resolveNotificationTarget = (
    payload: Pick<NotificationPayload, 'type' | 'target_path'>
): NotificationRouteTarget | null => {
    const { pathname, query } = parseTargetPath(payload.target_path);

    if (payload.type === 'market' && pathname === '/marketDetails') {
        const id = query.get('id');
        if (!id) return null;
        return { pathname: '/marketDetails', params: { id } };
    }

    if (payload.type === 'leaderboard' && pathname === '/tabs/leaderboard') {
        return { pathname: '/tabs/leaderboard' };
    }

    if (payload.type === 'profile' && pathname === '/tabs/profile') {
        const userId = query.get('userId') || undefined;
        return userId
            ? { pathname: '/tabs/profile', params: { userId } }
            : { pathname: '/tabs/profile' };
    }

    return null;
};

