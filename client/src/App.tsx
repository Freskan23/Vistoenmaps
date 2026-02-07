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
import { AuthProvider } from "./context/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/dashboard/mi-negocio" component={MiNegocioPage} />
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
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
