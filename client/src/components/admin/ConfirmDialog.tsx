import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  busy?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Keyboard-accessible confirmation for destructive database operations. */
export function ConfirmDialog({
  title,
  description,
  busy = false,
  error,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeys(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [busy, onCancel]);

  return (
    <div className="admin-modal-backdrop">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-description"
        className="admin-modal"
      >
        <button
          type="button"
          className="admin-modal__close"
          aria-label="Cancel deletion"
          onClick={onCancel}
          disabled={busy}
        >
          <X size={19} aria-hidden="true" />
        </button>
        <div className="admin-modal__icon"><AlertTriangle size={25} aria-hidden="true" /></div>
        <h2 id="admin-confirm-title">{title}</h2>
        <p id="admin-confirm-description">{description}</p>
        {error && <div className="admin-alert admin-alert--error" role="alert">{error}</div>}
        <div className="admin-modal__actions">
          <button type="button" ref={cancelRef} onClick={onCancel} disabled={busy} className="admin-btn admin-btn--outline">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="admin-btn admin-btn--danger">
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
