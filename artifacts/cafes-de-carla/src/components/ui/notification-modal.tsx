import { AlertCircle, BellRing, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/ui/modal';
import { useLanguage } from '@/context/LanguageContext';

export type NotificationVariant = 'success' | 'error' | 'info';

export type NotificationModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  variant?: NotificationVariant;
  autoCloseMs?: number;
};

const variantStyles: Record<NotificationVariant, { icon: typeof CheckCircle2; iconClass: string; accent: string }> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-[#eef3e4] text-[#4f6b31]',
    accent: 'bg-[#6b7d4c]',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'bg-[#fde8e6] text-[#a33227]',
    accent: 'bg-[#c0392b]',
  },
  info: {
    icon: BellRing,
    iconClass: 'bg-[#f6ecd2] text-[#8a6517]',
    accent: 'bg-[#b9a06a]',
  },
};

/** Modal de notificación con icono y cierre automático. */
export default function NotificationModal({
  open,
  onClose,
  title,
  message,
  variant = 'success',
  autoCloseMs = 3500,
}: NotificationModalProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;
  const { t } = useLanguage();

  return (
    <Modal
      open={open}
      onClose={onClose}
      autoCloseMs={autoCloseMs}
      autoCloseKey={`${title}|${message ?? ''}`}
      labelledBy="notification-modal-title"
    >
      <div className="flex flex-col items-center px-2 pb-1 pt-3 text-center">
        <span className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${style.iconClass}`}>
          <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <h2 id="notification-modal-title" className="serif text-[26px] font-normal leading-tight text-[#4a3322]">
          {title}
        </h2>
        {message && (
          <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-[#7c6f5e]">
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-full border border-[#d8ccb7] px-5 py-2 text-[12px] font-semibold text-[#4a3322] transition-colors hover:bg-[#f5efe2] focus-ring"
        >
          {t('Entendido')}
        </button>
      </div>
      <div className="mt-7 h-1 overflow-hidden rounded-full bg-[#efe7d9]">
        <span
          className={`modal-progress block h-full w-full origin-left rounded-full ${style.accent}`}
          style={{ animationDuration: `${autoCloseMs}ms` }}
        />
      </div>
    </Modal>
  );
}
