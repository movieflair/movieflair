
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminSettingsProvider } from "@/hooks/useAdminSettings";
import Index from "./pages/Index";
import MovieDetails from "./pages/MovieDetails";
import TvShowDetails from "./pages/TvShowDetails";
import AdminPage from "./pages/AdminPage";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import FreeMovies from "./pages/FreeMovies";
import Trailers from "./pages/Trailers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminSettingsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TvShowDetails />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/free-movies" element={<FreeMovies />} />
            <Route path="/trailers" element={<Trailers />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminSettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
