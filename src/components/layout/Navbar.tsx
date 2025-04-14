import { Link } from 'react-router-dom';
import { Search, User, Video, PlayCircle, Menu as MenuIcon } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#121621] border-b border-gray-800">
      <div className="container-custom flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/9a009d9a-af92-4fd1-9d0a-89e1e81258ee.png" 
            alt="MovieFlair" 
            className="h-10"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-white/80 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/free-movies" className="text-white/80 hover:text-white transition-colors flex items-center">
            <Video className="w-4 h-4 mr-1" />
            Kostenlos
          </Link>
          <Link to="/trailers" className="text-white/80 hover:text-white transition-colors flex items-center">
            <PlayCircle className="w-4 h-4 mr-1" />
            Neue Trailer
          </Link>
          <Link to="/about" className="text-white/80 hover:text-white transition-colors">
            About
          </Link>
        </nav>

        {/* Search and User Actions */}
        <div className="flex items-center space-x-4">
          <button className="text-white/80 hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link to="/admin" className="text-white/80 hover:text-white transition-colors">
            <User className="w-5 h-5" />
          </Link>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800">
          <div className="container-custom py-4 space-y-4">
            <Link 
              to="/" 
              className="block text-white/80 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/free-movies" 
              className="block text-white/80 hover:text-white transition-colors flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Video className="w-4 h-4 mr-1" />
              Kostenlos
            </Link>
            <Link 
              to="/trailers" 
              className="block text-white/80 hover:text-white transition-colors flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <PlayCircle className="w-4 h-4 mr-1" />
              Neue Trailer
            </Link>
            <Link 
              to="/about" 
              className="block text-white/80 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/admin" 
              className="block text-white/80 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
