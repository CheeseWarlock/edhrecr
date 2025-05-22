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
} from '@dnd-kit/sortable';
import { SortableCard } from './SortableCard';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CardImage } from './CardImage';
import { GhostCardList } from './GhostCardList';

interface Card {
  id: string;
  name: string;
  image_url: string;
  edhrec_rank: number;
}

/**
 * The sortable row of cards making up the player's current guess
 */
export function CurrentGuess({ remainingCards, correctIndices, correctCards, onDragEnd }: { 
  remainingCards: Card[], 
  correctIndices: boolean[], 
  correctCards: { card: Card, index: number }[],
  onDragEnd: (event: DragEndEvent) => void
}) {
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

  const rightMargins = correctIndices.map((position, index) => {
    if (position) return null;
    let marginCount = 0;
    let iindex = index + 1;
    while (correctIndices[iindex]) {
      marginCount++;
      iindex++;
    }
    return marginCount;
  }).filter(item => item != null);

  let initialLeftMargin = 0;
  let ticker = 0;
  while (ticker <= correctIndices.length && correctIndices[ticker]) {
    initialLeftMargin += 1;
    ticker++;
  }

  return (
    <div className="flex flex-col w-full bg-[#444] max-w-[1792px] mt-0 md:rounded-xl relative z-10 justify-center" style={{ touchAction: 'none' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToParentElement]}
        autoScroll={false}
      >
        <SortableContext
          items={remainingCards.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <GhostCardList correctCards={correctCards} correctIndices={correctIndices} positioning="absolute" />
            <div className="flex flex-row" style={{ touchAction: 'none' }}>
            {remainingCards.map((item, index) => {
              return (
                <SortableCard key={item.id} id={item.id} itemsInGroup={correctIndices.length} leftSkipCount={index == 0 ? initialLeftMargin : 0} rightSkipCount={rightMargins[index]}>
                  <CardImage card={item} />
                </SortableCard>
              );
            })}
            </div>
        </SortableContext>
      </DndContext></div>
  )
}
