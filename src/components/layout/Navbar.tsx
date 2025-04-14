import React from 'react';
import { Link } from 'react-router-dom';
import { Home, List, Search, User } from 'lucide-react';
import SearchBox from '@/components/search/SearchBox';

interface NavbarProps {
  isLoggedIn: boolean;
}

const Navbar = ({ isLoggedIn }: NavbarProps) => {
  return (
    <nav className="bg-white shadow">
      <div className="container-custom flex items-center justify-between py-4">
        <Link to="/" className="flex items-center text-xl font-semibold">
          Movie<span className="text-theme-accent-blue">Flair</span>
        </Link>

        <div className="flex items-center space-x-6">
          <SearchBox variant="navbar" />

          <Link to="/" className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>

          <Link to="/genres" className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
            <List className="w-5 h-5" />
            <span>Genres</span>
          </Link>

          {isLoggedIn ? (
            <Link to="/admin" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <User className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
