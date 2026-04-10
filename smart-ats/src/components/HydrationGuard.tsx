"use client";
import { useEffect, useState } from "react";

export default function HydrationGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-medium tracking-tight">Synchronizing State...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
