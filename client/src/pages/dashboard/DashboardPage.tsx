import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth, type DirectorioSeguimiento } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  LogOut, Loader2, Crown, ExternalLink, CheckCircle2,
  AlertTriangle, ArrowUpRight, Star, Globe, Shield,
  TrendingUp, Target, Sparkles, Building2, MapPin,
  Circle, Clock, XCircle
} from 'lucide-react';
import Header from '@/components/Header';
import { getRecomendaciones, getResumenRecomendaciones, type Recomendacion } from '@/lib/recomendaciones';
import { categorias, ciudades } from '@/data';

function PrioridadBadge({ prioridad }: { prioridad: Recomendacion['prioridad'] }) {
  const config = {
    critica: { label: 'Critico', className: 'bg-red-100 text-red-700 border-red-200' },
    alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700 border-orange-200' },
    media: { label: 'Media', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    baja: { label: 'Baja', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const c = config[prioridad];
  return <Badge variant="outline" className={c.className}>{c.label}</Badge>;
}

function EstadoBadge({ estado }: { estado: DirectorioSeguimiento['estado'] }) {
  const config = {
    pendiente: { label: 'Pendiente', icon: Clock, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    registrado: { label: 'Registrado', icon: CheckCircle2, className: 'bg-blue-100 text-blue-700 border-blue-200' },
    activo: { label: 'Activo', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
    rechazado: { label: 'Rechazado', icon: XCircle, className: 'bg-red-100 text-red-700 border-red-200' },
  };
  const c = config[estado];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`${c.className} gap-1`}>
      <Icon className="w-3 h-3" /> {c.label}
    </Badge>
  );
}

interface DirectorioCardProps {
  rec: Recomendacion;
  seguimiento?: DirectorioSeguimiento;
  onMarcar: (slug: string, estado: DirectorioSeguimiento['estado']) => void;
  marking: string | null;
}

function DirectorioCard({ rec, seguimiento, onMarcar, marking }: DirectorioCardProps) {
  const dir = rec.directorio;
  const isMarking = marking === dir.slug;
  const completado = seguimiento && (seguimiento.estado === 'registrado' || seguimiento.estado === 'activo');

  return (
    <Card className={`group hover:shadow-md transition-all duration-200 hover:border-primary/30 ${completado ? 'border-green-200 bg-green-50/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {completado ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : dir.tipo === 'premium' ? (
                <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
              )}
              <h3 className={`font-semibold text-sm truncate ${completado ? 'text-green-700' : ''}`}>{dir.nombre}</h3>
              {seguimiento ? (
                <EstadoBadge estado={seguimiento.estado} />
              ) : (
                <PrioridadBadge prioridad={rec.prioridad} />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{dir.descripcion}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {rec.razones.map((razon, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {razon}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {dir.gratis && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="w-3 h-3" /> Gratis
                </span>
              )}
              {dir.permiteResenas && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" /> Resenas
                </span>
              )}
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> {dir.alcance}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{rec.score}</div>
              <div className="text-[10px] text-muted-foreground">puntos</div>
            </div>
            <div className="flex flex-col gap-1">
              {!completado ? (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1 text-xs h-7"
                  disabled={isMarking}
                  onClick={() => onMarcar(dir.slug, 'registrado')}
                >
                  {isMarking ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Hecho
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs h-7 text-muted-foreground"
                  disabled={isMarking}
                  onClick={() => onMarcar(dir.slug, 'pendiente')}
                >
                  Desmarcar
                </Button>
              )}
              <Link href={`/directorios/${dir.slug}`}>
                <Button size="sm" variant="outline" className="gap-1 text-xs h-7 w-full">
                  Ver <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout, isAuthenticated, getDirectoriosSeguimiento, marcarDirectorio } = useAuth();
  const [_, setLocation] = useLocation();
  const [seguimiento, setSeguimiento] = useState<DirectorioSeguimiento[]>([]);
  const [loadingSeg, setLoadingSeg] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  // Get business info from user profile
  const categoriaNegocio = user?.categoria_negocio || '';
  const ciudadNegocio = user?.ciudad || '';
  const nombreNegocio = user?.nombre_negocio || '';

  // Get recommendations
  const recomendaciones = useMemo(
    () => getRecomendaciones(categoriaNegocio, ciudadNegocio),
    [categoriaNegocio, ciudadNegocio]
  );

  const resumen = useMemo(
    () => getResumenRecomendaciones(categoriaNegocio, ciudadNegocio),
    [categoriaNegocio, ciudadNegocio]
  );

  const categoriaNombre = categorias.find(c => c.slug === categoriaNegocio)?.nombre || categoriaNegocio;
  const ciudadNombre = ciudades.find(c => c.slug === ciudadNegocio)?.nombre || ciudadNegocio;

  // Load tracking data
  const loadSeguimiento = useCallback(async () => {
    if (!isAuthenticated) return;
    const data = await getDirectoriosSeguimiento();
    setSeguimiento(data);
    setLoadingSeg(false);
  }, [isAuthenticated, getDirectoriosSeguimiento]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadSeguimiento();
    }
  }, [isAuthenticated, authLoading, loadSeguimiento]);

  // Seguimiento map for quick lookup
  const seguimientoMap = useMemo(() => {
    const map: Record<string, DirectorioSeguimiento> = {};
    for (const s of seguimiento) {
      map[s.directorio_slug] = s;
    }
    return map;
  }, [seguimiento]);

  // Count completed
  const completados = seguimiento.filter(s => s.estado === 'registrado' || s.estado === 'activo').length;
  const progressValue = resumen.total > 0 ? Math.round((completados / resumen.total) * 100) : 0;

  const handleMarcar = async (slug: string, estado: DirectorioSeguimiento['estado']) => {
    setMarking(slug);
    const { error } = await marcarDirectorio(slug, estado);
    if (error) {
      toast.error('Error al actualizar: ' + error);
    } else {
      toast.success(estado === 'registrado' ? 'Marcado como registrado' : 'Estado actualizado');
      await loadSeguimiento();
    }
    setMarking(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 flex flex-col">
      <Header />
      <div className="container py-6 md:py-8 flex-1 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">Tu informe SEO Local</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {nombreNegocio || user?.email}
              </span>
              {categoriaNombre && (
                <span className="flex items-center gap-1">
                  &bull; <Target className="w-4 h-4" /> {categoriaNombre}
                </span>
              )}
              {ciudadNombre && (
                <span className="flex items-center gap-1">
                  &bull; <MapPin className="w-4 h-4" /> {ciudadNombre}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2 self-start">
            <LogOut className="w-4 h-4" /> Cerrar sesion
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{resumen.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Directorios recomendados</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{completados}</div>
              <p className="text-xs text-muted-foreground mt-1">Completados</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{resumen.criticas.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Prioridad critica</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{resumen.altas.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Prioridad alta</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress indicator */}
        <Card className="mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Tu presencia en directorios</h3>
              </div>
              <span className="text-sm font-medium">
                {completados} / {resumen.total} completados
              </span>
            </div>
            <Progress value={progressValue} className="h-2 mb-3" />
            <p className="text-sm text-muted-foreground">
              {completados === 0
                ? <>Registrarte en estos directorios mejorara tu posicionamiento en Google Maps. Empieza por los de <strong>prioridad critica</strong>.</>
                : completados < resumen.total
                ? <>Buen progreso! Te faltan {resumen.total - completados} directorios. Sigue asi.</>
                : <>Felicidades! Estas registrado en todos los directorios recomendados.</>
              }
            </p>
          </CardContent>
        </Card>

        {/* Critical Priority */}
        {resumen.criticas.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold">Prioridad Critica - Deberias estar aqui</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {resumen.criticas.map((rec) => (
                <DirectorioCard
                  key={rec.directorio.slug}
                  rec={rec}
                  seguimiento={seguimientoMap[rec.directorio.slug]}
                  onMarcar={handleMarcar}
                  marking={marking}
                />
              ))}
            </div>
          </section>
        )}

        {/* High Priority */}
        {resumen.altas.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold">Prioridad Alta - Muy recomendados</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {resumen.altas.map((rec) => (
                <DirectorioCard
                  key={rec.directorio.slug}
                  rec={rec}
                  seguimiento={seguimientoMap[rec.directorio.slug]}
                  onMarcar={handleMarcar}
                  marking={marking}
                />
              ))}
            </div>
          </section>
        )}

        {/* Medium Priority */}
        {resumen.medias.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Prioridad Media - Complementarios</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {resumen.medias.map((rec) => (
                <DirectorioCard
                  key={rec.directorio.slug}
                  rec={rec}
                  seguimiento={seguimientoMap[rec.directorio.slug]}
                  onMarcar={handleMarcar}
                  marking={marking}
                />
              ))}
            </div>
          </section>
        )}

        {/* Low Priority */}
        {resumen.bajas.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-bold">Otros directorios</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {resumen.bajas.slice(0, 12).map((rec) => (
                <DirectorioCard
                  key={rec.directorio.slug}
                  rec={rec}
                  seguimiento={seguimientoMap[rec.directorio.slug]}
                  onMarcar={handleMarcar}
                  marking={marking}
                />
              ))}
            </div>
            {resumen.bajas.length > 12 && (
              <div className="text-center mt-4">
                <Link href="/directorios">
                  <Button variant="outline" className="gap-2">
                    Ver todos los directorios <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Necesitas ayuda para darte de alta?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Podemos gestionar el alta de tu negocio en todos estos directorios por ti.
            </p>
            <Link href="/contacto">
              <Button className="gap-2">
                Solicitar presupuesto <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
