import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import Header from '@/components/Header';
import EyeLogo from '@/components/EyeLogo';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [_, setLocation] = useLocation();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    setLocation('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await login(email, password);

    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success('Sesion iniciada correctamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <EyeLogo size={64} />
          </div>
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesion</CardTitle>
            <CardDescription>Accede a tu cuenta para ver tus recomendaciones de directorios</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  Contrasena
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Cargando...' : 'Entrar'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                No tienes cuenta?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Registrate gratis
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        </div>
      </div>
    </div>
  );
}
