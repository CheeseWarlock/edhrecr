import React from 'react';
import { motion } from 'motion/react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Card } from '../types';
import { CardImage } from './CardImage';

interface CardViewFrameProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  canViewInEDHRec: boolean;
}

export function CardViewFrame({ isOpen, onClose, card, canViewInEDHRec }: CardViewFrameProps) {
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
        className="bg-[#444] rounded-3xl max-h-[80vh] overflow-y-auto relative shadow-2xl/50 border-4 border-mana-blue"
        onClick={onClose}
        style={ { transform: "scale(1.5)"}}
      >
        <CardImage card={card} />
        {canViewInEDHRec && (
          <a href={`https://edhrec.com/route/?cc=${encodeURIComponent(card.name)}`} target="_blank" rel="noopener noreferrer" className="mx-4 my-2 text-white text-sm flex items-baseline gap-2">
            View in EDHRec <FaExternalLinkAlt />
          </a>
        )}
      </div>
    </motion.div>
  );
} 