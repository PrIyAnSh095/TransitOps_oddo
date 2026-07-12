import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function LoadingSpinner({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <Loader2 
      size={size} 
      className={cn("animate-spin text-[#5d5f5f]", className)} 
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#1F1F1F]",
        className
      )}
    />
  );
}

export function LoadingBuffer({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <LoadingSpinner size={32} className="mb-4 text-white" />
      <p className="text-sm font-mono text-[#8e9192] uppercase tracking-wider">{message}</p>
    </div>
  );
}
