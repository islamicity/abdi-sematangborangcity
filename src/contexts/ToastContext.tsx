import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastOptions {
  id?: string;
  title: string;
  message?: string;
  type?: ToastType;
  badge?: string;
  duration?: number;
}

interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  badge?: string;
  duration: number;
  createdAt: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const noop = () => "";

const ToastContext = createContext<ToastContextValue>({
  showToast: noop,
  dismissToast: () => {},
  clearToasts: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const MAX_VISIBLE_TOASTS = 4;
const DEFAULT_DURATION_MS = 4500;

const TOAST_STYLES: Record<
  ToastType,
  {
    container: string;
    iconWrap: string;
    badge: string;
    progressBar: string;
    Icon: typeof CheckCircle2;
  }
> = {
  success: {
    container: "border-emerald-500/60 bg-slate-950/95 shadow-emerald-950/50",
    iconWrap: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    progressBar: "bg-emerald-400",
    Icon: CheckCircle2,
  },
  info: {
    container: "border-teal-500/60 bg-slate-950/95 shadow-teal-950/50",
    iconWrap: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    badge: "bg-teal-500/20 text-teal-200 border-teal-400/40",
    progressBar: "bg-teal-400",
    Icon: Info,
  },
  warning: {
    container: "border-amber-500/60 bg-slate-950/95 shadow-amber-950/50",
    iconWrap: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    badge: "bg-amber-500/20 text-amber-200 border-amber-400/40",
    progressBar: "bg-amber-400",
    Icon: AlertTriangle,
  },
  error: {
    container: "border-rose-500/60 bg-slate-950/95 shadow-rose-950/50",
    iconWrap: "bg-rose-500/20 text-rose-400 border-rose-500/40",
    badge: "bg-rose-500/20 text-rose-200 border-rose-400/40",
    progressBar: "bg-rose-400",
    Icon: AlertCircle,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const existingTimer = timersRef.current.get(id);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, duration: number) => {
      const existingTimer = timersRef.current.get(id);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
      }
      if (duration > 0) {
        const timerId = window.setTimeout(() => {
          dismissToast(id);
        }, duration);
        timersRef.current.set(id, timerId);
      }
    },
    [dismissToast]
  );

  const showToast = useCallback(
    (options: ToastOptions): string => {
      const id =
        options.id ||
        `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = options.duration ?? DEFAULT_DURATION_MS;

      const nextToast: ToastItem = {
        id,
        title: options.title,
        message: options.message,
        type: options.type ?? "success",
        badge: options.badge,
        duration,
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const withoutSameId = prev.filter((t) => t.id !== id);
        const updated = [nextToast, ...withoutSameId];
        if (updated.length > MAX_VISIBLE_TOASTS) {
          const evicted = updated.slice(MAX_VISIBLE_TOASTS);
          evicted.forEach((ev) => {
            const timerId = timersRef.current.get(ev.id);
            if (timerId) {
              window.clearTimeout(timerId);
              timersRef.current.delete(ev.id);
            }
          });
          return updated.slice(0, MAX_VISIBLE_TOASTS);
        }
        return updated;
      });

      scheduleDismiss(id, duration);
      return id;
    },
    [scheduleDismiss]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, clearToasts }}>
      {children}

      {/* Global Toast Viewport (Top-Right on Desktop, Bottom-Center on Mobile, Hidden on Print) */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          aria-label="Notifikasi sistem"
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[70] flex flex-col gap-2.5 pointer-events-none print:hidden"
        >
          {toasts.map((toast) => {
            const theme = TOAST_STYLES[toast.type];
            const Icon = theme.Icon;

            return (
              <div
                key={`${toast.id}-${toast.createdAt}`}
                role="status"
                onMouseEnter={() => {
                  const timerId = timersRef.current.get(toast.id);
                  if (timerId) {
                    window.clearTimeout(timerId);
                    timersRef.current.delete(toast.id);
                  }
                }}
                onMouseLeave={() => {
                  scheduleDismiss(toast.id, Math.min(toast.duration, 2500));
                }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-md p-3.5 text-white shadow-2xl transition-all duration-200 animate-in slide-in-from-bottom-3 fade-in ${theme.container}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${theme.iconWrap}`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    {toast.badge && (
                      <span
                        className={`inline-block text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}
                      >
                        {toast.badge}
                      </span>
                    )}
                    <div className="text-xs font-bold text-white leading-snug">
                      {toast.title}
                    </div>
                    {toast.message && (
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {toast.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    aria-label="Tutup notifikasi"
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtle Bottom Accent Bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 opacity-80 ${theme.progressBar}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}
