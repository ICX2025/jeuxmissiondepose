import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfzoantigphrbalmpjtv.supabase.co';
const supabaseAnonKey = 'VOTRE_CLE_ANON_RECUPEREE_DANS_LEGACY';

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
