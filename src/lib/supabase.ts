import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeadEntry {
  id: string;
  email: string;
  name: string | null;
  score: number;
  created_at: string;
}

export async function submitLead(email: string, name: string | null, score: number): Promise<{ error: string | null }> {
  if (!email || !email.includes('@')) {
    return { error: 'Veuillez entrer un email valide.' };
  }
  const { error } = await supabase
    .from('leads')
    .insert({ email, name, score });
  return { error: error ? error.message : null };
}

export async function getTopScores(limit = 10): Promise<LeadEntry[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('id, email, name, score, created_at')
    .order('score', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as LeadEntry[];
}
