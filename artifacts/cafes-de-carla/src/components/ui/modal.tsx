import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const EXIT_DURATION_MS = 220;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Id del elemento que sirve como título accesible del diálogo. */
  labelledBy?: string;
  /** Segundos/milisegundos antes de cerrar automáticamente. 0 = no auto-cierra. */
  autoCloseMs?: number;
  /** Cambia este valor para reiniciar el temporizador sin desmontar el modal. */
  autoCloseKey?: string;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
  className?: string;
};

/**
 * Modal base reutilizable: overlay oscuro, tarjeta central, animación de
 * entrada/salida, cierre por X, overlay o Esc y bloqueo de scroll de fondo.
 */
export default function Modal({
  open,
  onClose,
  children,
  labelledBy,
  autoCloseMs = 0,
  autoCloseKey,
  showCloseButton = true,
  closeOnOverlay = true,
  className = '',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Mantiene el nodo montado mientras termina la animación de salida.
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
      return undefined;
    }

    setClosing(true);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_DURATION_MS);
    return () => window.clearTimeout(timeout);
  }, [open]);

  // Auto-cierre de notificaciones. El key permite reiniciar el temporizador
  // cuando cambia el contenido sin que un re-render lo reinicie por accidente.
  useEffect(() => {
    if (!open || !autoCloseMs) return undefined;
    const timeout = window.setTimeout(() => onCloseRef.current(), autoCloseMs);
    return () => window.clearTimeout(timeout);
  }, [open, autoCloseMs, autoCloseKey]);

  // Esc para cerrar y Tab confinado dentro del diálogo.
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
      event.stopImmediatePropagation();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Foco inicial y bloqueo del scroll de fondo.
  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timeout = window.setTimeout(() => {
      const preferred = dialogRef.current?.querySelector<HTMLElement>('[data-modal-autofocus]');
      (preferred ?? dialogRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-[#261910]/55 p-4 backdrop-blur-[3px] ${
        closing ? 'modal-overlay--out' : 'modal-overlay--in'
      }`}
      data-modal-open="true"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative w-full max-w-md rounded-[22px] border border-[#e8dcc8] bg-[#fffdf8] p-7 shadow-[0_24px_70px_rgba(38,25,16,0.28)] outline-none sm:p-8 ${
          closing ? 'modal-card--out' : 'modal-card--in'
        } ${className}`}
      >
        {showCloseButton && (
          <button
            type="button"
            aria-label="Cerrar"
            data-modal-autofocus
            onClick={() => onCloseRef.current()}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#e6dccb] bg-white/70 text-[#7c6f5e] transition-colors hover:border-[#4a3020] hover:bg-[#4a3020] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#83965a]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
