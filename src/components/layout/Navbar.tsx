
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { List, Play, Gift, User, Bookmark, LogOut, Sparkles, Compass, X } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navigateTo = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-theme-black sticky top-0 z-50">
      <div className="container-custom flex items-center justify-between py-4 pl-4 pr-4 md:pl-8 md:pr-8">
        <Link to="/" className="flex items-center text-xl font-semibold text-white z-10">
          <img 
            src="/lovable-uploads/26151e5a-66d8-4a56-ad10-e034335711e1.png" 
            alt="MovieFlair Logo" 
            className="h-8 md:h-12 w-auto mr-2" 
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/entdecken" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Compass className="w-5 h-5" />
            <span>Entdecken</span>
          </Link>

          <Link to="/neue-trailer" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Play className="w-5 h-5" />
            <span>Neue Trailer</span>
          </Link>

          <Link to="/kostenlose-filme" className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
            <Gift className="w-5 h-5" />
            <span>Kostenlos</span>
          </Link>

          <Link to="/quick-tipp">
            <Button variant="destructive" className="flex items-center">
              <Sparkles className="w-5 h-5 mr-1" />
              <span>Quick Tipp</span>
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

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white">
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
            <Button variant="ghost" onClick={() => navigate('/auth')} className="text-white p-0 h-8 w-8">
              <User className="h-5 w-5" />
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <List className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-theme-black text-white border-theme-black w-[280px] p-0">
              <div className="flex flex-col h-full py-6 px-4">
                <div className="flex justify-between items-center mb-8">
                  <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                    <img 
                      src="/lovable-uploads/26151e5a-66d8-4a56-ad10-e034335711e1.png" 
                      alt="MovieFlair Logo" 
                      className="h-8 w-auto mr-2" 
                    />
                  </Link>
                  <SheetClose className="rounded-sm opacity-70 text-white transition-opacity hover:opacity-100">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </SheetClose>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="py-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
                      onClick={() => navigateTo('/entdecken')}
                    >
                      <Compass className="mr-2 h-5 w-5" />
                      <span>Entdecken</span>
                    </Button>
                  </div>
                  
                  <div className="py-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
                      onClick={() => navigateTo('/neue-trailer')}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      <span>Neue Trailer</span>
                    </Button>
                  </div>
                  
                  <div className="py-2">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-white hover:text-white hover:bg-gray-800"
                      onClick={() => navigateTo('/kostenlose-filme')}
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      <span>Kostenlos</span>
                    </Button>
                  </div>
                  
                  <div className="py-2">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start"
                      onClick={() => navigateTo('/quick-tipp')}
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      <span>Quick Tipp</span>
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
