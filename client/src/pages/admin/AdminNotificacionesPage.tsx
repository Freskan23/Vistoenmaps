import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import {
  Bell,
  BellOff,
  Store,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notificacion {
  id: string;
  tipo: string;
  mensaje: string;
  datos: Record<string, unknown>;
  leida: boolean;
  created_at: string;
}

export default function AdminNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'no_leidas' | 'leidas'>('todas');

  useEffect(() => {
    loadNotificaciones();
  }, []);

  const loadNotificaciones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificaciones_admin')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotificaciones(data || []);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      toast.error('Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const marcarLeida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones_admin')
        .update({ leida: true })
        .eq('id', id);

      if (error) throw error;

      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error('Error marcando notificacion:', err);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const noLeidas = notificaciones.filter((n) => !n.leida).map((n) => n.id);
      if (noLeidas.length === 0) return;

      const { error } = await supabase
        .from('notificaciones_admin')
        .update({ leida: true })
        .in('id', noLeidas);

      if (error) throw error;

      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
      toast.success('Todas las notificaciones marcadas como leidas');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error actualizando notificaciones');
    }
  };

  const filtered = notificaciones.filter((n) => {
    if (filter === 'no_leidas') return !n.leida;
    if (filter === 'leidas') return n.leida;
    return true;
  });

  const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-sm text-gray-500 mt-1">
              {noLeidasCount > 0
                ? `${noLeidasCount} sin leer`
                : 'Todas leidas'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {noLeidasCount > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Marcar todas como leidas
              </button>
            )}
            <button
              onClick={loadNotificaciones}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1 w-fit">
          {(['todas', 'no_leidas', 'leidas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                filter === f
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              {f === 'todas' ? 'Todas' : f === 'no_leidas' ? `Sin leer (${noLeidasCount})` : 'Leidas'}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay notificaciones</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.leida && marcarLeida(n.id)}
                className={cn(
                  'bg-white rounded-xl border px-5 py-4 flex items-start gap-4 transition-colors cursor-pointer',
                  n.leida
                    ? 'border-gray-200 opacity-60'
                    : 'border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.04]'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    n.leida ? 'bg-gray-100' : 'bg-primary/10'
                  )}
                >
                  {n.tipo === 'nuevo_negocio' ? (
                    <Store className={cn('w-5 h-5', n.leida ? 'text-gray-400' : 'text-primary')} />
                  ) : (
                    <Bell className={cn('w-5 h-5', n.leida ? 'text-gray-400' : 'text-primary')} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', n.leida ? 'text-gray-500' : 'text-gray-900 font-medium')}>
                    {n.mensaje}
                  </p>
                  {n.datos && (n.datos as Record<string, string>).ciudad && (
                    <p className="text-xs text-gray-400 mt-1">
                      {(n.datos as Record<string, string>).ciudad}
                      {(n.datos as Record<string, string>).provincia && `, ${(n.datos as Record<string, string>).provincia}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(n.created_at)}</span>
                  {!n.leida && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
