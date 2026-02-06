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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
