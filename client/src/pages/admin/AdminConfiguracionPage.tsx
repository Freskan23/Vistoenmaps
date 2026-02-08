import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import {
  Settings,
  Database,
  Mail,
  Globe,
  Shield,
  ExternalLink,
} from 'lucide-react';

export default function AdminConfiguracionPage() {
  const { user } = useAuth();

  const links = [
    {
      label: 'Supabase Dashboard',
      description: 'Gestiona la base de datos, tablas, RLS y funciones',
      href: 'https://supabase.com/dashboard/project/efywsccaxaxntmkeuqec',
      icon: Database,
      color: 'green',
    },
    {
      label: 'Vercel Dashboard',
      description: 'Deploy, logs, variables de entorno y dominios',
      href: 'https://vercel.com/freskan23s-projects/vistoenmaps',
      icon: Globe,
      color: 'blue',
    },
    {
      label: 'Resend Dashboard',
      description: 'Emails enviados, estadisticas y configuracion',
      href: 'https://resend.com/emails',
      icon: Mail,
      color: 'purple',
    },
    {
      label: 'GitHub Repositorio',
      description: 'Codigo fuente, commits y pull requests',
      href: 'https://github.com/Freskan23/Vistoenmaps',
      icon: Shield,
      color: 'gray',
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string }> = {
    green:  { bg: 'bg-emerald-500/15', icon: 'text-emerald-400' },
    blue:   { bg: 'bg-blue-500/15',    icon: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/15',  icon: 'text-purple-400' },
    gray:   { bg: 'bg-white/[0.08]',   icon: 'text-white/60' },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Configuracion</h1>
          <p className="text-sm text-white/40 mt-1">
            Ajustes y enlaces rapidos de la plataforma
          </p>
        </div>

        {/* Info admin */}
        <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <h2 className="font-semibold text-white/90 mb-3">Cuenta de administrador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/40">Email:</span>{' '}
              <span className="text-white/80 font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="text-white/40">Rol:</span>{' '}
              <span className="inline-flex items-center gap-1 text-purple-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                Administrador
              </span>
            </div>
          </div>
        </div>

        {/* Enlaces rapidos */}
        <div>
          <h2 className="font-semibold text-white/90 mb-3">Enlaces rapidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links.map((link) => {
              const c = colorMap[link.color] || colorMap.gray;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5 hover:border-accent/20 hover:bg-white/[0.06] transition-all group flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                    <link.icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white/80 group-hover:text-accent transition-colors">
                        {link.label}
                      </p>
                      <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-accent/60 transition-colors" />
                    </div>
                    <p className="text-sm text-white/40 mt-1">{link.description}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Datos tecnicos */}
        <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-5">
          <h2 className="font-semibold text-white/90 mb-3">Datos tecnicos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/40">Supabase Project:</span>{' '}
              <code className="text-xs bg-white/[0.08] px-1.5 py-0.5 rounded text-white/60 font-mono">efywsccaxaxntmkeuqec</code>
            </div>
            <div>
              <span className="text-white/40">Dominio:</span>{' '}
              <code className="text-xs bg-white/[0.08] px-1.5 py-0.5 rounded text-white/60 font-mono">vistoenmaps.vercel.app</code>
            </div>
            <div>
              <span className="text-white/40">API Email:</span>{' '}
              <code className="text-xs bg-white/[0.08] px-1.5 py-0.5 rounded text-white/60 font-mono">Resend</code>
            </div>
            <div>
              <span className="text-white/40">Framework:</span>{' '}
              <code className="text-xs bg-white/[0.08] px-1.5 py-0.5 rounded text-white/60 font-mono">React + Vite + Supabase</code>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
