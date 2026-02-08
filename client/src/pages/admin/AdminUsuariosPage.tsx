import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Shield,
  Store,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  rol: string;
  nombre_negocio: string;
  categoria_negocio: string;
  ciudad: string;
  telefono: string;
  web: string;
  direccion: string;
  created_at: string;
}

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRol, setFilterRol] = useState<'todos' | 'admin' | 'business'>('todos');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsuarios(data || []);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      toast.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const matchRol = filterRol === 'todos' || u.rol === filterRol;
    const matchSearch =
      !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.nombre_negocio?.toLowerCase().includes(search.toLowerCase()) ||
      u.ciudad?.toLowerCase().includes(search.toLowerCase());
    return matchRol && matchSearch;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Usuarios</h1>
            <p className="text-sm text-white/40 mt-1">
              {usuarios.length} usuarios registrados
            </p>
          </div>
          <button
            onClick={loadUsuarios}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm font-medium text-white/70 hover:bg-white/[0.1] hover:text-white/90 transition-all backdrop-blur-sm"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por email, negocio, ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/90 placeholder:text-white/30 focus:ring-2 focus:ring-accent/30 focus:border-accent/30 outline-none transition-all backdrop-blur-sm"
            />
          </div>
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 gap-1 backdrop-blur-sm">
            {(['todos', 'business', 'admin'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterRol(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filterRol === f
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                )}
              >
                {f === 'todos' ? 'Todos' : f === 'business' ? 'Negocios' : 'Admins'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-10 text-center">
            <Users className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
            {/* Header tabla (desktop) */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px_100px] gap-4 px-5 py-3 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-medium text-white/30 uppercase tracking-widest">
              <span>Email</span>
              <span>Negocio</span>
              <span>Ciudad</span>
              <span>Rol</span>
              <span>Registro</span>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {filteredUsuarios.map((u) => (
                <div
                  key={u.id}
                  className="px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px_100px] gap-4 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          u.rol === 'admin' ? 'bg-purple-500/15' : 'bg-blue-500/15'
                        )}
                      >
                        {u.rol === 'admin' ? (
                          <Shield className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Store className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <span className="text-sm text-white/80 truncate">{u.email}</span>
                    </div>
                    <span className="text-sm text-white/50 truncate">
                      {u.nombre_negocio || '—'}
                    </span>
                    <span className="text-sm text-white/50">{u.ciudad || '—'}</span>
                    <span
                      className={cn(
                        'text-[11px] font-medium px-2 py-0.5 rounded-full inline-block w-fit',
                        u.rol === 'admin'
                          ? 'bg-purple-500/15 text-purple-400'
                          : 'bg-blue-500/15 text-blue-400'
                      )}
                    >
                      {u.rol === 'admin' ? 'Admin' : 'Negocio'}
                    </span>
                    <span className="text-xs text-white/30">
                      {formatDate(u.created_at)}
                    </span>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                          u.rol === 'admin' ? 'bg-purple-500/15' : 'bg-blue-500/15'
                        )}
                      >
                        {u.rol === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Store className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-white/80 truncate">{u.email}</span>
                      <span
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-auto',
                          u.rol === 'admin'
                            ? 'bg-purple-500/15 text-purple-400'
                            : 'bg-blue-500/15 text-blue-400'
                        )}
                      >
                        {u.rol === 'admin' ? 'Admin' : 'Negocio'}
                      </span>
                    </div>
                    <p className="text-xs text-white/30 pl-9">
                      {[u.nombre_negocio, u.ciudad].filter(Boolean).join(' · ') || 'Sin datos'}
                      {' · '}
                      {formatDate(u.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
