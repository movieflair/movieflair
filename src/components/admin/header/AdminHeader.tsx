
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onLogout: () => void;
}

const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <Button 
        variant="outline"
        onClick={onLogout}
      >
        Logout
      </Button>
    </div>
  );
};

export default AdminHeader;
