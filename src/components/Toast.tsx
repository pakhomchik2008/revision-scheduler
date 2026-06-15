"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastCtx {
  toast: (message: string, type?: "success" | "error") => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 md:bottom-4" role="status" aria-live="polite">
        {items.map((item) => (
          <div
            key={item.id}
            className={`animate-slide-in rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              item.type === "success" ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
