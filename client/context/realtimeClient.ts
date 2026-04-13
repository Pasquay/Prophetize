import { io, Socket } from 'socket.io-client';
import backendUrl from '@/constants/backendUrl';

export type RealtimeEventName = 'market.updated' | 'portfolio.updated' | 'leaderboard.updated';

export type MarketUpdatedPayload = {
    marketId: number;
    optionId: number;
    updatedAt: string;
};

export type PortfolioUpdatedPayload = {
    userId: string;
    balance: number;
    position: {
        optionId: number;
        sharesOwned: number;
    };
    updatedAt: string;
};

export type LeaderboardUpdatedPayload = {
    userId: string;
    marketId: number;
    updatedAt: string;
};

type RealtimePayloadMap = {
    'market.updated': MarketUpdatedPayload;
    'portfolio.updated': PortfolioUpdatedPayload;
    'leaderboard.updated': LeaderboardUpdatedPayload;
};

type Subscription = {
    id: number;
    channels: RealtimeEventName[];
    onEvent: <T extends RealtimeEventName>(event: T, payload: RealtimePayloadMap[T]) => void;
    onReconnect?: () => void;
    lastReconnectAt: number;
};

const SOCKET_EVENTS: RealtimeEventName[] = ['market.updated', 'portfolio.updated', 'leaderboard.updated'];
const RECONNECT_RESYNC_COOLDOWN_MS = 3000;

let socket: Socket | null = null;
let nextSubscriptionId = 1;
let hasConnectedOnce = false;
let listenersBound = false;
const subscriptions = new Map<number, Subscription>();

const notifyEvent = <T extends RealtimeEventName>(event: T, payload: RealtimePayloadMap[T]) => {
    for (const subscription of subscriptions.values()) {
        if (!subscription.channels.includes(event)) {
            continue;
        }

        subscription.onEvent(event, payload);
    }
};

const emitCurrentSubscriptions = () => {
    if (!socket || !socket.connected) {
        return;
    }

    const channelSet = new Set<RealtimeEventName>();
    for (const subscription of subscriptions.values()) {
        for (const channel of subscription.channels) {
            channelSet.add(channel);
        }
    }

    if (channelSet.size > 0) {
        socket.emit('subscribe', Array.from(channelSet));
    }
};

const notifyReconnect = () => {
    const now = Date.now();

    for (const subscription of subscriptions.values()) {
        if (!subscription.onReconnect) {
            continue;
        }

        if (now - subscription.lastReconnectAt < RECONNECT_RESYNC_COOLDOWN_MS) {
            continue;
        }

        subscription.lastReconnectAt = now;
        subscription.onReconnect();
    }
};

const ensureSocket = () => {
    if (socket) {
        return socket;
    }

    socket = io(backendUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });

    if (!listenersBound) {
        socket.on('connect', () => {
            emitCurrentSubscriptions();

            if (hasConnectedOnce) {
                notifyReconnect();
            }

            hasConnectedOnce = true;
        });

        socket.on('market.updated', (payload: MarketUpdatedPayload) => {
            notifyEvent('market.updated', payload);
        });

        socket.on('portfolio.updated', (payload: PortfolioUpdatedPayload) => {
            notifyEvent('portfolio.updated', payload);
        });

        socket.on('leaderboard.updated', (payload: LeaderboardUpdatedPayload) => {
            notifyEvent('leaderboard.updated', payload);
        });

        listenersBound = true;
    }

    return socket;
};

export const subscribeRealtime = (subscription: {
    channels: RealtimeEventName[];
    onEvent: Subscription['onEvent'];
    onReconnect?: () => void;
}) => {
    const client = ensureSocket();

    const normalizedChannels = subscription.channels.filter((channel) => SOCKET_EVENTS.includes(channel));

    const id = nextSubscriptionId;
    nextSubscriptionId += 1;

    subscriptions.set(id, {
        id,
        channels: normalizedChannels,
        onEvent: subscription.onEvent,
        onReconnect: subscription.onReconnect,
        lastReconnectAt: 0,
    });

    if (client.connected && normalizedChannels.length > 0) {
        client.emit('subscribe', normalizedChannels);
    }

    return () => {
        const active = subscriptions.get(id);
        subscriptions.delete(id);

        if (active && socket?.connected && active.channels.length > 0) {
            socket.emit('unsubscribe', active.channels);
        }

        if (subscriptions.size === 0 && socket) {
            socket.disconnect();
            socket = null;
            listenersBound = false;
            hasConnectedOnce = false;
        }
    };
};