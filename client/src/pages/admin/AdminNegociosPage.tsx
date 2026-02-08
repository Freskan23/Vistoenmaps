import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Eye,
  MapPin,
  Mail,
  Phone,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Negocio {
  id: string;
  nombre: string;
  descripcion: string;
  categoria_slug: string;
  ciudad: string;
  provincia: string;
  comunidad: string;
  ciudad_nombre: string;
  barrio_nombre: string;
  direccion: string;
  email: string;
  telefono: string;
  web: string;
  horario: string;
  google_maps_url: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  created_at: string;
  user_id: string;
}

type FilterEstado = 'todos' | 'pendiente' | 'aprobado' | 'rechazado';

export default function AdminNegociosPage() {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterEstado>('pendiente');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadNegocios();
  }, [filter]);

  const loadNegocios = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('negocios')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'todos') {
        query = query.eq('estado', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNegocios(data || []);
    } catch (err) {
      console.error('Error cargando negocios:', err);
      toast.error('Error cargando negocios');
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (id: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) throw error;

      setNegocios((prev) =>
        prev.map((n) => (n.id === id ? { ...n, estado: nuevoEstado } : n))
      );

      toast.success(
        nuevoEstado === 'aprobado'
          ? 'Negocio aprobado correctamente'
          : 'Negocio rechazado'
      );
    } catch (err) {
      console.error('Error actualizando estado:', err);
      toast.error('Error al actualizar el estado');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredNegocios = negocios.filter((n) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      n.nombre?.toLowerCase().includes(s) ||
      n.ciudad?.toLowerCase().includes(s) ||
      n.provincia?.toLowerCase().includes(s) ||
      n.email?.toLowerCase().includes(s) ||
      n.categoria_slug?.toLowerCase().includes(s)
    );
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const estadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-400">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'aprobado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            Aprobado
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-500/15 text-red-400">
            <XCircle className="w-3 h-3" />
            Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Negocios</h1>
            <p className="text-sm text-white/40 mt-1">
              Gestiona los negocios registrados en la plataforma
            </p>
          </div>
          <button
            onClick={loadNegocios}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] border border-white/[0.08] rounded-xl text-sm font-medium text-white/70 hover:bg-white/[0.1] hover:text-white/90 transition-all backdrop-blur-sm"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white/90 placeholder:text-white/30 focus:ring-2 focus:ring-accent/30 focus:border-accent/30 outline-none transition-all backdrop-blur-sm"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 gap-1 backdrop-blur-sm">
            {(['pendiente', 'aprobado', 'rechazado', 'todos'] as FilterEstado[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filter === f
                    ? 'bg-accent text-white shadow-lg shadow-accent/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.06]'
                )}
              >
                {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : f === 'aprobado' ? 'Aprobados' : 'Rechazados'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/[0.08] rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/[0.08] rounded w-48" />
                    <div className="h-3 bg-white/[0.06] rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNegocios.length === 0 ? (
          <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-10 text-center">
            <Store className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-medium">No hay negocios {filter !== 'todos' ? filter + 's' : ''}</p>
            <p className="text-sm text-white/30 mt-1">
              {search ? 'Prueba con otros terminos de busqueda' : 'Aun no hay registros con este filtro'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNegocios.map((neg) => {
              const isExpanded = expandedId === neg.id;
              return (
                <div
                  key={neg.id}
                  className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden transition-all hover:border-white/[0.12]"
                >
                  {/* Row principal */}
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : neg.id)}
                  >
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                        neg.estado === 'pendiente' && 'bg-amber-500/15',
                        neg.estado === 'aprobado' && 'bg-emerald-500/15',
                        neg.estado === 'rechazado' && 'bg-red-500/15'
                      )}
                    >
                      <Store
                        className={cn(
                          'w-5 h-5',
                          neg.estado === 'pendiente' && 'text-amber-400',
                          neg.estado === 'aprobado' && 'text-emerald-400',
                          neg.estado === 'rechazado' && 'text-red-400'
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white/90 truncate">{neg.nombre}</p>
                        {estadoBadge(neg.estado)}
                      </div>
                      <p className="text-sm text-white/40 mt-0.5 truncate">
                        {[neg.categoria_slug, neg.ciudad_nombre || neg.ciudad, neg.provincia]
                          .filter(Boolean)
                          .join(' · ')}
                        {' · '}
                        {formatDate(neg.created_at)}
                      </p>
                    </div>

                    {/* Acciones rapidas (solo pendientes) */}
                    {neg.estado === 'pendiente' && (
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEstado(neg.id, 'aprobado');
                          }}
                          disabled={actionLoading === neg.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50 border border-emerald-500/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aprobar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEstado(neg.id, 'rechazado');
                          }}
                          disabled={actionLoading === neg.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </button>
                      </div>
                    )}

                    {/* Cambiar estado si ya fue aprobado/rechazado */}
                    {neg.estado === 'aprobado' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateEstado(neg.id, 'rechazado');
                        }}
                        disabled={actionLoading === neg.id}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-medium rounded-lg hover:bg-white/[0.1] hover:text-white/70 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Rechazar
                      </button>
                    )}

                    {neg.estado === 'rechazado' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateEstado(neg.id, 'aprobado');
                        }}
                        disabled={actionLoading === neg.id}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs font-medium rounded-lg hover:bg-white/[0.1] hover:text-white/70 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aprobar
                      </button>
                    )}

                    <button className="p-1 text-white/30">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-white/[0.06] pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Info del negocio */}
                        <div className="space-y-3">
                          <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                            Datos del negocio
                          </h3>
                          {neg.descripcion && (
                            <p className="text-sm text-white/60">{neg.descripcion}</p>
                          )}
                          <div className="space-y-2">
                            {neg.categoria_slug && (
                              <DetailRow label="Categoria" value={neg.categoria_slug} />
                            )}
                            {neg.comunidad && (
                              <DetailRow label="Comunidad" value={neg.comunidad} />
                            )}
                            {neg.provincia && (
                              <DetailRow label="Provincia" value={neg.provincia} />
                            )}
                            {(neg.ciudad_nombre || neg.ciudad) && (
                              <DetailRow
                                label="Ciudad"
                                value={neg.ciudad_nombre || neg.ciudad}
                                icon={MapPin}
                              />
                            )}
                            {neg.barrio_nombre && (
                              <DetailRow label="Barrio" value={neg.barrio_nombre} />
                            )}
                            {neg.direccion && (
                              <DetailRow label="Direccion" value={neg.direccion} icon={MapPin} />
                            )}
                          </div>
                        </div>

                        {/* Contacto */}
                        <div className="space-y-3">
                          <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
                            Contacto
                          </h3>
                          <div className="space-y-2">
                            {neg.email && (
                              <DetailRow label="Email" value={neg.email} icon={Mail} />
                            )}
                            {neg.telefono && (
                              <DetailRow label="Telefono" value={neg.telefono} icon={Phone} />
                            )}
                            {neg.web && (
                              <DetailRow
                                label="Web"
                                value={neg.web}
                                icon={Globe}
                                isLink
                              />
                            )}
                            {neg.horario && (
                              <DetailRow label="Horario" value={neg.horario} icon={Clock} />
                            )}
                            {neg.google_maps_url && (
                              <DetailRow
                                label="Google Maps"
                                value="Ver en mapa"
                                icon={ExternalLink}
                                isLink
                                href={neg.google_maps_url}
                              />
                            )}
                          </div>

                          <div className="text-[11px] text-white/20 mt-4 font-mono">
                            ID: {neg.id}
                            <br />
                            User: {neg.user_id}
                            <br />
                            Creado: {formatDate(neg.created_at)}
                          </div>
                        </div>
                      </div>

                      {/* Acciones mobile */}
                      {neg.estado === 'pendiente' && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/[0.06] sm:hidden">
                          <button
                            onClick={() => updateEstado(neg.id, 'aprobado')}
                            disabled={actionLoading === neg.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/30 transition-colors disabled:opacity-50 border border-emerald-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => updateEstado(neg.id, 'rechazado')}
                            disabled={actionLoading === neg.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// --- Detail Row ---
function DetailRow({
  label,
  value,
  icon: Icon,
  isLink,
  href,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  isLink?: boolean;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="w-4 h-4 text-white/25 mt-0.5 flex-shrink-0" />}
      <span className="text-white/40 min-w-[80px]">{label}:</span>
      {isLink ? (
        <a
          href={href || value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent/80 truncate transition-colors"
        >
          {value}
        </a>
      ) : (
        <span className="text-white/80 truncate">{value}</span>
      )}
    </div>
  );
}
