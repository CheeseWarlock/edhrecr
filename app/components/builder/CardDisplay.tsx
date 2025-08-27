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
  isCorrectOrder?: boolean;
}

export default function CardDisplay({ selectedCards, onRemoveCard, onReorderCards, isCorrectOrder = false }: CardDisplayProps) {
  const cardsInContextualOrder = isCorrectOrder ? [...selectedCards].sort((a, b) => a.edhrec_rank - b.edhrec_rank) : selectedCards;
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

    if (over && active.id !== over.id && onReorderCards && !isCorrectOrder) {
      const oldIndex = cardsInContextualOrder.findIndex((item) => item.id === active.id);
      const newIndex = cardsInContextualOrder.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(cardsInContextualOrder, oldIndex, newIndex);
      onReorderCards(newOrder);
    }
  };

  return (
    <div className="flex flex-col items-center" data-testid="card-display">
      <span className="text-white">Showing {isCorrectOrder ? "Solution" : "Display"} Order</span>
      <div className="flex flex-row bg-[#444] w-full justify-center p-4 shrink-0" style={{ touchAction: 'none' }}>
        
        {cardsInContextualOrder.length === 0 && (
          <div>
            <div className="flex flex-col mb-22">
              <div className="bg-gradient-to-r from-20% from-[#136235] via-50% via-[#43783F] to-80% to-[#136235] rounded-[5%] w-[256px] h-[357px] flex items-center justify-center border-12 border-[#171717]">
                <span className="m-2 text-white">No cards selected</span>
              </div>
            </div>
          </div>
        )}
        {cardsInContextualOrder.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
            autoScroll={false}
          >
            <SortableContext
              items={cardsInContextualOrder.map((item) => item.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-row" style={{ touchAction: 'none' }}>
                {cardsInContextualOrder.map((card) => (
                  <SortableRemovableCard
                    key={card.id}
                    id={card.id}
                    card={card}
                    onRemoveCard={onRemoveCard}
                    isCorrectOrder={isCorrectOrder}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
} 