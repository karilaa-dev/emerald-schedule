import { useState, useEffect } from "react";

interface CurrentTime {
  day: string;
  hour: number;
}

function getNow(): CurrentTime {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return { day: `${y}-${m}-${d}`, hour: now.getHours() };
}

export function useCurrentHour(): CurrentTime {
  const [current, setCurrent] = useState(getNow);

  useEffect(() => {
    function msUntilNextHour(): number {
      const now = new Date();
      const next = new Date(now);
      next.setHours(now.getHours() + 1, 0, 0, 0);
      return next.getTime() - now.getTime();
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      setCurrent(getNow());
      timeoutId = setTimeout(tick, msUntilNextHour() + 100);
    }

    timeoutId = setTimeout(tick, msUntilNextHour() + 100);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setCurrent(getNow());
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return current;
}
