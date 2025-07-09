'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { Card } from "@/app/types";
import { SortableRemovableCard } from "./SortableRemovableCard";

interface CardDisplayProps {
  selectedCards: Card[];
  onRemoveCard: (cardId: string) => void;
  onReorderCards?: (cards: Card[]) => void;
}

export default function CardDisplay({ selectedCards, onRemoveCard, onReorderCards }: CardDisplayProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorderCards) {
      const oldIndex = selectedCards.findIndex((item) => item.id === active.id);
      const newIndex = selectedCards.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(selectedCards, oldIndex, newIndex);
      onReorderCards(newOrder);
    }
  };

  return (
    <div className="flex flex-row bg-[#444] w-full justify-center p-4 shrink-0" style={{ touchAction: 'none' }}>
      {selectedCards.length === 0 && (
        <div>
          <div className="flex flex-col mb-22">
            <div className="bg-gradient-to-r from-20% from-[#136235] via-50% via-[#43783F] to-80% to-[#136235] rounded-[5%] w-[256px] h-[357px] flex items-center justify-center border-12 border-[#171717]">
              <span className="m-2 text-white">No cards selected</span>
            </div>
          </div>
        </div>
      )}
      {selectedCards.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
          autoScroll={false}
        >
          <SortableContext
            items={selectedCards.map((item) => item.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-row" style={{ touchAction: 'none' }}>
              {selectedCards.map((card) => (
                <SortableRemovableCard
                  key={card.id}
                  id={card.id}
                  card={card}
                  onRemoveCard={onRemoveCard}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
} 