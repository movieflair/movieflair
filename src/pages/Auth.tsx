
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import EnhancedLayout from '@/components/layout/EnhancedLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Registrierung erfolgreich",
        description: "Du kannst dich jetzt anmelden.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler bei der Registrierung",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Anmeldung erfolgreich",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Fehler bei der Anmeldung",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <EnhancedLayout>
      <div className="container-custom flex justify-center py-12">
        <Card className="w-full max-w-md">
          <Tabs defaultValue="login">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Anmelden</TabsTrigger>
                <TabsTrigger value="register">Registrieren</TabsTrigger>
              </TabsList>
              <CardDescription className="pt-4">
                Melde dich an, um deine Merkliste zu verwalten.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="login">
                <form onSubmit={handleSignIn}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-login">Email</Label>
                      <Input 
                        id="email-login" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password-login">Passwort</Label>
                      <Input 
                        id="password-login" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Wird angemeldet...' : 'Anmelden'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleSignUp}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email-register">Email</Label>
                      <Input 
                        id="email-register" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password-register">Passwort</Label>
                      <Input 
                        id="password-register" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Wird registriert...' : 'Registrieren'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Durch die Anmeldung akzeptierst du unsere Nutzungsbedingungen und Datenschutzrichtlinien.
              </p>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
    </EnhancedLayout>
  );
};

export default Auth;
