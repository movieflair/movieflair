
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { List, Play, PlayCircle, Gift, User, Bookmark, LogOut } from 'lucide-react';
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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

  return (
    <nav className="bg-black">
      <div className="container-custom flex items-center justify-between py-4">
        <Link to="/" className="flex items-center text-xl font-semibold text-white">
          Movie<span className="text-theme-accent-red">Flair</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/genres" className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <List className="w-5 h-5" />
            <span>Genres</span>
          </Link>

          <Link to="/trailers" className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Play className="w-5 h-5" />
            <span>Neue Trailer</span>
          </Link>

          <Link to="/free-movies" className="hidden md:flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Gift className="w-5 h-5" />
            <span>Kostenlos</span>
          </Link>

          <Link to="/quick-tipp">
            <Button variant="destructive" className="hidden md:flex items-center space-x-2">
              <PlayCircle className="w-5 h-5" />
              <span>Quick Tipps</span>
            </Button>
          </Link>

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
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/watchlist')}>
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
