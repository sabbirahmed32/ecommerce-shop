import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';

const ICONS = {
  success: { Icon: CheckCircle2, className: 'text-emerald-500' },
  error: { Icon: AlertCircle, className: 'text-red-500' },
  info: { Icon: Info, className: 'text-sky-500' },
};

export default function Toasts() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
      {toasts.map((toast) => {
        const { Icon, className } = ICONS[toast.type] || ICONS.info;
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl bg-zinc-900 px-4 py-3 text-white shadow-lift animate-fade-up"
          >
            <Icon size={20} className={`mt-0.5 shrink-0 ${className}`} />
            <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
            <button onClick={() => remove(toast.id)} className="text-zinc-400 transition hover:text-white" aria-label="Dismiss">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
