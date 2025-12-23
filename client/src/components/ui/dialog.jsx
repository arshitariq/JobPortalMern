import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

const DialogContext = React.createContext({
  open: false,
  onOpenChange: () => {},
});

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({ className, children }) {
  const { open, onOpenChange } = React.useContext(DialogContext);
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handler = (event) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const dialogNode =
    typeof document !== "undefined" ? document.getElementById("dialog-root") || document.body : null;

  if (!open || !dialogNode) return null;

  const handleBackdropClick = (event) => {
    if (event.target === contentRef.current) onOpenChange?.(false);
  };

  return ReactDOM.createPortal(
    <div
      ref={contentRef}
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl bg-background shadow-xl outline-none",
          className
        )}
      >
        {children}
      </div>
    </div>,
    dialogNode
  );
}

export function DialogHeader({ className, children }) {
  return <div className={cn("space-y-1 text-left", className)}>{children}</div>;
}

export function DialogTitle({ className, children }) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h3>;
}
