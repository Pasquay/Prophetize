import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../types/authRequest';

export const getAllMarkets = async(req:Request, res:Response) => {
    try {
        const { data, error } = await supabase
            .from('markets')
            .select(`
                *,
                options: market_options!market_options_market_id_fkey(
                    id,
                    name,
                    probability,
                    current_price,
                    total_shares_outstanding,
                    volume
                )
            `)
            .order('created_at', { ascending: false });

        if(error) throw error;

        return res.status(200).json({ count: data.length, markets: data });
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
};


// GET /trending - Get trending markets (home page)
export const getTrendingMarkets = async(req:Request, res:Response) => {
    try {
        const { data, error } = await supabase
            .from('market_24h_stats')
            .select(`
                volume_24h,
                market:markets(
                    *,
                    options: market_options!market_options_market_id_fkey(
                        id, 
                        name, 
                        probability
                    )
                )
            `)
            .order('volume_24h', { ascending: false })
            .limit(20);
        
        if(error) throw error;

        const marketData = data.map((item:any) => {
            const market = item.market;
            const rawOptions = market.options || [];

            const sortedOptions = rawOptions.sort((a: any, b: any) => b.probability - a.probability);
            const topOptions = sortedOptions.slice(0, 2);

            const otherOptions = sortedOptions.slice(2);
            const otherProbability = otherOptions.reduce((sum: number, opt: any) => sum + opt.probability, 0);

            const finalOptions = [...topOptions];
            if (otherProbability > 0.01) {
                finalOptions.push({
                    id: 'other',
                    name: 'Other',
                    probability: otherProbability
                });
            }

            return {
                id: market.id,
                title: market.title,
                image: market.image_url,
                category: market.category,
                endDate: market.end_date,
                status: market.status,
                volume: item.volume_24h, 
                options: finalOptions
            }
        });

        return res.status(200).json(marketData);
    
    } catch(error: any){
        res.status(500).json({ error: error.message });
    }
};

// GET /:id - Get market by ID
export const getMarketById = async(req:Request, res:Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('markets')
            .select(`
                *,
                options: market_options!market_options_market_id_fkey(
                    *
                )
            `)
            .eq('id', id)
            .in('status', [
                'active',
                'closed',
                'resolving',
                'disputed',
                'finalized'
            ])
            .maybeSingle();

        if(error) throw error;

        if(!data) return res.status(404).json({ error: "Market not found or not visible." });

        return res.status(200).json({data});
    } catch(error:any){
        res.status(500).json({ error: error.message });
    }
};

// GET /search - Search markets with filters
export const searchMarket = async(req:Request, res:Response) => {

};

// POST /create - Adds market to pending for admin's approval
export const createMarket = async(req:AuthRequest, res:Response) => {
    try {
        const userId = req.user.id;
        const {
            title,
            description,
            imageUrl,
            category,
            endDate,
            options
        } = req.body;

        if(!options || options.length<2) return res.status(400).json({ error: "You must provide atleast 2 options." });

        const { data:market, error:marketError } = await supabase
            .from('markets')
            .insert({
                title,
                description,
                image_url: imageUrl,
                category,
                end_date: endDate,
                user_id: userId,
                status: 'pending' 
            })
            .select()
            .single();

        if(marketError) throw marketError;

        const initialProbability = 100/options.length;
        const initialPrice = 1.00/options.length;

        const marketOptions = options.map((optName: string) => ({
            market_id: market.id,
            name: optName,
            current_price: initialPrice,
            probability: initialProbability,
            total_shares_outstanding: 0,
            volume: 0
        }));

        const { error:optionsError } = await supabase
            .from('market_options')
            .insert(marketOptions);

        if(optionsError) throw optionsError;

        res.status(201).json({
            message: "Market submitted for admin approval. It will be visible once approved",
            marketId: market.id
        }); 
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
}

// POST /review - Admin approves/rejects market for posting
export const reviewMarket = async(req:AuthRequest, res:Response) => {
    console.log("BODY RECEIVED:", req.body); // Check your terminal!
    console.log("PARAMS RECEIVED:", req.params);
    try {
        const { id } = req.params;
        const { action } = req.body || {}; // 'approve', 'reject'

        if(!action) return res.status(400).json({ error: "Missing \'action\' in request body." });

        const validActions = ['approve', 'reject'];
        if(!validActions.includes(action)) return res.status(400).json({ error: "Invalid action. Use \"approve\" or \"reject\"."});

        const newStatus = action === 'approve' ? 'active' : 'rejected';
        
        const { data, error } = await supabase
            .from('markets')
            .update({ status: newStatus })
            .eq('id', id)
            .select()
            .single();
            
        if(error) throw error;

        const messageStatus = action === 'approve' ? 'approved' : 'rejected';    
        return res.status(200).json({
            message: `Market has been ${messageStatus}`,
            market: data
        });
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
}