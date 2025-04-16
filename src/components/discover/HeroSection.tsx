
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';
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
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-red/90 to-primary/50 mix-blend-multiply"></div>
      
      <div className="relative z-10 container-custom py-20 md:py-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-400" />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Entdecke neue Filme</h1>
          </div>
          
          <motion.p 
            className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Finde deine nächsten Lieblingsfilme und entdecke kostenlose Angebote
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative flex">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  type="search"
                  placeholder="Filme oder Genres suchen..."
                  className="pl-12 pr-4 py-6 w-full bg-white text-foreground rounded-l-full text-lg border-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="rounded-r-full bg-red-500 hover:bg-red-600 text-white px-6 py-6 font-medium"
              >
                Suchen
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
