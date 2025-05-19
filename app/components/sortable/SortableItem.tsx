import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  leftSkipCount: number;
  rightSkipCount: number;
  itemsInGroup: number;
}

export function SortableItem({ id, children, leftSkipCount, rightSkipCount, itemsInGroup }: SortableItemProps) {
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
    borderRadius: '16px',
    touchAction: 'none',
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