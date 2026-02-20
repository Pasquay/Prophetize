import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Standard Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL in .env file');
if (!supabaseKey) throw new Error('Missing SUPABASE_KEY in .env file');

export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin Supabase client
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
if(!supabaseServiceKey) throw new Error('Missing SUPABASE_SERVICE_KEY in .env file');

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);