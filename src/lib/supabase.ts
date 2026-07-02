import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Tipos para o cliente mock (sem Supabase configurado)
type MockAuth = {
  getSession: () => Promise<{ data: { session: null }; error: null }>;
  signInWithOAuth: () => Promise<{ data: null; error: null }>;
  signUp: () => Promise<{ data: null; error: null }>;
  signInWithPassword: () => Promise<{ data: null; error: null }>;
  signOut: () => Promise<{ error: null }>;
};

type MockQuery = {
  select: () => { data: null[]; error: null };
  insert: () => { data: null; error: null };
  update: () => { data: null; error: null };
  delete: () => { data: null; error: null };
  upsert: () => Promise<{ data: null; error: null }>;
  eq: (column: string, value: unknown) => {
    select: () => { data: null[]; error: null };
    update: () => { data: null; error: null };
    delete: () => { data: null; error: null };
  };
};

type MockSupabase = {
  auth: MockAuth;
  from: (table: string) => MockQuery;
};

// Cliente Supabase: usa implementação real se tiver credenciais, senão usa mock
export const supabase = url && key
  ? createClient(url, key)
  : {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOAuth: async () => ({ data: null, error: null }),
        signUp: async () => ({ data: null, error: null }),
        signInWithPassword: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
        upsert: async () => ({ data: null, error: null }),
        eq: () => ({
          select: () => ({ data: [], error: null }),
          update: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        }),
      }),
    } as MockSupabase;