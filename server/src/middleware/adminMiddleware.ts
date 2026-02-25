import { Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';
import { AuthRequest } from '../types/authRequest';

export const requireAdmin = async(req:AuthRequest, res:Response, next:NextFunction) => {
    try {
        const userId = req.user.id;

        const { data:profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq("id", userId)
            .single();
        
        if(!profile || error) return res.status(403).json({ error: "Access denied: Profile not found." });
        if(profile.role!='admin') return res.status(403).json({ error: "Access denied: Admind only." });

        next();
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
};