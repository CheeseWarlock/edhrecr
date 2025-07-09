import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RemovableCardWithData from './RemovableCardWithData';
import { Card } from '@/app/types';

interface SortableRemovableCardProps {
  id: string;
  card: Card;
  onRemoveCard: (cardId: string) => void;
  isCorrectOrder?: boolean;
}

/**
 * A wrapper for a sortable removable card in the builder.
 * Handles drag and drop functionality for the RemovableCardWithData component.
 */
export function SortableRemovableCard({ id, card, onRemoveCard, isCorrectOrder = false }: SortableRemovableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isCorrectOrder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isCorrectOrder ? {} : attributes)}
      {...(isCorrectOrder ? {} : listeners)}
      className={`${isCorrectOrder ? 'cursor-default' : 'cursor-grab'}`}
    >
      <RemovableCardWithData
        card={card}
        onRemoveCard={onRemoveCard}
      />
    </div>
  );
} 