import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Shield,
  Store,
  Mail,
  Phone,
  MapPin,
  Calendar,
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
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-sm text-gray-500 mt-1">
              {usuarios.length} usuarios registrados
            </p>
          </div>
          <button
            onClick={loadUsuarios}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email, negocio, ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
            {(['todos', 'business', 'admin'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterRol(f)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                  filterRol === f
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                {f === 'todos' ? 'Todos' : f === 'business' ? 'Negocios' : 'Admins'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header tabla (desktop) */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px_100px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span>Email</span>
              <span>Negocio</span>
              <span>Ciudad</span>
              <span>Rol</span>
              <span>Registro</span>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredUsuarios.map((u) => (
                <div
                  key={u.id}
                  className="px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[1fr_1fr_120px_100px_100px] gap-4 items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          u.rol === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                        )}
                      >
                        {u.rol === 'admin' ? (
                          <Shield className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Store className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <span className="text-sm text-gray-900 truncate">{u.email}</span>
                    </div>
                    <span className="text-sm text-gray-600 truncate">
                      {u.nombre_negocio || '—'}
                    </span>
                    <span className="text-sm text-gray-600">{u.ciudad || '—'}</span>
                    <span
                      className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-full inline-block w-fit',
                        u.rol === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {u.rol === 'admin' ? 'Admin' : 'Negocio'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(u.created_at)}
                    </span>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                          u.rol === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                        )}
                      >
                        {u.rol === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                        ) : (
                          <Store className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate">{u.email}</span>
                      <span
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-auto',
                          u.rol === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {u.rol === 'admin' ? 'Admin' : 'Negocio'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 pl-9">
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
