
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { List, User, Sparkles, Play, PlayCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  isLoggedIn: boolean;
}

const Navbar = ({ isLoggedIn }: NavbarProps) => {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow">
      <div className="container-custom flex items-center justify-between py-4">
        <Link to="/" className="flex items-center text-xl font-semibold">
          Movie<span className="text-theme-accent-blue">Flair</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/genres" className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
            <List className="w-5 h-5" />
            <span>Genres</span>
          </Link>

          <Link to="/trailers" className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Play className="w-5 h-5" />
            <span>Neue Trailer</span>
          </Link>

          <Link to="/free-movies" className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Gift className="w-5 h-5" />
            <span>Kostenlos</span>
          </Link>

          {isLoggedIn ? (
            <Link to="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <User className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          ) : null}

          <Link to="/quick-tipp">
            <Button variant="destructive" className="hidden md:flex items-center space-x-2">
              <PlayCircle className="w-5 h-5" />
              <span>Quick Tipps</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
