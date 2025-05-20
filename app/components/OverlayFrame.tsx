import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface OverlayFrameProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function OverlayFrame({ isOpen, onClose, children }: OverlayFrameProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#444] rounded-xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-2xl/50 border-4 border-[#2694af]"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-[#2694AF] transition-colors cursor-pointer"
        >
          <FaTimes size={24} />
        </button>
        {children}
      </div>
    </div>
  );
} 