import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditBusinessPage() {
  const { user, token, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>(); // If id is present, it's edit mode
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    email: '',
    web: '',
    categoriaSlug: '',
    ciudadSlug: '',
    barrioSlug: '',
    urlGoogleMaps: '',
    horario: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (isEditMode) {
      // Fetch business details
      const fetchBusiness = async () => {
        try {
          // Ideally we would have a specific endpoint for getting a single business by ID
          // For now, let's reuse the logic or assume we can filter from the list or create a GET /:id endpoint
          // But wait, the public API doesn't have ID lookup easily unless we add it.
          // Let's assume we added GET /api/businesses/:id logic implicity or reuse the list.
          // Actually, I didn't add GET /api/businesses/:id for reading a single one in the backend plan explicitly,
          // but I did add PUT /api/businesses/:id.
          // I should probably check if I can fetch it.
          // Since I haven't implemented GET /api/businesses/:id specifically for fetching details (only PUT/DELETE),
          // I'll assume for this MVP we can implement a quick fetch or just rely on the user filling it out if it's new.
          // Wait, I *need* to fetch it to edit it.
          // I'll add a quick fetch logic here assuming I can get it from the list or I'll just implementing fetching ALL and finding it client side for now as a shortcut,
          // or better, assume I should have implemented GET /api/businesses/:id.
          // Let's try to fetch from the list 'mine' and find it.

          const endpoint = user?.role === 'admin' ? '/api/businesses' : '/api/businesses/mine';
          const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          const business = data.find((b: any) => b.id === parseInt(id!));

          if (business) {
            setFormData({
              nombre: business.nombre,
              slug: business.slug,
              descripcion: business.descripcion || '',
              direccion: business.direccion || '',
              telefono: business.telefono || '',
              email: business.email || '',
              web: business.web || '',
              categoriaSlug: business.categoriaSlug,
              ciudadSlug: business.ciudadSlug,
              barrioSlug: business.barrioSlug,
              urlGoogleMaps: business.urlGoogleMaps || '',
              horario: business.horario || '',
            });
          } else {
            toast.error('Negocio no encontrado');
            setLocation('/dashboard');
          }
        } catch (error) {
          toast.error('Error cargando datos');
        } finally {
          setLoading(false);
        }
      };
      fetchBusiness();
    }
  }, [id, isAuthenticated, token, user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isEditMode ? `/api/businesses/${id}` : '/api/businesses';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al guardar');
      }

      toast.success(isEditMode ? 'Negocio actualizado' : 'Negocio creado');
      setLocation('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Dashboard
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? 'Editar Negocio' : 'Nuevo Negocio'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Negocio *</Label>
                  <Input id="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL amigable) *</Label>
                  <Input id="slug" value={formData.slug} onChange={handleChange} required placeholder="ej: mi-negocio-madrid" />
                  <p className="text-xs text-muted-foreground">Identificador único en la URL.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoriaSlug">Categoría (Slug) *</Label>
                    <Input id="categoriaSlug" value={formData.categoriaSlug} onChange={handleChange} required placeholder="ej: cerrajeros" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudadSlug">Ciudad (Slug) *</Label>
                    <Input id="ciudadSlug" value={formData.ciudadSlug} onChange={handleChange} required placeholder="ej: madrid" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barrioSlug">Barrio (Slug) *</Label>
                    <Input id="barrioSlug" value={formData.barrioSlug} onChange={handleChange} required placeholder="ej: centro" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea id="descripcion" value={formData.descripcion} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input id="direccion" value={formData.direccion} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" value={formData.telefono} onChange={handleChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="web">Web</Label>
                    <Input id="web" value={formData.web} onChange={handleChange} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urlGoogleMaps">URL Google Maps</Label>
                  <Input id="urlGoogleMaps" value={formData.urlGoogleMaps} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario">Horario</Label>
                  <Input id="horario" value={formData.horario} onChange={handleChange} placeholder="L-V: 9:00 - 18:00" />
                </div>

                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar Negocio'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
