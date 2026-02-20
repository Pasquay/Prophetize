import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl) throw new Error('Missing SUPABASE_URL in .env file');
if (!supabaseKey) throw new Error('Missing or SUPABASE_KEY in .env file');

export const supabase = createClient(supabaseUrl, supabaseKey);