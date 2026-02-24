import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';

export interface AuthRequest extends Request {
    user?: any;
    token?: string;
}

export const requireAuth = async(req:AuthRequest, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({ error: "Unauthorized: No token provided" });

    const token = authHeader.split(" ")[1];
    if(!token) return res.status(401).json({ error: "Malformed token" });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if(error || !user) return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });

    req.user = user;
    req.token = token;
    next();
};