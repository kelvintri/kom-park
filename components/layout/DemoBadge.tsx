export function DemoBadge() {
  const isDemo = process.env.NEXT_PUBLIC_APP_MODE === "demo";

  if (!isDemo) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-amber-500/10 border border-amber-500/50 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">
        Demo Mode
      </div>
    </div>
  );
}
