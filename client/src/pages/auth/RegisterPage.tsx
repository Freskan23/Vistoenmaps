import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import Header from '@/components/Header';
import { Building2, MapPin, Tag, Mail, Lock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { categorias, ciudades } from '@/data';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [categoriaNegocio, setCategoriaNegocio] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [_, setLocation] = useLocation();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    setLocation('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await register(email, password, {
      role: 'business',
      nombre_negocio: nombreNegocio,
      categoria_negocio: categoriaNegocio,
      ciudad: ciudad,
    });

    setLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    setSuccess(true);
    toast.success('Cuenta creada. Revisa tu email para confirmar.');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Cuenta creada</h2>
              <p className="text-muted-foreground">
                Hemos enviado un email de confirmacion a <strong>{email}</strong>.
                Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
              </p>
              <Link href="/login">
                <Button className="mt-4">Ir a iniciar sesion</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Value proposition */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Gratis para siempre
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Descubre donde deberia estar tu negocio
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Te mostramos los directorios mas importantes para tu tipo de negocio y ubicacion.
              Mejora tu SEO local en minutos.
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                  <div className={`h-1.5 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                </div>
                <span className="text-xs text-muted-foreground ml-auto">Paso {step} de 2</span>
              </div>
              <CardTitle className="mt-3">
                {step === 1 ? 'Cuentanos sobre tu negocio' : 'Crea tu cuenta'}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? 'Necesitamos estos datos para personalizar tus recomendaciones'
                  : 'Un ultimo paso para acceder a tu informe personalizado'
                }
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {step === 1 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="nombreNegocio" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        Nombre del negocio
                      </Label>
                      <Input
                        id="nombreNegocio"
                        placeholder="Ej: Cerrajeria Martinez"
                        value={nombreNegocio}
                        onChange={(e) => setNombreNegocio(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria" className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        Tipo de negocio
                      </Label>
                      <Select value={categoriaNegocio} onValueChange={setCategoriaNegocio}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu categoria" />
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
                      <Label htmlFor="ciudad" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        Ciudad
                      </Label>
                      <Select value={ciudad} onValueChange={setCiudad}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu ciudad" />
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
                  </>
                ) : (
                  <>
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
                        placeholder="Minimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    {/* Summary of business info */}
                    <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tu negocio</p>
                      <p className="text-sm font-medium">{nombreNegocio}</p>
                      <p className="text-xs text-muted-foreground">
                        {categorias.find(c => c.slug === categoriaNegocio)?.nombre || categoriaNegocio}
                        {' '}&bull;{' '}
                        {ciudades.find(c => c.slug === ciudad)?.nombre || ciudad}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {step === 1 ? (
                  <Button
                    type="button"
                    className="w-full gap-2"
                    onClick={() => {
                      if (!nombreNegocio || !categoriaNegocio || !ciudad) {
                        toast.error('Completa todos los campos');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Continuar <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creando cuenta...' : 'Crear cuenta y ver recomendaciones'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setStep(1)}
                    >
                      Volver atras
                    </Button>
                  </>
                )}
                <div className="text-sm text-center text-muted-foreground">
                  Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Inicia sesion
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
