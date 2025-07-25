import React from 'react';
import { motion } from 'motion/react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Card } from '../types';
import { CardImage } from './CardImage';
import { ClickPosition } from './CardViewerContext';

interface CardViewFrameProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  canViewInEDHRec: boolean;
  clickPosition?: ClickPosition | null;
}

export function CardViewFrame({ isOpen, onClose, card, canViewInEDHRec, clickPosition }: CardViewFrameProps) {
  if (!isOpen) return null;

  // Calculate initial position and scale for pop-out animation
  const getInitialTransform = () => {
    if (!clickPosition) {
      return { opacity: 0, scale: 0.8 };
    }
    
    // Calculate the position relative to the viewport center
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    
    // Calculate the offset from the center to the click position
    const offsetX = clickPosition.x - viewportCenterX;
    const offsetY = clickPosition.y - viewportCenterY;
    
    return {
      opacity: 0,
      x: offsetX,
      y: offsetY,
      scale: 0.1,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />
        <motion.div
          initial={getInitialTransform()}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: 0, 
            scale: 1 
          }}
          exit={{ 
            opacity: 0, 
            scale: 1
          }}
          transition={{ 
            duration: 0.3
          }}
          className="fixed z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div 
            className="bg-[#444] rounded-3xl max-h-[80vh] overflow-y-auto relative shadow-2xl/50 border-4 border-mana-blue"
            onClick={onClose}
          >
            <CardImage card={card} width={384} height={535} />
            {canViewInEDHRec && (
              <a href={`https://edhrec.com/route/?cc=${encodeURIComponent(card.name)}`} target="_blank" rel="noopener noreferrer" className="mx-4 my-2 text-white text-sm flex items-baseline gap-2">
                View in EDHRec <FaExternalLinkAlt />
              </a>
            )}
          </div>
        </motion.div>
    </div>
  );
} 