import { useState, useEffect } from "react";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    const sync = () => setOnline(navigator.onLine);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Android: navigator.connection fires 'change' more reliably than online/offline
    const conn = (navigator as any).connection;
    conn?.addEventListener("change", sync);

    // Re-check when app returns to foreground (covers missed events while backgrounded)
    document.addEventListener("visibilitychange", sync);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      conn?.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return online;
}
