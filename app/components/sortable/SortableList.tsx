'use client';

import React, { useState, useEffect } from 'react';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import Image from 'next/image';
import { CustomListSortingStrategy } from './CustomListSortingStrategy';
import { arrayMoveFrozen } from './arrayMoveFrozen';
interface Card {
  id: string;
  name: string;
  image_url: string;
  edhrec_rank: number;
}

export function SortableList(options: { cards: Card[] }) {
  const [items, setItems] = useState<Card[]>(options.cards);
  const [guessedOrders, setGuessedOrders] = useState<Card[][]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // const oldIndex = items.findIndex((item) => item.id === active.id);
      //   const newIndex = items.findIndex((item) => item.id === over.id);

      //   setItems(arrayMoveFrozen(items, oldIndex, newIndex, 2));

      setItems((items) => {
        console.log("setting items");
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMoveFrozen(items, oldIndex, newIndex, 2);
      });
    }
  }

  const handleLockInGuess = () => {
    addGuessedOrder([...items]);
  };

  const addGuessedOrder = (order: Card[]) => {
    setGuessedOrders([...guessedOrders, order]);
  };

  const getPositionFeedback = (card: Card, index: number) => {
    const correctOrder = ([...items]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
    const correctIndex = correctOrder.findIndex(c => c.id === card.id);
    if (index === correctIndex) return 'correct';
    if (index < correctIndex) return 'too-low';
    return 'too-high';
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={handleLockInGuess}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Lock in Guess
        </button>
      </div>
      {guessedOrders.map((guess, guessIdx) => 
        <div className="mt-2" key={guessIdx}>
        <div className="flex gap-4">
          {guess.map((card, index) => {
            const feedback = getPositionFeedback(card, index);
            return (
              <div key={card.id} className="relative overflow-hidden rounded-lg flex items-center justify-center">
                <Image 
                  src={card.image_url} 
                  alt={card.name}
                  width={219}
                  height={306}
                  className="object-contain"
                />
                <div className={`absolute bottom-0 p-1 text-center text-white w-[40px] h-[40px] rounded-full ${
                  feedback === 'correct' ? 'bg-green-500' :
                  'bg-red-500'
                }`}>
                  {feedback === 'correct' ? '✓' : 'x'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
      

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={CustomListSortingStrategy}
        >
          <div className="flex gap-4 w-full">
            {items.map((item, index) => {
              if (index == 2) {
                return <div key={item.id}><Image 
                src={item.image_url} 
                alt={item.name}
                width={256}
                height={357}
                className="object-contain mw-[256px] mh-[357px]"

              /></div>;
              }
              return (
                <SortableItem key={item.id} id={item.id}>
                  <Image 
                    src={item.image_url} 
                    alt={item.name}
                    width={256}
                    height={357}
                    className="object-contain mw-[256px] mh-[357px]"
                  />
                </SortableItem>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 