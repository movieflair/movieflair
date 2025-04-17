
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, User, LogOut, Clapperboard, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
}

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const NavItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Filme', path: '/movies' },
  ];

  return (
    <nav className="bg-background border-b">
      <div className="container-custom py-4 flex items-center justify-between">
        {/* Brand with Logo */}
        <Link to="/" className="flex items-center font-bold text-xl md:text-2xl" onClick={closeMobileMenu}>
          <Clapperboard className="h-8 w-8 mr-2 text-primary" />
          MovieFlair
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {NavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-gray-600 hover:text-primary transition-colors duration-200",
                location.pathname === item.path ? "text-primary font-semibold" : ""
              )}
            >
              {item.label}
            </Link>
          ))}
          
          <Link to="/quick-tipp">
            <Button className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quick Tipp
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-gray-600 hover:text-gray-800 focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        {/* Authentication */}
        <div className="flex items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none focus:outline-none rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-colors">
                  <Avatar>
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name || "Profile"} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "MF"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mr-2">
                <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4 mr-2" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Admin-Bereich</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="text-gray-600 hover:text-primary transition-colors duration-200">
              Anmelden
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-background border-b md:hidden">
          <div className="container-custom py-4 flex flex-col space-y-4">
            {NavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block text-gray-600 hover:text-primary transition-colors duration-200 py-2",
                  location.pathname === item.path ? "text-primary font-semibold" : ""
                )}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            ))}
            
            <Link to="/quick-tipp" onClick={closeMobileMenu}>
              <Button className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white flex items-center gap-2 w-full justify-center">
                <Sparkles className="h-4 w-4" />
                Quick Tipp
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
