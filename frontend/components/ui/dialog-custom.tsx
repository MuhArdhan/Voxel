"use client";

import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";

type DialogVariant = "confirm" | "alert" | "success" | "error";

interface DialogOptions {
  title: string;
  message: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface DialogState extends DialogOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const ICONS: Record<DialogVariant, React.ReactNode> = {
  confirm: <AlertTriangle size={24} className="text-[#D97706]" />,
  alert:   <Info size={24} className="text-[#0284C7]" />,
  success: <CheckCircle size={24} className="text-[#059669]" />,
  error:   <XCircle size={24} className="text-[#DC2626]" />,
};

const ICON_BG: Record<DialogVariant, string> = {
  confirm: "bg-[#D97706]/10 border border-[#D97706]/20",
  alert:   "bg-[#0284C7]/10 border border-[#0284C7]/20",
  success: "bg-[#059669]/10 border border-[#059669]/20",
  error:   "bg-[#DC2626]/10 border border-[#DC2626]/20",
};

const CONFIRM_BTN: Record<DialogVariant, string> = {
  confirm: "bg-[#DC2626] hover:bg-[#DC2626]/90 text-white",
  alert:   "bg-[#0A0A0A] hover:bg-[#5C1A1A] text-[#F2F0EB]",
  success: "bg-[#059669] hover:bg-[#059669]/90 text-white",
  error:   "bg-[#DC2626] hover:bg-[#DC2626]/90 text-white",
};

function DialogModal({
  isOpen,
  title,
  message,
  variant = "confirm",
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: DialogOptions & {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isConfirm = variant === "confirm";
  const defaultConfirm = isConfirm ? "Yes, Proceed" : "OK";
  const defaultCancel = "Cancel";

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-[#0A0A0A]/60 backdrop-blur-sm"
            onClick={isConfirm ? onCancel : onConfirm}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center px-6 pointer-events-none"
          >
            <div className="bg-[#F2F0EB] border border-[#C8C4BC] rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto">
              <div className="p-8">
                {/* Icon + close */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ICON_BG[variant]}`}>
                    {ICONS[variant]}
                  </div>
                  {isConfirm && (
                    <button
                      onClick={onCancel}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#8A8680] hover:text-[#0A0A0A] hover:bg-[#E8E5DF] transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Text */}
                <h2 className="text-xl font-black text-[#0A0A0A] tracking-tight mb-2">
                  {title}
                </h2>
                <p className="text-sm text-[#4A4845] leading-relaxed">
                  {message}
                </p>

                {/* Buttons */}
                <div className={`flex gap-3 mt-8 ${isConfirm ? "flex-row-reverse" : ""}`}>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 py-3 rounded-full text-sm font-bold tracking-wide transition-colors ${CONFIRM_BTN[variant]}`}
                  >
                    {confirmLabel ?? defaultConfirm}
                  </button>
                  {isConfirm && (
                    <button
                      onClick={onCancel}
                      className="flex-1 py-3 rounded-full text-sm font-bold border border-[#C8C4BC] text-[#4A4845] hover:bg-[#E8E5DF] transition-colors"
                    >
                      {cancelLabel ?? defaultCancel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function useDialog() {
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    title: "",
    message: "",
    variant: "confirm",
    resolve: null,
  });

  const confirm = useCallback((opts: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, variant: opts.variant ?? "confirm", isOpen: true, resolve });
    });
  }, []);

  const alert = useCallback((opts: Omit<DialogOptions, "variant"> & { variant?: Exclude<DialogVariant, "confirm"> }): Promise<void> => {
    return new Promise((resolve) => {
      setState({
        ...opts,
        variant: opts.variant ?? "alert",
        isOpen: true,
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, isOpen: false }));
  }, [state]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, isOpen: false }));
  }, [state]);

  const Dialog = (
    <DialogModal
      isOpen={state.isOpen}
      title={state.title}
      message={state.message}
      variant={state.variant}
      confirmLabel={state.confirmLabel}
      cancelLabel={state.cancelLabel}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, alert, Dialog };
}
