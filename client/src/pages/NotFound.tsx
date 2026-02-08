import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EyeLogo from "@/components/EyeLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 py-16">
          <div className="flex justify-center mb-6">
            <EyeLogo size={80} />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-3">404</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            La página que buscas no existe o ha sido movida.
            Vuelve al inicio para encontrar lo que necesitas.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
