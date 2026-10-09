import React, { type ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-lg border border-card-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-sm p-1.5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
