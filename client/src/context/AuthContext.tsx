import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'business';
  nombre_negocio?: string;
  categoria_negocio?: string;
  ciudad?: string;
  telefono?: string;
  web?: string;
  direccion?: string;
}

export interface DirectorioSeguimiento {
  id: string;
  directorio_slug: string;
  estado: 'pendiente' | 'registrado' | 'activo' | 'rechazado';
  url_perfil?: string;
  notas?: string;
  fecha_registro?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  register: (email: string, password: string, metadata?: Record<string, string>) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: string | null }>;
  // Directorios tracking
  getDirectoriosSeguimiento: () => Promise<DirectorioSeguimiento[]>;
  marcarDirectorio: (slug: string, estado: DirectorioSeguimiento['estado'], urlPerfil?: string) => Promise<{ error: string | null }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.rol || 'business',
    nombre_negocio: data.nombre_negocio,
    categoria_negocio: data.categoria_negocio,
    ciudad: data.ciudad,
    telefono: data.telefono,
    web: data.web,
    direccion: data.direccion,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [_, setLocation] = useLocation();

  // Load profile from DB when session changes
  const loadProfile = async (s: Session | null) => {
    if (!s?.user) {
      setUser(null);
      return;
    }

    const profile = await fetchProfile(s.user.id);

    if (profile) {
      setUser(profile);
    } else {
      // Fallback to user_metadata if profile not yet created (race condition)
      const meta = s.user.user_metadata || {};
      setUser({
        id: s.user.id,
        email: s.user.email || '',
        role: meta.role || 'business',
        nombre_negocio: meta.nombre_negocio,
        categoria_negocio: meta.categoria_negocio,
        ciudad: meta.ciudad,
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loadProfile(session).then(() => setLoading(false));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      loadProfile(session).then(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    setLocation('/dashboard');
    return { error: null };
  };

  const register = async (
    email: string,
    password: string,
    metadata?: Record<string, string>
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: metadata?.role || 'business',
          nombre_negocio: metadata?.nombre_negocio || '',
          categoria_negocio: metadata?.categoria_negocio || '',
          ciudad: metadata?.ciudad || '',
        },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setLocation('/');
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'No autenticado' };

    const updateData: Record<string, unknown> = {};
    if (data.nombre_negocio !== undefined) updateData.nombre_negocio = data.nombre_negocio;
    if (data.categoria_negocio !== undefined) updateData.categoria_negocio = data.categoria_negocio;
    if (data.ciudad !== undefined) updateData.ciudad = data.ciudad;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.web !== undefined) updateData.web = data.web;
    if (data.direccion !== undefined) updateData.direccion = data.direccion;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) return { error: error.message };

    // Update local state
    setUser(prev => prev ? { ...prev, ...data } : null);
    return { error: null };
  };

  // === Directorios Seguimiento ===

  const getDirectoriosSeguimiento = async (): Promise<DirectorioSeguimiento[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('directorios_seguimiento')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map(d => ({
      id: d.id,
      directorio_slug: d.directorio_slug,
      estado: d.estado,
      url_perfil: d.url_perfil,
      notas: d.notas,
      fecha_registro: d.fecha_registro,
    }));
  };

  const marcarDirectorio = async (
    slug: string,
    estado: DirectorioSeguimiento['estado'],
    urlPerfil?: string
  ): Promise<{ error: string | null }> => {
    if (!user) return { error: 'No autenticado' };

    const { error } = await supabase
      .from('directorios_seguimiento')
      .upsert(
        {
          user_id: user.id,
          directorio_slug: slug,
          estado,
          url_perfil: urlPerfil || null,
          fecha_registro: estado === 'registrado' || estado === 'activo' ? new Date().toISOString().split('T')[0] : null,
        },
        { onConflict: 'user_id,directorio_slug' }
      );

    if (error) return { error: error.message };
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        logout,
        updateProfile,
        getDirectoriosSeguimiento,
        marcarDirectorio,
        isAuthenticated: !!session,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
