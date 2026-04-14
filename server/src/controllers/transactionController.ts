import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../types/authRequest';
import { emitTradeRealtimeUpdates } from '../services/realtimeService';

const ACTIVE_MARKET_STATUSES = new Set(['active', 'open']);

const parseOptionId = (value: unknown): number | null => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};

const parseShares = (value: unknown): number | null => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
};

const isSingleObjectCoercionError = (message: string | undefined) => {
    if (!message) {
        return false;
    }

    return message.toLowerCase().includes('cannot coerce') || message.toLowerCase().includes('json object requested');
};

const getTradeSnapshot = async (userId: string, optionId: number) => {
    const profileQuery = supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId);

    const profileResult = typeof (profileQuery as any).maybeSingle === 'function'
        ? await (profileQuery as any).maybeSingle()
        : await (profileQuery as any).single();

    const profile = profileResult?.data ?? null;
    const profileError = profileResult?.error ?? null;

    if (profileError && !isSingleObjectCoercionError(profileError.message)) {
        throw new Error('Failed to fetch user profile');
    }

    const { data: position, error: positionError } = await supabase
        .from('user_positions')
        .select('shares_owned')
        .eq('user_id', userId)
        .eq('market_option_id', optionId)
        .maybeSingle();

    if (positionError && !isSingleObjectCoercionError(positionError.message)) {
        throw new Error(positionError.message || 'Failed to fetch user position');
    }

    return {
        balance: Number(profile?.balance ?? 0),
        position: {
            optionId,
            sharesOwned: Number(position?.shares_owned ?? 0),
        },
    };
};

const validateTradableOption = async (optionId: number) => {
    const { data: option, error: optionError } = await supabase
        .from('market_options')
        .select('id, current_price, market_id')
        .eq('id', optionId)
        .single();

    if (optionError || !option) {
        return { error: { status: 404, message: 'Option not found' } };
    }

    const currentPrice = Number(option.current_price);
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
        return { error: { status: 400, message: 'Invalid option price' } };
    }

    const { data: market, error: marketError } = await supabase
        .from('markets')
        .select('status')
        .eq('id', option.market_id)
        .single();

    if (marketError || !market) {
        return { error: { status: 404, message: 'Market not found' } };
    }

    const marketStatus = String(market.status || '').toLowerCase();
    if (!ACTIVE_MARKET_STATUSES.has(marketStatus)) {
        return { error: { status: 409, message: 'Market is not open for trading' } };
    }

    return {
        option: {
            id: Number(option.id),
            marketId: Number(option.market_id),
            currentPrice,
        },
    };
};

// POST /buy - Buy market option shares
export const buyShare = async(req:AuthRequest, res:Response) => {
    try {
        const userId = req.user?.id;
        const rawOptionId = req.body?.optionId;
        const rawShares = req.body?.shares;

        if(!userId) return res.status(401).json({ error: "Unauthorized" });

        const optionId = parseOptionId(rawOptionId);
        if(!optionId) return res.status(400).json({ error: "Invalid optionId" });

        const shares = parseShares(rawShares);
        if(!shares) return res.status(400).json({ error: "Shares must be greater than 0" });

        const optionValidation = await validateTradableOption(optionId);
        if ('error' in optionValidation) {
            return res.status(optionValidation.error.status).json({ error: optionValidation.error.message });
        }

        const totalCost = optionValidation.option.currentPrice * shares;

        const { error:rpcError } = await supabase.rpc('handle_buy_shares', {
            p_user_id: userId,
            p_option_id: optionId,
            p_shares: shares,
            p_total_cost: totalCost
        });

        if(rpcError) return res.status(400).json({ error: rpcError.message });

        const snapshot = await getTradeSnapshot(userId, optionId);

        emitTradeRealtimeUpdates({
            userId,
            marketId: optionValidation.option.marketId,
            optionId,
            balance: snapshot.balance,
            sharesOwned: snapshot.position.sharesOwned,
        });

        return res.status(200).json({
            message: "Purchase successful",
            trade: {
                side: 'buy',
                optionId,
                shares,
                price: optionValidation.option.currentPrice,
                totalCost,
            },
            snapshot,
        });
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
};

// POST /sell - Sell market option shares
export const sellShare = async(req:AuthRequest, res:Response) => {
    try {
        const userId = req.user?.id;
        const rawOptionId = req.body?.optionId;
        const rawShares = req.body?.shares;

        if(!userId) return res.status(401).json({ error: "Unauthorized" });

        const optionId = parseOptionId(rawOptionId);
        if(!optionId) return res.status(400).json({ error: "Invalid optionId" });

        const shares = parseShares(rawShares);
        if(!shares) return res.status(400).json({ error: "Shares must be greater than 0" });

        const optionValidation = await validateTradableOption(optionId);
        if ('error' in optionValidation) {
            return res.status(optionValidation.error.status).json({ error: optionValidation.error.message });
        }

        const totalReturn = optionValidation.option.currentPrice * shares;

        const { error:rpcError } = await supabase.rpc('handle_sell_shares', {
            p_user_id: userId,
            p_option_id: optionId,
            p_shares: shares,
            p_total_return: totalReturn
        });

        if(rpcError) return res.status(400).json({ error: rpcError.message });

        const snapshot = await getTradeSnapshot(userId, optionId);

        emitTradeRealtimeUpdates({
            userId,
            marketId: optionValidation.option.marketId,
            optionId,
            balance: snapshot.balance,
            sharesOwned: snapshot.position.sharesOwned,
        });

        return res.status(200).json({
            message: "Sale successful",
            trade: {
                side: 'sell',
                optionId,
                shares,
                price: optionValidation.option.currentPrice,
                totalReturn,
            },
            snapshot,
        });
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
};