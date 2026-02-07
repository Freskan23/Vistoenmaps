import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header';
import {
  Building2, MapPin, Phone, Globe, Clock, Tag, FileText,
  Save, Loader2, ArrowLeft, CheckCircle2, Sparkles, Map
} from 'lucide-react';
import { categorias, ciudades, getBarriosByCiudad } from '@/data';
import type { Barrio } from '@/data/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface NegocioForm {
  nombre: string;
  descripcion: string;
  categoria_slug: string;
  ciudad_slug: string;
  barrio_slug: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  url_google_maps: string;
  horario: string;
}

const emptyForm: NegocioForm = {
  nombre: '',
  descripcion: '',
  categoria_slug: '',
  ciudad_slug: '',
  barrio_slug: '',
  direccion: '',
  telefono: '',
  email: '',
  web: '',
  url_google_maps: '',
  horario: '',
};

export default function MiNegocioPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();
  const [form, setForm] = useState<NegocioForm>(emptyForm);
  const [barrios, setBarrios] = useState<Barrio[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load barrios when city changes
  useEffect(() => {
    if (form.ciudad_slug) {
      const b = getBarriosByCiudad(form.ciudad_slug);
      setBarrios(b);
      // Reset barrio if not in new city
      if (!b.find(barrio => barrio.slug === form.barrio_slug)) {
        setForm(prev => ({ ...prev, barrio_slug: '' }));
      }
    } else {
      setBarrios([]);
    }
  }, [form.ciudad_slug]);

  // Load existing negocio
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const loadNegocio = async () => {
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (data && !error) {
        setExistingId(data.id);
        setForm({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          categoria_slug: data.categoria_slug || '',
          ciudad_slug: data.ciudad_slug || '',
          barrio_slug: data.barrio_slug || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          web: data.web || '',
          url_google_maps: data.url_google_maps || '',
          horario: data.horario || '',
        });
      } else {
        // Pre-fill from profile
        setForm(prev => ({
          ...prev,
          nombre: user.nombre_negocio || '',
          categoria_slug: user.categoria_negocio || '',
          ciudad_slug: user.ciudad || '',
          email: user.email || '',
        }));
      }
      setLoading(false);
    };

    loadNegocio();
  }, [user, isAuthenticated]);

  const updateField = (field: keyof NegocioForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!form.nombre || !form.categoria_slug || !form.ciudad_slug) {
      toast.error('Nombre, categoria y ciudad son obligatorios');
      return;
    }

    setSaving(true);

    const slug = slugify(form.nombre) + '-' + slugify(
      ciudades.find(c => c.slug === form.ciudad_slug)?.nombre || form.ciudad_slug
    );

    const negocioData = {
      nombre: form.nombre,
      slug,
      descripcion: form.descripcion || null,
      categoria_slug: form.categoria_slug,
      ciudad_slug: form.ciudad_slug,
      barrio_slug: form.barrio_slug || null,
      direccion: form.direccion || null,
      telefono: form.telefono || null,
      email: form.email || null,
      web: form.web || null,
      url_google_maps: form.url_google_maps || null,
      horario: form.horario || null,
      user_id: user.id,
      activo: true,
    };

    let error;

    if (existingId) {
      // Update
      const result = await supabase
        .from('negocios')
        .update(negocioData)
        .eq('id', existingId);
      error = result.error;
    } else {
      // Insert
      const result = await supabase
        .from('negocios')
        .insert(negocioData)
        .select('id')
        .single();
      error = result.error;
      if (result.data) {
        setExistingId(result.data.id);
      }
    }

    setSaving(false);

    if (error) {
      toast.error('Error al guardar: ' + error.message);
      return;
    }

    setSaved(true);
    toast.success(existingId ? 'Negocio actualizado' : 'Negocio creado correctamente');
  };

  if (authLoading || loading) {
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
      <div className="container py-6 md:py-8 flex-1 max-w-3xl">
        {/* Back link */}
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Volver al dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {existingId ? 'Editar mi negocio' : 'Dar de alta mi negocio'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {existingId
                ? 'Actualiza los datos de tu negocio para que aparezca correctamente en el directorio'
                : 'Completa la informacion de tu negocio para aparecer en el directorio de Visto en Maps'
              }
            </p>
          </div>
        </div>

        {saved && !existingId && (
          <Card className="mb-6 border-green-200 bg-green-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-medium text-green-800">Negocio creado correctamente</p>
                <p className="text-sm text-green-600">Tu negocio ya esta registrado. Puedes seguir editandolo cuando quieras.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          {/* Datos basicos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Datos basicos
              </CardTitle>
              <CardDescription>Informacion principal de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Nombre del negocio *
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Cerrajeria Martinez"
                  value={form.nombre}
                  onChange={(e) => updateField('nombre', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Descripcion
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe brevemente tu negocio, servicios principales, experiencia..."
                  value={form.descripcion}
                  onChange={(e) => updateField('descripcion', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Categoria *
                  </Label>
                  <Select value={form.categoria_slug} onValueChange={(v) => updateField('categoria_slug', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Ciudad *
                  </Label>
                  <Select value={form.ciudad_slug} onValueChange={(v) => updateField('ciudad_slug', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudades.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.nombre}
                        </SelectItem>
                      ))}
                      <SelectItem value="otra">Otra ciudad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {barrios.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Barrio / Zona
                  </Label>
                  <Select value={form.barrio_slug} onValueChange={(v) => updateField('barrio_slug', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona barrio (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {barrios.map((b) => (
                        <SelectItem key={b.slug} value={b.slug}>
                          {b.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contacto y ubicacion
              </CardTitle>
              <CardDescription>Como pueden encontrarte tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Direccion completa
                </Label>
                <Input
                  id="direccion"
                  placeholder="Calle, numero, piso..."
                  value={form.direccion}
                  onChange={(e) => updateField('direccion', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Telefono
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="612 345 678"
                    value={form.telefono}
                    onChange={(e) => updateField('telefono', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Email de contacto
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@tunegocio.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="web" className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Pagina web
                  </Label>
                  <Input
                    id="web"
                    type="url"
                    placeholder="https://www.tunegocio.com"
                    value={form.web}
                    onChange={(e) => updateField('web', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Horario
                  </Label>
                  <Input
                    id="horario"
                    placeholder="L-V 9:00-20:00, S 10:00-14:00"
                    value={form.horario}
                    onChange={(e) => updateField('horario', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_maps" className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-muted-foreground" />
                  Enlace de Google Maps
                </Label>
                <Input
                  id="google_maps"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={form.url_google_maps}
                  onChange={(e) => updateField('url_google_maps', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Busca tu negocio en Google Maps, haz clic en "Compartir" y pega el enlace aqui
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {existingId ? 'Guardar cambios' : 'Crear negocio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
