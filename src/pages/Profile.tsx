
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <EnhancedLayout>
        <div className="container-custom py-12">
          <div className="text-center">
            <p>Lädt...</p>
          </div>
        </div>
      </EnhancedLayout>
    );
  }

  return (
    <EnhancedLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Mein Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-6">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>
              
              <div>
                <p className="font-semibold">E-Mail:</p>
                <p>{user?.email}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/watchlist')}>
                Meine Merkliste
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </EnhancedLayout>
  );
};

export default Profile;
