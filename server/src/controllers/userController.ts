import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabaseClient';
import { AuthRequest } from '../middleware/authMiddleware';

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

// POST /login - login account
export const login = async(req:Request, res:Response) => {
    // Extracts login details
    const { email, password } = req.body;

    // Authenticates user in Supabase Auth table
    const { data:signInData, error:signInError } = await supabase.
    auth.signInWithPassword({
        email,
        password
    });

    // User authentication error checks
    if(signInError) return res.status(401).json({ error: signInError.message });

    const user = signInData.user;
    if(!user) return res.status(401).json({ error: "Invalid credentials." });

    // Get profile info
    const { data:profile, error:profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url, balance, created_at')
        .eq("id", user.id)
        .single();

    // Profile info error checks
    if(profileError) return res.status(500).json({ error:profileError.message });
    
    // Success!
    return res.json({
        message: "Login successful",
        user: {
            id: user.id,
            email: user.email,
            ...profile,
        },
        session: signInData.session,
    });
};

// GET /profile - fetch account details
export const getMyProfile = async(req:AuthRequest, res:Response) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if(error) return res.status(500).json({ error: "Failed to load profile" });

    res.json(data);
};

