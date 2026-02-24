export function OfflineBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="bg-favorite/10 border-b border-favorite/20 px-4 py-2 text-center text-sm text-favorite font-medium">
      You're offline — showing cached data
    </div>
  );
}
