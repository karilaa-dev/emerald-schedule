import { useState, useEffect, useRef } from "react";

const LONG_PRESS_MS = 500;

function timeAgo(timestamp: number): { text: string; isRecent: boolean } {
  const secs = Math.floor((Date.now() - timestamp) / 1000);
  if (secs < 60) return { text: `${secs}s ago`, isRecent: true };
  const mins = Math.floor(secs / 60);
  if (mins < 60) return { text: mins === 1 ? "1 min ago" : `${mins} min ago`, isRecent: false };
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return { text: hrs === 1 ? "1 hr ago" : `${hrs} hrs ago`, isRecent: false };
  const days = Math.floor(hrs / 24);
  return { text: days === 1 ? "1 day ago" : `${days} days ago`, isRecent: false };
}

function durationSince(timestamp: number): string {
  const secs = Math.floor((Date.now() - timestamp) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins === 1 ? "1 min" : `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs === 1 ? "1 hr" : `${hrs} hrs`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "1 day" : `${days} days`;
}

export function ScheduleFooter({
  lastChecked,
  serverUpdatedAt,
  deviceUpdatedAt,
  onCheck,
  onForceUpdate,
}: {
  lastChecked: number | null;
  serverUpdatedAt: number | null;
  deviceUpdatedAt: number | null;
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
        (deviceUpdatedAt && now - deviceUpdatedAt < 60_000) ||
        (serverUpdatedAt && now - serverUpdatedAt < 60_000);

      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(
        () => tick((n) => n + 1),
        hasRecent ? 1000 : 60_000,
      );
    };

    update();
    return () => clearInterval(intervalRef.current);
  }, [lastChecked, deviceUpdatedAt, serverUpdatedAt]);

  if (!lastChecked && !deviceUpdatedAt) return null;

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
  const updated = deviceUpdatedAt ? timeAgo(deviceUpdatedAt) : null;

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
      {serverUpdatedAt && <p>No schedule changes for {durationSince(serverUpdatedAt)}</p>}
    </footer>
  );
}
