import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  onConfirm: (() => void) | null;
  open: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  danger: false,
  onConfirm: null,
  open: (opts) =>
    set({
      isOpen: true,
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? 'Confirmar',
      cancelLabel: opts.cancelLabel ?? 'Cancelar',
      danger: opts.danger ?? false,
      onConfirm: opts.onConfirm,
    }),
  close: () => set({ isOpen: false, onConfirm: null }),
}));
