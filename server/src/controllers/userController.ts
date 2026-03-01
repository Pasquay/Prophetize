import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabaseClient';
import { AuthRequest } from '../types/authRequest';

// POST /register - Register account
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

// POST /login - Login account
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

// POST /logout - Logout account
export const logout = async(req:AuthRequest, res:Response) => {
    try {
        const token = req.token as string;
        if(!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

        const { error } = await supabase.auth.admin.signOut(token);
        if(error) throw error;

        return res.status(200).json({ message: "Successfully logged out and session terminated"}); 
    } catch(err:any){
        return res.status(500).json({ message: err.message || "Failed to log out" });
    }
};

// GET /profile - Fetch account details
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

// POST /claim-allowance - Claim daily income
export const claimAllowance = async(req:AuthRequest, res:Response) => {
    try {
        const userId = req.user?.id;
        if(!userId) return res.status(401).json({ error: "Unauthorized" });

        const { data:profile, error:profileError } = await supabase
            .from('profiles')
            .select('balance, current_streak, last_claim_date')
            .eq('id', userId)
            .single();

        if(profileError) return res.status(400).json({ error: profileError.message });
        if(!profile) return res.status(404).json({ error: "Profile not found" });

        const now = new Date();
        const lastClaim = profile.last_claim_date ? new Date(profile.last_claim_date) : null;

        let newStreak = 1;
        if(lastClaim){
            const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
            const lastClaimUTC = Date.UTC(lastClaim.getUTCFullYear(), lastClaim.getUTCMonth(), lastClaim.getUTCDate());

            const diffTime = todayUTC - lastClaimUTC;
            const diffDays = Math.floor(diffTime / (1000*60*60*24));

            if(diffDays === 0) return res.status(400).json({ error: "You have already claimed your daily allowance" });
            else if (diffDays === 1) newStreak = (profile.current_streak % 7) + 1;
        }
        const payouts = [10, 15, 20, 25, 35, 50, 100];
        const rewardAmount = payouts[newStreak-1];
        const newBalance = profile.balance + rewardAmount;

        const { error:updateError } = await supabase
            .from('profiles')
            .update({
                balance: newBalance,
                current_streak: newStreak,
                last_claim_date: now.toISOString()
            })
            .eq('id', userId);
        
        if(updateError) throw updateError;
        
        return res.status(200).json({
            message: "Allowance claimed successfully!",
            reward: rewardAmount,
            newBalance: newBalance,
            streakDay: newStreak
        });
    } catch(error:any){
        return res.status(500).json({ error: error.message });
    }
};