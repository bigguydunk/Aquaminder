import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState<{
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'info';
  } | null>(null);

 
  React.useEffect(() => {
    if (open === false) {
      setToast(null);
    }
  }, [open]);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Root open={open} onOpenChange={setOpen} className="fixed bottom-6 right-6 z-[9999] w-[320px] max-w-full">
        <div
          className={`rounded-lg shadow-lg px-4 py-3 flex flex-col gap-1 border-l-4
            ${toast?.variant === 'success' ? 'bg-green-50 border-green-600' : ''}
            ${toast?.variant === 'error' ? 'bg-red-50 border-red-600' : ''}
            ${toast?.variant === 'info' ? 'bg-blue-50 border-blue-600' : ''}
          `}
        >
          <span className="font-semibold text-lg">
            {toast?.title}
          </span>
          {toast?.description && (
            <span className="text-sm text-gray-700">{toast.description}</span>
          )}
        </div>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport />
    </ToastPrimitive.Provider>
  );
}

export const ToastContext = React.createContext<{
  showToast: (toastData: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => void;
} | null>(null);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProviderWithContext({ children }: { children: React.ReactNode }) {
  // Provide the ToastProvider's showToast directly to context
  const [toastState, setToastState] = React.useState<{
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'info';
  } | null>(null);
  const [open, setOpen] = React.useState(false);

  const showToast = (toastData: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => {
    setToastState(toastData);
    setOpen(true);
  };

  React.useEffect(() => {
    if (!open) setToastState(null);
  }, [open]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastPrimitive.Root open={open} onOpenChange={setOpen} className="fixed bottom-6 right-6 z-[9999] w-[320px] max-w-full">
          <div
            className={`rounded-lg shadow-lg px-4 py-3 flex flex-col gap-1 border-l-4
              ${toastState?.variant === 'success' ? 'bg-green-50 border-green-600' : ''}
              ${toastState?.variant === 'error' ? 'bg-red-50 border-red-600' : ''}
              ${toastState?.variant === 'info' ? 'bg-blue-50 border-blue-600' : ''}
            `}
          >
            <span className="font-semibold text-lg">
              {toastState?.title}
            </span>
            {toastState?.description && (
              <span className="text-sm text-gray-700">{toastState.description}</span>
            )}
          </div>
        </ToastPrimitive.Root>
        <ToastPrimitive.Viewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
