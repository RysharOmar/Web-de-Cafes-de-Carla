import type { ReactNode } from 'react';
import { Banknote, X } from 'lucide-react';
import Modal from '@/components/ui/modal';

export type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  hint?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
};

/** Modal de confirmación con acciones Cancelar / Confirmar. */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  hint,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  icon,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="confirm-modal-title" showCloseButton={false}>
      <div className="flex items-start gap-4 pr-2">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6ecd2] text-[#8a6517]">
          {icon ?? <Banknote size={22} strokeWidth={1.8} aria-hidden="true" />}
        </span>
        <div>
          <h2 id="confirm-modal-title" className="serif text-[24px] font-normal leading-tight text-[#4a3322]">
            {title}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[#604b36]">{message}</p>
          {hint && <p className="mt-2 text-[12px] leading-relaxed text-[#9a8b75]">{hint}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          data-modal-autofocus
          onClick={onClose}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#c6b8a3] bg-white px-5 text-[13px] font-semibold text-[#604b36] transition-colors hover:border-[#4a3020] hover:bg-[#f3eee4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#83965a]"
        >
          <X size={15} aria-hidden="true" />
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#6b7d4c] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#55663b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#83965a] focus-visible:ring-offset-2"
        >
          <Banknote size={15} aria-hidden="true" />
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
