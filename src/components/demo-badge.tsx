export function DemoBadge() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null;
  return <><div aria-hidden="true" className="h-12" /><div className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm">Version de démonstration</div></>;
}
