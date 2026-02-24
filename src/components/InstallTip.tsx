interface Props {
  visible: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function InstallTip({ visible, onInstall, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <div className="bg-accent-subtle border-b border-accent/10 px-4 py-2.5">
      <div className="mx-auto max-w-5xl flex items-center justify-between gap-3 text-sm">
        <p className="text-ink-muted">
          <span className="font-medium text-ink">Install this app</span> for
          offline access at the con
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onInstall}
            className="rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Install
          </button>
          <button
            onClick={onDismiss}
            className="rounded-full px-2 py-1 text-xs text-ink-faint hover:text-ink-muted transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
