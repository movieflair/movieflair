
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=reset`,
      });

      if (error) throw error;

      toast({
        title: "E-Mail gesendet",
        description: "Überprüfe deinen Posteingang für weitere Anweisungen.",
      });
    } catch (error: any) {
      toast({
        title: "Fehler beim Zurücksetzen des Passworts",
        description: error.message || "Ein Fehler ist aufgetreten.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email-reset">E-Mail</Label>
          <Input 
            id="email-reset" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Wird gesendet...' : 'Passwort zurücksetzen'}
        </Button>
      </div>
    </form>
  );
};

export default ResetPassword;
