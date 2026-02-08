import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Save, Loader2, ArrowLeft, CheckCircle2, Sparkles, Map,
  ArrowRight, Image, Play, Briefcase, Package, Users,
  Quote, Newspaper, Award, X, Plus
} from 'lucide-react';
import { categorias } from '@/data';
import { directorios } from '@/data/directorios';
import { COMUNIDADES_AUTONOMAS, PROVINCIAS, getProvinciasByComunidad } from '@/data/provincias';

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
  comunidad: string;
  provincia: string;
  ciudad: string;
  barrio: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  url_google_maps: string;
  horario: string;
  // New fields
  redes_sociales: { instagram: string; facebook: string; twitter: string; youtube: string; linkedin: string; tiktok: string; };
  fotos: string[];
  youtube_videos: string[];
  servicios_detallados: { nombre: string; descripcion: string; precio: string; }[];
  productos: { nombre: string; descripcion: string; precio: string; imagen: string; }[];
  resenas_clientes: { nombre: string; texto: string; valoracion: number; servicio: string; fecha: string; }[];
  resenas_empleados: { nombre: string; cargo: string; texto: string; valoracion: number; fecha: string; }[];
  citaciones: string[];
  menciones_medios: { medio: string; titulo: string; url: string; fecha: string; }[];
  valor_anadido: string[];
  anos_experiencia: number | '';
  certificaciones: string[];
}

const emptyForm: NegocioForm = {
  nombre: '',
  descripcion: '',
  categoria_slug: '',
  comunidad: '',
  provincia: '',
  ciudad: '',
  barrio: '',
  direccion: '',
  telefono: '',
  email: '',
  web: '',
  url_google_maps: '',
  horario: '',
  redes_sociales: { instagram: '', facebook: '', twitter: '', youtube: '', linkedin: '', tiktok: '' },
  fotos: ['', '', ''],
  youtube_videos: [''],
  servicios_detallados: [],
  productos: [],
  resenas_clientes: [],
  resenas_empleados: [],
  citaciones: [],
  menciones_medios: [],
  valor_anadido: [],
  anos_experiencia: '',
  certificaciones: [],
};

// Top 30 directorios by popularidad for the citaciones section
const topDirectorios = [...directorios]
  .sort((a, b) => b.popularidad - a.popularidad)
  .slice(0, 30);

const VALOR_ANADIDO_SUGERENCIAS = [
  'Garantia 2 anos',
  'Presupuesto sin compromiso',
  'Servicio 24h',
  'Atencion personalizada',
];

export default function MiNegocioPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();
  const [form, setForm] = useState<NegocioForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingId, setExistingId] = useState<string | null>(null);

  // Inputs temporales para tags
  const [valorAnadidoInput, setValorAnadidoInput] = useState('');
  const [certificacionInput, setCertificacionInput] = useState('');

  // Provincias filtradas por comunidad
  const provinciasFiltradas = useMemo(
    () => form.comunidad ? getProvinciasByComunidad(form.comunidad) : [],
    [form.comunidad]
  );

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
        // Inferir comunidad desde provincia
        const prov = PROVINCIAS.find(p => p.slug === data.provincia);
        setForm({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          categoria_slug: data.categoria_slug || '',
          comunidad: prov?.comunidad || data.comunidad || '',
          provincia: data.provincia || '',
          ciudad: data.ciudad_nombre || data.ciudad_slug || '',
          barrio: data.barrio_nombre || data.barrio_slug || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          web: data.web || '',
          url_google_maps: data.url_google_maps || '',
          horario: data.horario || '',
          redes_sociales: data.redes_sociales || { instagram: '', facebook: '', twitter: '', youtube: '', linkedin: '', tiktok: '' },
          fotos: data.fotos?.length ? data.fotos : ['', '', ''],
          youtube_videos: data.youtube_videos?.length ? data.youtube_videos : [''],
          servicios_detallados: data.servicios_detallados || [],
          productos: data.productos || [],
          resenas_clientes: data.resenas_clientes || [],
          resenas_empleados: data.resenas_empleados || [],
          citaciones: data.citaciones || [],
          menciones_medios: data.menciones_medios || [],
          valor_anadido: data.valor_anadido || [],
          anos_experiencia: data.anos_experiencia ?? '',
          certificaciones: data.certificaciones || [],
        });
      } else {
        // Pre-fill from profile
        setForm(prev => ({
          ...prev,
          nombre: user.nombre_negocio || '',
          categoria_slug: user.categoria_negocio || '',
          ciudad: user.ciudad || '',
          email: user.email || '',
        }));
      }
      setLoading(false);
    };

    loadNegocio();
  }, [user, isAuthenticated]);

  const updateField = (field: keyof NegocioForm, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Reset cascading fields
      if (field === 'comunidad') {
        updated.provincia = '';
        updated.ciudad = '';
        updated.barrio = '';
      }
      if (field === 'provincia') {
        updated.ciudad = '';
        updated.barrio = '';
      }
      return updated;
    });
  };

  // -- Helpers for redes_sociales --
  const updateRedSocial = (red: keyof NegocioForm['redes_sociales'], value: string) => {
    setForm(prev => ({
      ...prev,
      redes_sociales: { ...prev.redes_sociales, [red]: value },
    }));
  };

  // -- Helpers for fotos --
  const updateFoto = (index: number, value: string) => {
    setForm(prev => {
      const fotos = [...prev.fotos];
      fotos[index] = value;
      return { ...prev, fotos };
    });
  };
  const addFoto = () => {
    setForm(prev => ({ ...prev, fotos: [...prev.fotos, ''] }));
  };

  // -- Helpers for youtube_videos --
  const updateVideo = (index: number, value: string) => {
    setForm(prev => {
      const youtube_videos = [...prev.youtube_videos];
      youtube_videos[index] = value;
      return { ...prev, youtube_videos };
    });
  };
  const addVideo = () => {
    setForm(prev => ({ ...prev, youtube_videos: [...prev.youtube_videos, ''] }));
  };

  // -- Helpers for servicios_detallados --
  const updateServicio = (index: number, field: keyof NegocioForm['servicios_detallados'][0], value: string) => {
    setForm(prev => {
      const servicios_detallados = [...prev.servicios_detallados];
      servicios_detallados[index] = { ...servicios_detallados[index], [field]: value };
      return { ...prev, servicios_detallados };
    });
  };
  const addServicio = () => {
    setForm(prev => ({
      ...prev,
      servicios_detallados: [...prev.servicios_detallados, { nombre: '', descripcion: '', precio: '' }],
    }));
  };
  const removeServicio = (index: number) => {
    setForm(prev => ({
      ...prev,
      servicios_detallados: prev.servicios_detallados.filter((_, i) => i !== index),
    }));
  };

  // -- Helpers for productos --
  const updateProducto = (index: number, field: keyof NegocioForm['productos'][0], value: string) => {
    setForm(prev => {
      const productos = [...prev.productos];
      productos[index] = { ...productos[index], [field]: value };
      return { ...prev, productos };
    });
  };
  const addProducto = () => {
    setForm(prev => ({
      ...prev,
      productos: [...prev.productos, { nombre: '', descripcion: '', precio: '', imagen: '' }],
    }));
  };
  const removeProducto = (index: number) => {
    setForm(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }));
  };

  // -- Helpers for resenas_clientes --
  const updateResenaCliente = (index: number, field: keyof NegocioForm['resenas_clientes'][0], value: string | number) => {
    setForm(prev => {
      const resenas_clientes = [...prev.resenas_clientes];
      resenas_clientes[index] = { ...resenas_clientes[index], [field]: value };
      return { ...prev, resenas_clientes };
    });
  };
  const addResenaCliente = () => {
    setForm(prev => ({
      ...prev,
      resenas_clientes: [...prev.resenas_clientes, { nombre: '', texto: '', valoracion: 5, servicio: '', fecha: '' }],
    }));
  };
  const removeResenaCliente = (index: number) => {
    setForm(prev => ({
      ...prev,
      resenas_clientes: prev.resenas_clientes.filter((_, i) => i !== index),
    }));
  };

  // -- Helpers for resenas_empleados --
  const updateResenaEmpleado = (index: number, field: keyof NegocioForm['resenas_empleados'][0], value: string | number) => {
    setForm(prev => {
      const resenas_empleados = [...prev.resenas_empleados];
      resenas_empleados[index] = { ...resenas_empleados[index], [field]: value };
      return { ...prev, resenas_empleados };
    });
  };
  const addResenaEmpleado = () => {
    setForm(prev => ({
      ...prev,
      resenas_empleados: [...prev.resenas_empleados, { nombre: '', cargo: '', texto: '', valoracion: 5, fecha: '' }],
    }));
  };
  const removeResenaEmpleado = (index: number) => {
    setForm(prev => ({
      ...prev,
      resenas_empleados: prev.resenas_empleados.filter((_, i) => i !== index),
    }));
  };

  // -- Helpers for citaciones --
  const toggleCitacion = (slug: string) => {
    setForm(prev => {
      const citaciones = prev.citaciones.includes(slug)
        ? prev.citaciones.filter(s => s !== slug)
        : [...prev.citaciones, slug];
      return { ...prev, citaciones };
    });
  };

  // -- Helpers for menciones_medios --
  const updateMencion = (index: number, field: keyof NegocioForm['menciones_medios'][0], value: string) => {
    setForm(prev => {
      const menciones_medios = [...prev.menciones_medios];
      menciones_medios[index] = { ...menciones_medios[index], [field]: value };
      return { ...prev, menciones_medios };
    });
  };
  const addMencion = () => {
    setForm(prev => ({
      ...prev,
      menciones_medios: [...prev.menciones_medios, { medio: '', titulo: '', url: '', fecha: '' }],
    }));
  };
  const removeMencion = (index: number) => {
    setForm(prev => ({
      ...prev,
      menciones_medios: prev.menciones_medios.filter((_, i) => i !== index),
    }));
  };

  // -- Helpers for valor_anadido tags --
  const addValorAnadido = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || form.valor_anadido.includes(trimmed)) return;
    setForm(prev => ({ ...prev, valor_anadido: [...prev.valor_anadido, trimmed] }));
    setValorAnadidoInput('');
  };
  const removeValorAnadido = (tag: string) => {
    setForm(prev => ({ ...prev, valor_anadido: prev.valor_anadido.filter(t => t !== tag) }));
  };

  // -- Helpers for certificaciones tags --
  const addCertificacion = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || form.certificaciones.includes(trimmed)) return;
    setForm(prev => ({ ...prev, certificaciones: [...prev.certificaciones, trimmed] }));
    setCertificacionInput('');
  };
  const removeCertificacion = (tag: string) => {
    setForm(prev => ({ ...prev, certificaciones: prev.certificaciones.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;
    if (!form.nombre || !form.categoria_slug || !form.provincia || !form.ciudad) {
      toast.error('Nombre, categoria, provincia y ciudad son obligatorios');
      return;
    }

    setSaving(true);

    const slug = slugify(form.nombre) + '-' + slugify(form.ciudad);

    // Filter out empty entries before saving
    const fotosClean = form.fotos.filter(f => f.trim() !== '');
    const videosClean = form.youtube_videos.filter(v => v.trim() !== '');
    const serviciosClean = form.servicios_detallados.filter(s => s.nombre.trim() !== '');
    const productosClean = form.productos.filter(p => p.nombre.trim() !== '');
    const resenasClientesClean = form.resenas_clientes.filter(r => r.nombre.trim() !== '' || r.texto.trim() !== '');
    const resenasEmpleadosClean = form.resenas_empleados.filter(r => r.nombre.trim() !== '' || r.texto.trim() !== '');
    const mencionesClean = form.menciones_medios.filter(m => m.medio.trim() !== '' || m.titulo.trim() !== '');
    const valorAnadidoClean = form.valor_anadido.filter(v => v.trim() !== '');
    const certificacionesClean = form.certificaciones.filter(c => c.trim() !== '');

    const negocioData = {
      nombre: form.nombre,
      slug,
      descripcion: form.descripcion || null,
      categoria_slug: form.categoria_slug,
      ciudad_slug: slugify(form.ciudad),
      barrio_slug: form.barrio ? slugify(form.barrio) : null,
      provincia: form.provincia,
      comunidad: form.comunidad,
      ciudad_nombre: form.ciudad,
      barrio_nombre: form.barrio || null,
      direccion: form.direccion || null,
      telefono: form.telefono || null,
      email: form.email || null,
      web: form.web || null,
      url_google_maps: form.url_google_maps || null,
      horario: form.horario || null,
      user_id: user.id,
      // New fields
      redes_sociales: form.redes_sociales,
      fotos: fotosClean.length > 0 ? fotosClean : null,
      youtube_videos: videosClean.length > 0 ? videosClean : null,
      servicios_detallados: serviciosClean.length > 0 ? serviciosClean : null,
      productos: productosClean.length > 0 ? productosClean : null,
      resenas_clientes: resenasClientesClean.length > 0 ? resenasClientesClean : null,
      resenas_empleados: resenasEmpleadosClean.length > 0 ? resenasEmpleadosClean : null,
      citaciones: form.citaciones.length > 0 ? form.citaciones : null,
      menciones_medios: mencionesClean.length > 0 ? mencionesClean : null,
      valor_anadido: valorAnadidoClean.length > 0 ? valorAnadidoClean : null,
      anos_experiencia: form.anos_experiencia !== '' ? Number(form.anos_experiencia) : null,
      certificaciones: certificacionesClean.length > 0 ? certificacionesClean : null,
    };

    let error;
    const isNew = !existingId;

    if (existingId) {
      const result = await supabase
        .from('negocios')
        .update(negocioData)
        .eq('id', existingId);
      error = result.error;
    } else {
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

    // Notificar al admin por email cuando se crea un negocio nuevo
    if (isNew) {
      try {
        await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: form.nombre,
            categoria: form.categoria_slug,
            ciudad: form.ciudad,
            provincia: form.provincia,
            email: form.email,
            telefono: form.telefono,
            user_id: user.id,
          }),
        });
      } catch {
        // No bloquear si falla el email
        console.warn('No se pudo enviar notificacion al admin');
      }
    }

    toast.success(isNew ? 'Negocio creado — pendiente de aprobacion por el equipo de Visto en Maps' : 'Negocio actualizado');
    // Redirect to dashboard after save
    setLocation('/dashboard');
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
            </CardContent>
          </Card>

          {/* Ubicacion */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Ubicacion
              </CardTitle>
              <CardDescription>Donde se encuentra tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Comunidad Autonoma *</Label>
                  <Select value={form.comunidad} onValueChange={(v) => updateField('comunidad', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona comunidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMUNIDADES_AUTONOMAS.map((ca) => (
                        <SelectItem key={ca} value={ca}>
                          {ca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Provincia *</Label>
                  <Select
                    value={form.provincia}
                    onValueChange={(v) => updateField('provincia', v)}
                    disabled={!form.comunidad}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={form.comunidad ? 'Selecciona provincia' : 'Primero selecciona comunidad'} />
                    </SelectTrigger>
                    <SelectContent>
                      {provinciasFiltradas.map((p) => (
                        <SelectItem key={p.slug} value={p.slug}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad / Municipio *</Label>
                  <Input
                    id="ciudad"
                    placeholder="Ej: Alcobendas, Getafe, Madrid..."
                    value={form.ciudad}
                    onChange={(e) => updateField('ciudad', e.target.value)}
                    required
                    disabled={!form.provincia}
                  />
                  <p className="text-xs text-muted-foreground">
                    Escribe el nombre de tu ciudad o municipio
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barrio">Barrio / Zona</Label>
                  <Input
                    id="barrio"
                    placeholder="Ej: Chamberi, Centro, Casco Antiguo..."
                    value={form.barrio}
                    onChange={(e) => updateField('barrio', e.target.value)}
                    disabled={!form.ciudad}
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional — ayuda a tus clientes a encontrarte
                  </p>
                </div>
              </div>

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
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contacto
              </CardTitle>
              <CardDescription>Como pueden contactarte tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

          {/* ============================================= */}
          {/* NEW SECTIONS START HERE                       */}
          {/* ============================================= */}

          {/* 1. Redes Sociales */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Redes Sociales
              </CardTitle>
              <CardDescription>Perfiles de tu negocio en redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rs_instagram">Instagram</Label>
                  <Input
                    id="rs_instagram"
                    placeholder="@tunegocio"
                    value={form.redes_sociales.instagram}
                    onChange={(e) => updateRedSocial('instagram', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rs_facebook">Facebook</Label>
                  <Input
                    id="rs_facebook"
                    placeholder="URL completa o nombre de pagina"
                    value={form.redes_sociales.facebook}
                    onChange={(e) => updateRedSocial('facebook', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rs_twitter">Twitter / X</Label>
                  <Input
                    id="rs_twitter"
                    placeholder="@tunegocio"
                    value={form.redes_sociales.twitter}
                    onChange={(e) => updateRedSocial('twitter', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rs_youtube">YouTube</Label>
                  <Input
                    id="rs_youtube"
                    placeholder="URL completa del canal"
                    value={form.redes_sociales.youtube}
                    onChange={(e) => updateRedSocial('youtube', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rs_linkedin">LinkedIn</Label>
                  <Input
                    id="rs_linkedin"
                    placeholder="URL completa del perfil"
                    value={form.redes_sociales.linkedin}
                    onChange={(e) => updateRedSocial('linkedin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rs_tiktok">TikTok</Label>
                  <Input
                    id="rs_tiktok"
                    placeholder="@tunegocio"
                    value={form.redes_sociales.tiktok}
                    onChange={(e) => updateRedSocial('tiktok', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Fotos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                Fotos
              </CardTitle>
              <CardDescription>Pega las URLs de las fotos de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.fotos.map((foto, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`foto-${index}`}>Foto {index + 1}</Label>
                  <Input
                    id={`foto-${index}`}
                    type="url"
                    placeholder="https://..."
                    value={foto}
                    onChange={(e) => updateFoto(index, e.target.value)}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addFoto}>
                <Plus className="w-4 h-4" />
                Anadir otra foto
              </Button>
            </CardContent>
          </Card>

          {/* 3. Videos YouTube */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Videos YouTube
              </CardTitle>
              <CardDescription>Anade videos de YouTube de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.youtube_videos.map((video, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`video-${index}`}>Video {index + 1}</Label>
                  <Input
                    id={`video-${index}`}
                    placeholder="ID del video o URL de YouTube"
                    value={video}
                    onChange={(e) => updateVideo(index, e.target.value)}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addVideo}>
                <Plus className="w-4 h-4" />
                Anadir otro video
              </Button>
            </CardContent>
          </Card>

          {/* 4. Servicios detallados */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Servicios detallados
              </CardTitle>
              <CardDescription>Lista los servicios que ofrece tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.servicios_detallados.map((servicio, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeServicio(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="space-y-2">
                    <Label>Nombre del servicio *</Label>
                    <Input
                      placeholder="Ej: Apertura de puertas"
                      value={servicio.nombre}
                      onChange={(e) => updateServicio(index, 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Descripcion</Label>
                      <Input
                        placeholder="Breve descripcion del servicio"
                        value={servicio.descripcion}
                        onChange={(e) => updateServicio(index, 'descripcion', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio</Label>
                      <Input
                        placeholder="Ej: Desde 50 EUR"
                        value={servicio.precio}
                        onChange={(e) => updateServicio(index, 'precio', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addServicio}>
                <Plus className="w-4 h-4" />
                Anadir servicio
              </Button>
            </CardContent>
          </Card>

          {/* 5. Productos */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Productos
              </CardTitle>
              <CardDescription>Lista los productos que ofrece tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.productos.map((producto, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeProducto(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="space-y-2">
                    <Label>Nombre del producto *</Label>
                    <Input
                      placeholder="Ej: Cerradura de seguridad"
                      value={producto.nombre}
                      onChange={(e) => updateProducto(index, 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Descripcion</Label>
                      <Input
                        placeholder="Breve descripcion del producto"
                        value={producto.descripcion}
                        onChange={(e) => updateProducto(index, 'descripcion', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio</Label>
                      <Input
                        placeholder="Ej: 120 EUR"
                        value={producto.precio}
                        onChange={(e) => updateProducto(index, 'precio', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Imagen (URL)</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={producto.imagen}
                      onChange={(e) => updateProducto(index, 'imagen', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addProducto}>
                <Plus className="w-4 h-4" />
                Anadir producto
              </Button>
            </CardContent>
          </Card>

          {/* 6. Resenas de clientes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Resenas de clientes
              </CardTitle>
              <CardDescription>Anade resenas reales de tus clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.resenas_clientes.map((resena, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeResenaCliente(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre del cliente</Label>
                      <Input
                        placeholder="Nombre del cliente"
                        value={resena.nombre}
                        onChange={(e) => updateResenaCliente(index, 'nombre', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valoracion</Label>
                      <Select
                        value={String(resena.valoracion)}
                        onValueChange={(v) => updateResenaCliente(index, 'valoracion', Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valoracion" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map(v => (
                            <SelectItem key={v} value={String(v)}>
                              {'★'.repeat(v)}{'☆'.repeat(5 - v)} ({v})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Texto de la resena</Label>
                    <Textarea
                      placeholder="Que dijo el cliente sobre tu negocio..."
                      value={resena.texto}
                      onChange={(e) => updateResenaCliente(index, 'texto', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Servicio</Label>
                      <Input
                        placeholder="Servicio contratado"
                        value={resena.servicio}
                        onChange={(e) => updateResenaCliente(index, 'servicio', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={resena.fecha}
                        onChange={(e) => updateResenaCliente(index, 'fecha', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addResenaCliente}>
                <Plus className="w-4 h-4" />
                Anadir resena de cliente
              </Button>
            </CardContent>
          </Card>

          {/* 7. Resenas del equipo */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Quote className="w-5 h-5 text-primary" />
                Resenas del equipo
              </CardTitle>
              <CardDescription>Testimonios de miembros de tu equipo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.resenas_empleados.map((resena, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeResenaEmpleado(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        placeholder="Nombre del empleado"
                        value={resena.nombre}
                        onChange={(e) => updateResenaEmpleado(index, 'nombre', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo</Label>
                      <Input
                        placeholder="Ej: Tecnico senior"
                        value={resena.cargo}
                        onChange={(e) => updateResenaEmpleado(index, 'cargo', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Texto</Label>
                    <Textarea
                      placeholder="Testimonio del empleado..."
                      value={resena.texto}
                      onChange={(e) => updateResenaEmpleado(index, 'texto', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valoracion</Label>
                      <Select
                        value={String(resena.valoracion)}
                        onValueChange={(v) => updateResenaEmpleado(index, 'valoracion', Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valoracion" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map(v => (
                            <SelectItem key={v} value={String(v)}>
                              {'★'.repeat(v)}{'☆'.repeat(5 - v)} ({v})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={resena.fecha}
                        onChange={(e) => updateResenaEmpleado(index, 'fecha', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addResenaEmpleado}>
                <Plus className="w-4 h-4" />
                Anadir resena del equipo
              </Button>
            </CardContent>
          </Card>

          {/* 8. Citaciones */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Citaciones
              </CardTitle>
              <CardDescription>Selecciona los directorios donde tu negocio esta registrado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topDirectorios.map((dir) => (
                  <label
                    key={dir.slug}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.citaciones.includes(dir.slug)}
                      onChange={() => toggleCitacion(dir.slug)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{dir.nombre}</span>
                      <span className="text-xs text-muted-foreground truncate">{dir.dominio}</span>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 9. Menciones en medios */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Menciones en medios
              </CardTitle>
              <CardDescription>Articulos o menciones de tu negocio en medios de comunicacion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.menciones_medios.map((mencion, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => removeMencion(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Medio</Label>
                      <Input
                        placeholder="Ej: El Pais, La Vanguardia..."
                        value={mencion.medio}
                        onChange={(e) => updateMencion(index, 'medio', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Titulo</Label>
                      <Input
                        placeholder="Titulo del articulo"
                        value={mencion.titulo}
                        onChange={(e) => updateMencion(index, 'titulo', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>URL</Label>
                      <Input
                        type="url"
                        placeholder="https://..."
                        value={mencion.url}
                        onChange={(e) => updateMencion(index, 'url', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={mencion.fecha}
                        onChange={(e) => updateMencion(index, 'fecha', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addMencion}>
                <Plus className="w-4 h-4" />
                Anadir mencion
              </Button>
            </CardContent>
          </Card>

          {/* 10. Valor anadido */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Valor anadido
              </CardTitle>
              <CardDescription>Destaca lo que hace especial a tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {form.valor_anadido.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeValorAnadido(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Escribe una ventaja y pulsa Enter o Anadir"
                  value={valorAnadidoInput}
                  onChange={(e) => setValorAnadidoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addValorAnadido(valorAnadidoInput);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addValorAnadido(valorAnadidoInput)}
                >
                  Anadir
                </Button>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Sugerencias:</p>
                <div className="flex flex-wrap gap-2">
                  {VALOR_ANADIDO_SUGERENCIAS.filter(s => !form.valor_anadido.includes(s)).map((sug) => (
                    <Button
                      key={sug}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => addValorAnadido(sug)}
                    >
                      + {sug}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 11. Experiencia y certificaciones */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Experiencia y certificaciones
              </CardTitle>
              <CardDescription>Acredita la experiencia y formacion de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="anos_experiencia">Anos de experiencia</Label>
                <Input
                  id="anos_experiencia"
                  type="number"
                  min={0}
                  placeholder="Ej: 15"
                  value={form.anos_experiencia}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    anos_experiencia: e.target.value === '' ? '' : Number(e.target.value),
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Certificaciones</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.certificaciones.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-1 pr-1">
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertificacion(cert)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: ISO 9001, Certificado SAT oficial..."
                    value={certificacionInput}
                    onChange={(e) => setCertificacionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCertificacion(certificacionInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCertificacion(certificacionInput)}
                  >
                    Anadir
                  </Button>
                </div>
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
