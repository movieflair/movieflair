
import { Link } from 'react-router-dom';
import { Menu, Search, Film, User } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-custom flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Film className="w-6 h-6 text-theme-accent-blue" />
          <span className="font-semibold text-lg">ScreenPick</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/discover" className="text-foreground/80 hover:text-foreground transition-colors">
            Discover
          </Link>
          <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
            About
          </Link>
        </nav>

        {/* Search and User Actions */}
        <div className="flex items-center space-x-4">
          <button className="text-foreground/80 hover:text-foreground transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/admin" className="text-foreground/80 hover:text-foreground transition-colors">
            <User className="w-5 h-5" />
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground/80 hover:text-foreground transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="container-custom py-4 space-y-4">
            <Link 
              to="/" 
              className="block text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/discover" 
              className="block text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Discover
            </Link>
            <Link 
              to="/about" 
              className="block text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
