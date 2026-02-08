import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import AdminLayout from '@/components/AdminLayout';
import {
  Store,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

interface Stats {
  totalNegocios: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
  totalUsuarios: number;
}

interface NegocioPendiente {
  id: string;
  nombre: string;
  categoria_slug: string;
  ciudad: string;
  provincia: string;
  created_at: string;
  email?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalNegocios: 0,
    pendientes: 0,
    aprobados: 0,
    rechazados: 0,
    totalUsuarios: 0,
  });
  const [recientes, setRecientes] = useState<NegocioPendiente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar stats en paralelo
      const [
        { count: totalNegocios },
        { count: pendientes },
        { count: aprobados },
        { count: rechazados },
        { count: totalUsuarios },
        { data: negociosRecientes },
      ] = await Promise.all([
        supabase.from('negocios').select('id', { count: 'exact', head: true }),
        supabase.from('negocios').select('id', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('negocios').select('id', { count: 'exact', head: true }).eq('estado', 'aprobado'),
        supabase.from('negocios').select('id', { count: 'exact', head: true }).eq('estado', 'rechazado'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('negocios')
          .select('id, nombre, categoria_slug, ciudad, provincia, created_at, email')
          .eq('estado', 'pendiente')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalNegocios: totalNegocios || 0,
        pendientes: pendientes || 0,
        aprobados: aprobados || 0,
        rechazados: rechazados || 0,
        totalUsuarios: totalUsuarios || 0,
      });

      setRecientes(negociosRecientes || []);
    } catch (err) {
      console.error('Error cargando datos admin:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen general de la plataforma
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Negocios"
              value={stats.totalNegocios}
              icon={Store}
              color="blue"
            />
            <StatCard
              label="Pendientes"
              value={stats.pendientes}
              icon={Clock}
              color="amber"
              highlight={stats.pendientes > 0}
            />
            <StatCard
              label="Aprobados"
              value={stats.aprobados}
              icon={CheckCircle2}
              color="green"
            />
            <StatCard
              label="Rechazados"
              value={stats.rechazados}
              icon={XCircle}
              color="red"
            />
            <StatCard
              label="Usuarios"
              value={stats.totalUsuarios}
              icon={Users}
              color="purple"
            />
          </div>
        )}

        {/* Alerta de pendientes */}
        {stats.pendientes > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              Tienes <strong>{stats.pendientes} negocio{stats.pendientes > 1 ? 's' : ''}</strong> pendiente{stats.pendientes > 1 ? 's' : ''} de aprobacion.
            </p>
            <Link
              href="/admin/negocios"
              className="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              Revisar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Negocios pendientes recientes */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Negocios pendientes</h2>
              <p className="text-sm text-gray-500 mt-0.5">Ultimas solicitudes de registro</p>
            </div>
            <Link
              href="/admin/negocios"
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recientes.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay negocios pendientes</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recientes.map((neg) => (
                <div key={neg.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{neg.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {neg.ciudad && neg.provincia
                        ? `${neg.ciudad}, ${neg.provincia}`
                        : neg.categoria_slug || 'Sin categoria'}
                      {' · '}
                      {formatDate(neg.created_at)}
                    </p>
                  </div>
                  <Link
                    href="/admin/negocios"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Revisar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickLink
            href="/admin/negocios"
            icon={Store}
            label="Gestionar Negocios"
            description="Aprobar, rechazar o editar negocios"
          />
          <QuickLink
            href="/admin/usuarios"
            icon={Users}
            label="Gestionar Usuarios"
            description="Ver todos los usuarios registrados"
          />
          <QuickLink
            href="/admin/notificaciones"
            icon={TrendingUp}
            label="Notificaciones"
            description="Ver alertas y notificaciones del sistema"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

// --- Subcomponents ---

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`bg-white rounded-xl p-5 border ${
        highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary/30 hover:shadow-md transition-all group"
    >
      <Icon className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors mb-3" />
      <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
        {label}
      </p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}
