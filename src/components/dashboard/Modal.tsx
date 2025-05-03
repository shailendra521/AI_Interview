import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeOnOutsideClick?: boolean;
}

export default function Modal({
  open,
  onClose,
  closeOnOutsideClick = true,
  children,
}: ModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  
  // Return null if not open or if we're in SSR
  if (!open || typeof document === "undefined") return null;
  
  // Use createPortal to render at the document body level
  return createPortal(
    <div
      className="fixed z-[9999] inset-0 flex justify-center items-center transition-colors px-4 py-6 overflow-y-auto backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
      onClick={closeOnOutsideClick ? onClose : () => {}}
    >
      <div
        style={{
          transform: "translateY(0)",
          position: "relative"
        }}
        className="animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative bg-white rounded-2xl shadow-[0_0_50px_-12px] shadow-indigo-100/50">
          <button
            className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-200 z-10 shadow-[0_4px_12px_-2px] shadow-gray-100/50 border border-gray-100"
            onClick={onClose}
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
