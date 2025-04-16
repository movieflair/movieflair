
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const HeroSection = ({ firstMovie }: { firstMovie?: { backdrop_path?: string; title?: string } }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/suche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="container-custom mt-8">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-red/90 to-primary/50 mix-blend-multiply"></div>
        
        {firstMovie?.backdrop_path && (
          <div className="absolute inset-0">
            <img 
              src={`https://image.tmdb.org/t/p/w1280${firstMovie.backdrop_path}`} 
              alt={firstMovie.title || "Film Hintergrund"}
              className="w-full h-full object-cover opacity-20"
            />
          </div>
        )}
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Entdecke neue Filme</h1>
              <p className="text-white/80 max-w-2xl text-lg">
                Finde deine nächsten Lieblingsfilme und entdecke kostenlose Angebote
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-2xl mt-8"
          >
            <form onSubmit={handleSearch} className="relative flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-slate-400 h-5 w-5" />
                </div>
                <input
                  type="search"
                  placeholder="Filme oder Genres suchen..."
                  className="w-full pl-12 pr-20 py-6 bg-white text-foreground rounded-lg text-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-theme-red hover:bg-theme-red/90 text-white px-6 py-3 rounded-full font-medium transition-colors"
                >
                  Suchen
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
