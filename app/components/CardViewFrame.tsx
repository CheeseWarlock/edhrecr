import React from 'react';
import { motion } from 'motion/react';

interface OverlayFrameProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function CardViewFrame({ isOpen, onClose, children }: OverlayFrameProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={ { opacity: 0 } }
      animate={{ opacity: 1 }}
      exit={ { opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#444] rounded-3xl max-h-[80vh] overflow-y-auto relative shadow-2xl/50 border-4 border-[#2694af]"
        onClick={onClose}
        style={ { transform: "scale(1.5)"}}
      >
        {children}
      </div>
    </motion.div>
  );
} 