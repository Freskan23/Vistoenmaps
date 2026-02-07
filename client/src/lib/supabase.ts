import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://efywsccaxaxntmkeuqec.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ycwDkJ9E1USanHYKn-CouA_z9uPusCd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
