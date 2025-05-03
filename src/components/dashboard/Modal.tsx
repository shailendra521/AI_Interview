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
      className="fixed z-[9999] inset-0 flex justify-center items-center transition-colors px-4 py-6 overflow-y-auto"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(2px)"
      }}
      onClick={closeOnOutsideClick ? onClose : () => {}}
    >
      <div
        // className="bg-white rounded-xl shadow-lg max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto transition-all scale-100 opacity-100"
        style={{
          transform: "translateY(0)",
          position: "relative"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 relative">
          <button
            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
            onClick={onClose}
          >
            <X size={20} />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
