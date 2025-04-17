import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc(
          'has_role',
          { 
            _user_id: user.id,
            _role: 'admin'
          }
        );

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(data === true);
      } catch (err) {
        console.error('Unexpected error checking admin status:', err);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <footer className="bg-secondary mt-auto py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">MovieFlair</h3>
            <p className="text-muted-foreground mb-6">
              Dein persönlicher Filmberater, der dir hilft, den perfekten Film oder die 
              perfekte Serie basierend auf deiner Stimmung und deinen Vorlieben zu finden.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://x.com/movieflairDE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#ff3131] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/movieflair/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#ff3131] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@movieflair_de" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#ff3131] transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/quick-tipp" className="text-muted-foreground hover:text-foreground transition-colors">
                  Quick Tipp
                </Link>
              </li>
              <li>
                <Link to="/ueber-uns" className="text-muted-foreground hover:text-foreground transition-colors">
                  Über uns
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/datenschutz" className="text-muted-foreground hover:text-foreground transition-colors">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <Link to="/nutzungsbedingungen" className="text-muted-foreground hover:text-foreground transition-colors">
                  Nutzungsbedingungen
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MovieFlair. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
