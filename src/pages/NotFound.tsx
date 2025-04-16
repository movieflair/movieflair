
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <Seo 
        title="Seite nicht gefunden | MovieFlair"
        description="Die gesuchte Seite existiert nicht. Entdecke stattdessen tausende Filme und Serien auf MovieFlair."
      />
      
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h1 className="text-6xl font-bold text-theme-accent-blue mb-6">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Seite nicht gefunden</h2>
          <p className="text-muted-foreground mb-8">
            Die gesuchte Seite existiert leider nicht. Kehre zur Startseite zurück und entdecke tausende Filme und Serien.
          </p>
          <Button asChild size="lg">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Zur Startseite
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
