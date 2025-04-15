
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const MovieErrorState = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Film nicht gefunden</AlertTitle>
        <AlertDescription>
          Der angeforderte Film konnte nicht gefunden werden. Bitte versuchen Sie es später erneut.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MovieErrorState;
