import { createClient } from '@supabase/supabase-js';

// Configuration keys from environment or localStorage
const SUPABASE_URL_KEY = 'mg_supabase_url';
const SUPABASE_ANON_KEY = 'mg_supabase_anon_key';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const localUrl = localStorage.getItem(SUPABASE_URL_KEY);
  const localKey = localStorage.getItem(SUPABASE_ANON_KEY);

  const url = localUrl || envUrl || '';
  const key = localKey || envKey || '';

  return { url, key, isConfigured: Boolean(url && key) };
}

export function saveSupabaseCredentials(url, key) {
  if (url) localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  else localStorage.removeItem(SUPABASE_URL_KEY);

  if (key) localStorage.setItem(SUPABASE_ANON_KEY, key.trim());
  else localStorage.removeItem(SUPABASE_ANON_KEY);

  window.location.reload();
}

let supabaseInstance = null;

export function getSupabase() {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

// SQL Script helper for easy one-click setup in Supabase SQL editor
export const SUPABASE_SETUP_SQL = `-- 1. Tabla de Configuración de Estructura (Supervisoras y Tiendas)
CREATE TABLE IF NOT EXISTS public.mg_config (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Cargas Diarias
CREATE TABLE IF NOT EXISTS public.mg_cargas (
  id TEXT PRIMARY KEY, -- formato: {tiendaId}_{fecha}
  tienda_id TEXT NOT NULL,
  tienda_nombre TEXT NOT NULL,
  supervisora_id TEXT DEFAULT '',
  supervisora_nombre TEXT DEFAULT '',
  fecha DATE NOT NULL,
  mes TEXT NOT NULL, -- YYYY-MM
  comandas INT NOT NULL DEFAULT 0,
  venta NUMERIC NOT NULL DEFAULT 0,
  unidades INT NOT NULL DEFAULT 0,
  ticket_promedio NUMERIC,
  unidades_por_comanda NUMERIC,
  cargado_por TEXT,
  cargado_en TIMESTAMPTZ DEFAULT now(),
  modificado_por TEXT,
  modificado_en TIMESTAMPTZ
);

-- Habilitar RLS y políticas permisivas (o lectura/escritura anónima)
ALTER TABLE public.mg_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mg_cargas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo mg_config" ON public.mg_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo mg_cargas" ON public.mg_cargas FOR ALL USING (true) WITH CHECK (true);
`;
