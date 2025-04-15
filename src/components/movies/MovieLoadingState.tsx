
import { Skeleton } from "@/components/ui/skeleton";

const MovieLoadingState = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-[400px] bg-gray-100" />
      <div className="container-custom -mt-40 relative z-20">
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="grid md:grid-cols-[300px,1fr] gap-8 p-8">
            <div className="space-y-4">
              <Skeleton className="aspect-[2/3] w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-8">
              <div>
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-6" />
                <div className="flex gap-2 my-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-6 w-20" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieLoadingState;
