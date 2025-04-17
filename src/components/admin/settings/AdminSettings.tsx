
import { FileEdit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminSettingsProps {
  amazonAffiliateId: string;
  setAmazonAffiliateId: (id: string) => void;
  saveSettings: () => void;
}

const AdminSettings = ({ 
  amazonAffiliateId, 
  setAmazonAffiliateId, 
  saveSettings 
}: AdminSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileEdit className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Einstellungen</h2>
      </div>
      
      <div className="border border-border rounded-md p-6">
        <h3 className="text-lg font-medium mb-4">Amazon Affiliate</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amazonAffiliateId">Amazon Affiliate ID</Label>
            <Input 
              id="amazonAffiliateId" 
              placeholder="dein-20" 
              className="max-w-md mt-1"
              value={amazonAffiliateId}
              onChange={(e) => setAmazonAffiliateId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Deine Amazon Affiliate ID, die für Amazon-Links verwendet wird.
            </p>
          </div>

          <Button onClick={saveSettings}>Einstellungen speichern</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
