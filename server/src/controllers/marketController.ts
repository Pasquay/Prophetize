import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// GET /markets - Get all markets
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