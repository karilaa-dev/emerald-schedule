import { useEffect } from "react";

interface Props {
  onClose: () => void;
}

export function InfoModal({ onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="presentation"
        className="animate-backdrop absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-modal relative w-full max-w-sm mx-4 rounded-2xl bg-surface-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
          <h2 className="font-display text-sm font-700 text-ink">About</h2>
          <button
            className="flex items-center justify-center rounded-full p-2 bg-surface-warm text-ink-faint hover:text-ink transition-colors duration-150"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg font-800 tracking-tight text-ink">ECCC</span>
              <span className="font-display text-lg font-800 tracking-tight text-accent">'26</span>
              <span className="font-display text-lg font-800 tracking-tight text-ink">Schedule</span>
            </div>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">
              An unofficial schedule viewer for Emerald City Comic Con 2026.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2.5 text-ink-muted">
              <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-500">karilaa</span>
            </div>
            <a
              href="https://github.com/karilaa-dev/emerald-schedule"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-ink-muted hover:text-accent transition-colors"
            >
              <svg className="h-4 w-4 text-accent shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span className="font-500">GitHub</span>
            </a>
            <a
              href="https://eccc26.karilaa.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-ink-muted hover:text-accent transition-colors"
            >
              <svg className="h-4 w-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="font-500">eccc26.karilaa.dev</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
