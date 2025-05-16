import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  index: number;
  disabled?: boolean;
  leftSkipCount: number;
  rightSkipCount: number;
}

export function SortableItem({ id, children, disabled, index, leftSkipCount, rightSkipCount }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 0,
    marginRight: `calc(100% * (${rightSkipCount / 7})`,
    marginLeft: `calc(100% * (${leftSkipCount / 7})`,
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
      className={`overflow-hidden rounded-xl mw-[256px] mh-[357px] ${
        isDragging ? '' : ''
      }`}
    >
      {children}
    </div>
  );
} 