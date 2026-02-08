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
  Filter,
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

      // Actualizar localmente
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Pendiente
          </span>
        );
      case 'aprobado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Aprobado
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rechazado
          </span>
        );
      default:
        return null;
    }
  };

  const filterCounts = {
    todos: negocios.length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Negocios</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los negocios registrados en la plataforma
            </p>
          </div>
          <button
            onClick={loadNegocios}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
            {(['pendiente', 'aprobado', 'rechazado', 'todos'] as FilterEstado[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize',
                  filter === f
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNegocios.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay negocios {filter !== 'todos' ? filter + 's' : ''}</p>
            <p className="text-sm text-gray-400 mt-1">
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
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
                >
                  {/* Row principal */}
                  <div
                    className="px-5 py-4 flex items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : neg.id)}
                  >
                    <div
                      className={cn(
                        'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0',
                        neg.estado === 'pendiente' && 'bg-amber-100',
                        neg.estado === 'aprobado' && 'bg-green-100',
                        neg.estado === 'rechazado' && 'bg-red-100'
                      )}
                    >
                      <Store
                        className={cn(
                          'w-5 h-5',
                          neg.estado === 'pendiente' && 'text-amber-600',
                          neg.estado === 'aprobado' && 'text-green-600',
                          neg.estado === 'rechazado' && 'text-red-600'
                        )}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{neg.nombre}</p>
                        {estadoBadge(neg.estado)}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
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
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Aprobar
                      </button>
                    )}

                    <button className="p-1 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Info del negocio */}
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                            Datos del negocio
                          </h3>
                          {neg.descripcion && (
                            <p className="text-sm text-gray-600">{neg.descripcion}</p>
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
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
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

                          <div className="text-xs text-gray-400 mt-4">
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
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 sm:hidden">
                          <button
                            onClick={() => updateEstado(neg.id, 'aprobado')}
                            disabled={actionLoading === neg.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => updateEstado(neg.id, 'rechazado')}
                            disabled={actionLoading === neg.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
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
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <span className="text-gray-500 min-w-[80px]">{label}:</span>
      {isLink ? (
        <a
          href={href || value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline truncate"
        >
          {value}
        </a>
      ) : (
        <span className="text-gray-900 truncate">{value}</span>
      )}
    </div>
  );
}
