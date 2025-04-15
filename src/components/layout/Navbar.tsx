import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { List, Play, Gift, User, Bookmark, LogOut, Sparkles, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  let navigate = undefined;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.error("Navigation context not available:", error);
    navigate = (path: string) => {
      window.location.href = path;
    };
  }

  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      description: "Erfolgreich abgemeldet"
    });
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const NavLink = ({ to, className, children }: { to: string, className?: string, children: React.ReactNode }) => {
    try {
      return <Link to={to} className={className}>{children}</Link>;
    } catch (error) {
      return <a href={to} className={className}>{children}</a>;
    }
  };

  return (
    <nav className="bg-gray-900 sticky top-0 z-50">
      <div className="container-custom flex items-center justify-between py-4">
        <NavLink to="/" className="flex items-center text-xl font-semibold text-white">
          <img 
            src="/lovable-uploads/26151e5a-66d8-4a56-ad10-e034335711e1.png" 
            alt="MovieFlair Logo" 
            className="h-8 mr-2"
          />
        </NavLink>

        <div className="flex items-center space-x-6">
          <NavLink to="/entdecken" className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Compass className="w-5 h-5" />
            <span>Entdecken</span>
          </NavLink>

          <NavLink to="/neue-trailer" className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Play className="w-5 h-5" />
            <span>Neue Trailer</span>
          </NavLink>

          <NavLink to="/kostenlose-filme" className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Gift className="w-5 h-5" />
            <span>Kostenlos</span>
          </NavLink>

          <NavLink to="/quick-tipp">
            <Button variant="destructive" className="hidden md:flex items-center">
              <Sparkles className="w-5 h-5 mr-1" />
              <span>Quick Tipp</span>
            </Button>
          </NavLink>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-4 text-white">
                  <Avatar className="h-8 w-8 bg-theme-accent-red">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profil')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/merkliste')}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Merkliste</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/auth')} className="text-white">
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
