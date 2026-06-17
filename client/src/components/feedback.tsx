// Avisos (toasts) e diálogo de confirmação estilizados, no lugar dos
// alert()/confirm() nativos do navegador (que ficam feios numa apresentação).
//
// API imperativa, sem precisar de hooks/context nas telas:
//   toast.success("Salvo!")  /  toast.error("Deu ruim")
//   if (await confirmar({ title: "Excluir?", ... })) { ... }
//
// O <FeedbackHost/> é montado uma única vez no App e renderiza tudo.

import { useEffect, useState } from "react";

// ------------------------------------------------------------------ Toasts
type ToastType = "success" | "error";
interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let toastSeq = 0;
let toastState: ToastItem[] = [];
let toastSubs: ((t: ToastItem[]) => void)[] = [];

function pushToast(type: ToastType, message: string) {
  const item: ToastItem = { id: ++toastSeq, type, message };
  toastState = [...toastState, item];
  toastSubs.forEach((fn) => fn(toastState));
  setTimeout(() => {
    toastState = toastState.filter((t) => t.id !== item.id);
    toastSubs.forEach((fn) => fn(toastState));
  }, 3600);
}

export const toast = {
  success: (message: string) => pushToast("success", message),
  error: (message: string) => pushToast("error", message),
};

// ------------------------------------------------------------- Confirmação
interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  resolve: (ok: boolean) => void;
}

let confirmState: ConfirmRequest | null = null;
let confirmSubs: ((c: ConfirmRequest | null) => void)[] = [];

export function confirmar(opts: {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    confirmState = { ...opts, resolve };
    confirmSubs.forEach((fn) => fn(confirmState));
  });
}

function closeConfirm(ok: boolean) {
  confirmState?.resolve(ok);
  confirmState = null;
  confirmSubs.forEach((fn) => fn(null));
}

// ----------------------------------------------------------------- Host
export function FeedbackHost() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastState);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(confirmState);

  useEffect(() => {
    const ts = (t: ToastItem[]) => setToasts([...t]);
    const cs = (c: ConfirmRequest | null) => setConfirm(c);
    toastSubs.push(ts);
    confirmSubs.push(cs);
    return () => {
      toastSubs = toastSubs.filter((fn) => fn !== ts);
      confirmSubs = confirmSubs.filter((fn) => fn !== cs);
    };
  }, []);

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeConfirm(false);
      if (e.key === "Enter") closeConfirm(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirm]);

  return (
    <>
      <div className="toaster">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-icon">{t.type === "success" ? "✓" : "!"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {confirm && (
        <div className="modal-overlay" onClick={() => closeConfirm(false)}>
          <div
            className="modal confirm-modal"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
          >
            <div className="modal-body">
              <h2 className="confirm-title">{confirm.title}</h2>
              {confirm.message && <p className="confirm-message">{confirm.message}</p>}
              <div className="modal-actions">
                <button className="btn-ghost" onClick={() => closeConfirm(false)}>
                  Cancelar
                </button>
                <button
                  className={confirm.danger ? "btn-danger" : "btn-primary"}
                  onClick={() => closeConfirm(true)}
                  autoFocus
                >
                  {confirm.confirmLabel ?? "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
