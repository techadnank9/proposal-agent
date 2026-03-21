import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="grid gap-4" aria-label="Analyzing client...">
      <Skeleton className="h-24 rounded-3xl" />
      <Skeleton className="h-40 rounded-3xl" />
      <Skeleton className="h-56 rounded-3xl" />
    </div>
  );
}
