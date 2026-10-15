import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Toast එක පෙන්වීමේ function එක
  const showToast = useCallback((type = 'success', message = '', title = '') => {
    const id = Date.now();
    const defaultTitle = title || (type === 'success' ? 'Success' : 'Error');

    setToasts((prev) => [...prev, { id, type, title: defaultTitle, message }]);

    // තත්පර 4කින් පසු ස්වයංක්‍රීයව අතුරුදහන් වීම
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const closeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Screen එකේ දකුණු පස උඩින් පෙන්වන Toast Container එක */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-center justify-between bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden px-4 py-3.5 transition-all duration-300 transform translate-y-0"
              style={{
                borderLeftWidth: '6px',
                borderLeftColor: isSuccess ? '#22C55E' : '#EF4444',
              }}
            >
              {/* Left Side: Icon & Texts */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                {/* Icon Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 ${isSuccess
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-rose-500 text-rose-500'
                    }`}
                >
                  {isSuccess ? (
                    // Green Checkmark SVG
                    <svg
                      className="w-5 h-5 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    // Red Cross SVG
                    <svg
                      className="w-5 h-5 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>

                {/* Title & Message */}
                <div className="flex flex-col">
                  <h4 className="text-[15px] font-bold text-slate-800 leading-tight">
                    {toast.title}
                  </h4>
                  <p className="text-[13px] text-slate-400 font-medium mt-0.5 leading-snug">
                    {toast.message}
                  </p>
                </div>
              </div>

              {/* Right Side: CLOSE Button */}
              <button
                onClick={() => closeToast(toast.id)}
                className="text-[11px] font-bold tracking-wider text-slate-400 hover:text-slate-700 transition-colors uppercase ml-2 px-1 py-0.5"
              >
                CLOSE
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};