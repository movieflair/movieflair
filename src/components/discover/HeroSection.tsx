
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/suche?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-10">
      <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-red/90 to-primary/50 mix-blend-multiply"></div>
      
      {searchQuery && (
        <div className="absolute inset-0">
          <div className="w-full h-full bg-black/20" />
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
          <form onSubmit={handleSearch} className="relative flex w-full">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Filme oder Genres suchen..."
                className="pl-12 pr-4 py-6 w-full bg-white text-foreground rounded-l-lg text-lg border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              className="rounded-r-lg bg-red-500 hover:bg-red-600 text-white px-6 py-6 font-medium"
            >
              Suchen
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
