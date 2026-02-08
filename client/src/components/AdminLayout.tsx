import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Negocios',
    href: '/admin/negocios',
    icon: Store,
    badge: true,
  },
  {
    label: 'Usuarios',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    label: 'Notificaciones',
    href: '/admin/notificaciones',
    icon: Bell,
  },
  {
    label: 'Configuracion',
    href: '/admin/configuracion',
    icon: Settings,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, loading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      setLocation('/dashboard');
    }
  }, [user, isAdmin, loading, setLocation]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase
      .from('negocios')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'pendiente')
      .then(({ count }) => {
        setPendingCount(count || 0);
      });
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const isActive = (href: string) => {
    if (href === '/admin') return location === '/admin';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen flex bg-[#0c1929]">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Glass */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          'bg-white/[0.04] backdrop-blur-xl border-r border-white/[0.08]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="relative">
                <img src={logo} alt="Visto en Maps" className="h-9 w-auto group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-white/90 tracking-tight">Visto en Maps</p>
                <p className="text-[9px] text-accent/70 uppercase tracking-[0.2em] font-semibold flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  Admin Panel
                </p>
              </div>
            </Link>
            <button
              className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] text-white/30 uppercase tracking-[0.15em] font-semibold px-3 pt-2 pb-1.5">
            Menu
          </p>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-accent/15 text-accent shadow-[0_0_20px_rgba(196,91,40,0.1)]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
                )}
                <item.icon className={cn(
                  'w-[18px] h-[18px] transition-colors',
                  active ? 'text-accent' : 'text-white/40 group-hover:text-white/60'
                )} />
                <span className="flex-1">{item.label}</span>
                {item.badge && pendingCount > 0 && (
                  <span className="bg-accent text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none shadow-lg shadow-accent/30">
                    {pendingCount}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-accent/50" />}
              </Link>
            );
          })}

          <div className="border-t border-white/[0.06] my-3" />

          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all group"
          >
            <Home className="w-[18px] h-[18px] text-white/30 group-hover:text-white/50" />
            <span>Ir a la web</span>
          </Link>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center ring-1 ring-accent/20">
              <span className="text-[11px] font-bold text-accent">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white/80 truncate">{user.email}</p>
              <p className="text-[10px] text-white/30">Administrador</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-[12px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top bar mobile */}
        <header className="lg:hidden bg-white/[0.04] backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Menu className="w-5 h-5 text-white/70" />
          </button>
          <img src={logo} alt="Visto en Maps" className="h-7 w-auto" />
          <span className="text-[10px] text-accent/60 font-semibold uppercase tracking-[0.15em]">Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
