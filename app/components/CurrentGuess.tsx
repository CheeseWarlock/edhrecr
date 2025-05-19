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
interface Card {
  id: string;
  name: string;
  image_url: string;
  edhrec_rank: number;
}

/**
 * The sortable row of cards making up the player's current guess
 */
export function CurrentGuess({ remainingCards, correctIndices, onGuessSubmit, correctCards, onDragEnd }: { 
  remainingCards: Card[], 
  correctIndices: boolean[], 
  onGuessSubmit: (cards: Card[]) => void, 
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
    <>
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
          <div className="flex flex-col w-full py-6 md:px-6 bg-[#444] max-w-[1792px] mt-0 md:rounded-xl" style={{ touchAction: 'none' }}>
          <div className="flex flex-row" style={{ touchAction: 'none', filter: 'grayscale(1) opacity(0.3)' }}>
        {correctCards.map((data) => {
          return (
            <div
            className="absolute"
            key={data.card.id}
            style={{
              marginLeft: `calc(100% * ${data.index / correctIndices.length})`,
              width: `calc(100% * (1 / ${correctIndices.length}))`,
              height: 'auto',
              mask: `linear-gradient(
              rgba(0, 0, 0, 0.5) 0px, 
              rgb(0, 0, 0) 22%, 
              rgb(0, 0, 0) 78%, 
              rgba(0, 0, 0, 0.5) 100%) 100% 0% / 100% 102%`
            }}>
              <CardImage card={data.card} />
            </div>
          )
        })}
      </div>
            <div className="flex flex-row" style={{ touchAction: 'none' }}>
            {remainingCards.map((item, index) => {
              return (
                <SortableCard key={item.id} id={item.id} itemsInGroup={correctIndices.length} leftSkipCount={index == 0 ? initialLeftMargin : 0} rightSkipCount={rightMargins[index]}>
                  <CardImage card={item} />
                </SortableCard>
              );
            })}
            </div>
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-row gap-4 max-w-[1792px] justify-between py-2 px-2 md:px-0">
        <div>
          <div className="flex flex-row gap-2 items-center">
            <span>◀</span><span>Most Popular</span>
          </div>
        </div>
        <button
          onClick={() => onGuessSubmit(remainingCards)}
          className="cursor-pointer px-8 py-4 bg-[#2694AF] text-white rounded-xl hover:bg-[#1e7a8f] transition-colors text-lg font-semibold"
        >
          Submit Guess
        </button>
        <div>
          <div className="flex flex-row gap-2 items-center text-right">
            <span>Least Popular</span><span>▶</span>
          </div>
        </div>
      </div>
    </>
  )
}
