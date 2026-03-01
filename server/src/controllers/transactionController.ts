import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../types/authRequest';

// POST /buy - Buy market option shares
export const buyShare = async(req:AuthRequest, res:Response) => {
    try {
        const userId = req.user?.id;
        const { optionId, shares } = req.body;

        if(!userId) return res.status(401).json({ error: "Unauthorized" });
        if(!optionId) return res.status(400).json({ error: "Option not found" }); 
        if(!shares || shares<=0) return res.status(400).json({ error: "Shares must be greater than 0" });

        const { data:option, error: optError } = await supabase
            .from('market_options')
            .select('current_price, market_id')
            .eq('id', optionId)
            .single();

        if(optError || !option) throw new Error("Option not found");

        const totalCost = option.current_price * shares;

        const { error:rpcError } = await supabase.rpc('handle_buy_shares', {
            p_user_id: userId,
            p_option_id: optionId,
            p_shares: shares,
            p_total_cost: totalCost
        });

        if(rpcError) return res.status(400).json({ error: rpcError.message });

        return res.status(200).json({
            message: "Purchase successful",
            sharesPurchased: shares,
            totalCost: totalCost
        });
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
};

// POST /sell - Sell market option shares