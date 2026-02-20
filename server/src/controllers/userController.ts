import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabaseClient';

// POST /register - register account
export const register = async(req:Request, res:Response) => {
    // Extracts registration details
    const { email, password, username } = req.body;

    // Creates user in Supabase Auth table
    const { data:signUpData, error:signUpError } = await 
    supabase.auth.signUp({
        email,
        password
    });

    // User creation error checks
    if(signUpError) return res.status(400).json({ error: signUpError.message });
    
    const user = signUpData.user;
    if(!user) return res.status(500).json({ error: "User creation failed." });

    // Creating user's profile in profiles table
    const { error:profileError } = await 
    supabaseAdmin.from('profiles').insert([
        {
            id: user.id,
            username,
        },
    ]);

    // Profile creation error checks
    if(profileError) return res.status(500).json({ error: profileError.message });

    // Success!
    return res.status(201).json({
        message: "Registration successful", user: { id:user.id, email, username}
    });
};

// GET /login - login account
export const login = async(req:Request, res:Response) => {
    
};