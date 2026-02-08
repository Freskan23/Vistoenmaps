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
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f2035] to-[#142d45] flex flex-col relative overflow-hidden">
      {/* Ambient light orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <Header />
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <EyeLogo size={64} glow />
            <p className="text-white/90 font-semibold text-lg mt-3 tracking-wide">Visto en Maps</p>
          </div>
        <Card className="bg-white/95 backdrop-blur-sm">
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
