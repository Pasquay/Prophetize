import { Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// GET /markets - Get all markets
export const getAllMarkets = async (req:Request, res:Response) => {
    const { data, error } = await supabase.from("markets").select("*");

    if(error) return res.status(500).json({ error: error.message });

    res.json(data);
};

// GET /markets/:id = Get a market by id
export const getMarketById = async (req:Request, res:Response) => {
    const id = req.params;
    const { data, error } = await supabase.from("markets").select("*").eq("id", id).single();

    if(error) return res.status(404).json({ error: error.message });

    res.json(data);
}; 