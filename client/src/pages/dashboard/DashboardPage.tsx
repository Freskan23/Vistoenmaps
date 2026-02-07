import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Edit, Trash2, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

interface Business {
  id: number;
  nombre: string;
  slug: string;
  categoriaSlug: string;
  ciudadSlug: string;
  barrioSlug: string;
}

export default function DashboardPage() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    const fetchBusinesses = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/api/businesses' : '/api/businesses/mine';
        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch businesses');

        const data = await res.json();
        setBusinesses(data);
      } catch (error) {
        console.error(error);
        toast.error('Error cargando los negocios');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [isAuthenticated, token, user, setLocation]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de querer eliminar este negocio?')) return;

    try {
      const res = await fetch(`/api/businesses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete');

      setBusinesses(businesses.filter(b => b.id !== id));
      toast.success('Negocio eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user?.email} ({user?.role === 'admin' ? 'Administrador' : 'Dueño de Negocio'})
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Añadir Negocio
              </Button>
            </Link>
            <Button variant="outline" onClick={logout} className="gap-2">
              <LogOut className="w-4 h-4" /> Salir
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : businesses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No tienes negocios registrados.</p>
              <Link href="/dashboard/new">
                <Button>Crear mi primer negocio</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Card key={business.id}>
                <CardHeader>
                  <CardTitle className="truncate">{business.nombre}</CardTitle>
                  <CardDescription className="truncate">
                    {business.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Categoría: {business.categoriaSlug}</p>
                    <p>Ubicación: {business.ciudadSlug}, {business.barrioSlug}</p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Link href={`/dashboard/edit/${business.id}`}>
                      <Button variant="secondary" size="sm" className="gap-1">
                        <Edit className="w-3 h-3" /> Editar
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleDelete(business.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
