import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableCardProps {
  id: string;
  children: React.ReactNode;
  leftSkipCount: number;
  rightSkipCount: number;
  itemsInGroup: number;
}

/**
 * A wrapper for a sortable card in the current guess.
 * Handles some oddities like skipping card positions.
 */
export function SortableCard({ id, children, leftSkipCount, rightSkipCount, itemsInGroup }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 0,
    marginRight: `calc(100% * (${rightSkipCount / itemsInGroup})`,
    marginLeft: `calc(100% * (${leftSkipCount / itemsInGroup})`,
    overflow: 'hidden',
    borderRadius: '5%',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab mw-[256px] mh-[357px] ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      {children}
    </div>
  );
} 