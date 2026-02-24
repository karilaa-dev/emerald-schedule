import { useState, useEffect, useRef } from "react";

const LONG_PRESS_MS = 500;

function timeAgo(timestamp: number): { text: string; isRecent: boolean } {
  const secs = Math.floor((Date.now() - timestamp) / 1000);
  if (secs < 60) return { text: `${secs}s ago`, isRecent: true };
  const mins = Math.floor(secs / 60);
  if (mins === 1) return { text: "1 min ago", isRecent: false };
  return { text: `${mins} min ago`, isRecent: false };
}

export function ScheduleFooter({
  lastChecked,
  lastUpdated,
  onCheck,
  onForceUpdate,
}: {
  lastChecked: number | null;
  lastUpdated: number | null;
  onCheck: () => void;
  onForceUpdate: () => void;
}) {
  const [, tick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const didLongPress = useRef(false);

  // Adaptive tick: 1s when any timestamp is < 60s old, 60s otherwise
  useEffect(() => {
    const update = () => {
      tick((n) => n + 1);

      const now = Date.now();
      const hasRecent =
        (lastChecked && now - lastChecked < 60_000) ||
        (lastUpdated && now - lastUpdated < 60_000);

      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(
        () => tick((n) => n + 1),
        hasRecent ? 1000 : 60_000,
      );
    };

    update();
    return () => clearInterval(intervalRef.current);
  }, [lastChecked, lastUpdated]);

  if (!lastChecked && !lastUpdated) return null;

  const startPress = () => {
    didLongPress.current = false;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      onForceUpdate();
    }, LONG_PRESS_MS);
  };

  const endPress = () => {
    clearTimeout(timerRef.current);
    if (!didLongPress.current) {
      onCheck();
    }
  };

  const checked = lastChecked ? timeAgo(lastChecked) : null;
  const updated = lastUpdated ? timeAgo(lastUpdated) : null;

  return (
    <footer
      className="py-4 text-center text-xs text-ink-faint font-mono space-y-0.5 select-none cursor-pointer active:opacity-60 transition-opacity"
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={() => clearTimeout(timerRef.current)}
      onTouchStart={startPress}
      onTouchEnd={endPress}
    >
      {checked && <p>Checked {checked.text}</p>}
      {updated && <p>Updated {updated.text}</p>}
    </footer>
  );
}
