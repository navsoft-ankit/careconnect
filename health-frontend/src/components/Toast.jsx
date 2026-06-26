import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, type = "default") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}