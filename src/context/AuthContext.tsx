
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Extended User interface with additional properties
interface User extends SupabaseUser {
  name?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (currentSession?.user) {
          // Add the additional properties to the user object
          const enhancedUser: User = {
            ...currentSession.user,
            name: currentSession.user.email?.split('@')[0] || 'User',
            avatarUrl: null,
            isAdmin: currentSession.user.email === 'admin@example.com', // Example admin check
          };
          setUser(enhancedUser);
        } else {
          setUser(null);
        }
        setSession(currentSession);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        // Add the additional properties to the user object
        const enhancedUser: User = {
          ...currentSession.user,
          name: currentSession.user.email?.split('@')[0] || 'User',
          avatarUrl: null,
          isAdmin: currentSession.user.email === 'admin@example.com', // Example admin check
        };
        setUser(enhancedUser);
      } else {
        setUser(null);
      }
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
