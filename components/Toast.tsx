import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastComponentProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return 'from-green-500 to-emerald-600 border-green-600';
      case 'error':
        return 'from-red-500 to-rose-600 border-red-600';
      case 'warning':
        return 'from-orange-500 to-amber-600 border-orange-600';
      case 'info':
        return 'from-blue-500 to-cyan-600 border-blue-600';
      default:
        return 'from-slate-500 to-slate-600 border-slate-600';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 min-w-[300px] max-w-md bg-gradient-to-r ${getColors()} text-white px-5 py-4 rounded-2xl shadow-2xl border-l-4 animate-slide-in transform transition-all duration-300 hover:scale-105 backdrop-blur-sm`}
    >
      <div className="text-2xl flex-shrink-0">{getIcon()}</div>
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Toast schließen"
      >
        <span className="text-xs font-bold">✕</span>
      </button>
    </div>
  );
};

export default ToastComponent;
