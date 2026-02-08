import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CategoriaPage from "./pages/CategoriaPage";
import CiudadPage from "./pages/CiudadPage";
import BarrioPage from "./pages/BarrioPage";
import NegocioPage from "./pages/NegocioPage";
import ContactoPage from "./pages/ContactoPage";
import DirectoriosPage from "./pages/DirectoriosPage";
import DirectorioDetallePage from "./pages/DirectorioDetallePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MiNegocioPage from "./pages/dashboard/MiNegocioPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminNegociosPage from "./pages/admin/AdminNegociosPage";
import AdminUsuariosPage from "./pages/admin/AdminUsuariosPage";
import AdminNotificacionesPage from "./pages/admin/AdminNotificacionesPage";
import AdminConfiguracionPage from "./pages/admin/AdminConfiguracionPage";
import { AuthProvider } from "./context/AuthContext";
import FloatingEye from "./components/FloatingEye";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/mi-negocio" component={MiNegocioPage} />
      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/negocios" component={AdminNegociosPage} />
      <Route path="/admin/usuarios" component={AdminUsuariosPage} />
      <Route path="/admin/notificaciones" component={AdminNotificacionesPage} />
      <Route path="/admin/configuracion" component={AdminConfiguracionPage} />
      <Route path="/contacto" component={ContactoPage} />
      <Route path="/directorios" component={DirectoriosPage} />
      <Route path="/directorios/:slug" component={DirectorioDetallePage} />
      <Route path="/:categoria" component={CategoriaPage} />
      <Route path="/:categoria/:ciudad" component={CiudadPage} />
      <Route path="/:categoria/:ciudad/:barrio" component={BarrioPage} />
      <Route path="/:categoria/:ciudad/:barrio/:negocio" component={NegocioPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <FloatingEye />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
