'use client';

import React, { useState } from 'react';
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
interface Card {
  id: string;
  name: string;
  image_url: string;
  edhrec_rank: number;
}

export function SortableList(options: { cards: Card[] }) {
  /**
   * The items in the current guess
   */
  const [cardsInCurrentGuess, setCardsInCurrentGuess] = useState<Card[]>(options.cards);
  /**
   * The previously guessed orders
   */
  const [guessedOrders, setGuessedOrders] = useState<Card[][]>([]);
  /**
   * The cards not yet placed correctly
   */
  const [remainingCards, setRemainingCards] = useState<Card[]>(options.cards);
  /**
   * The indices of the cards that have been placed correctly
   */
  const [correctIndices, setCorrectIndices] = useState<boolean[]>(new Array(options.cards.length).fill(false));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCardsInCurrentGuess((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleLockInGuess = () => {
    const correctOrderForRemainingCards = ([...remainingCards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
    const correctOrder = ([...options.cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
    const newCorrectIndices = [...correctIndices];

    // Find which ones we got right on this guess
    const correctCards = cardsInCurrentGuess.filter((item, index) => {
      return correctOrderForRemainingCards.indexOf(item) == index;
    });

    // Find which ones we got wrong on this guess
    const wrongCards = cardsInCurrentGuess.filter((item, index) => {
      return correctOrderForRemainingCards.indexOf(item) != index;
    });


    correctCards.forEach(card => {
      const index = correctOrder.indexOf(card);
      newCorrectIndices[index] = true;
    });

    addGuessedOrder([...cardsInCurrentGuess]);
    setRemainingCards(wrongCards);
    setCardsInCurrentGuess(wrongCards);
    setCorrectIndices(newCorrectIndices);
  };

  const addGuessedOrder = (currentGuess: Card[]) => {
    const newOrder: Card[] = [];
    const correctOrder = ([...options.cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);

    let currentOrderIndex = 0;
    for (let i = 0; i < options.cards.length; i++) {
      if (correctIndices[i]) {
        newOrder.push(correctOrder[i]);
      } else {
        newOrder.push(currentGuess[currentOrderIndex++]);
      }
    }
    setGuessedOrders([...guessedOrders, newOrder]);
  };

  const getPositionFeedback = (card: Card, index: number) => {
    const correctOrder = ([...options.cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
    const correctIndex = correctOrder.findIndex(c => c.id === card.id);
    if (index === correctIndex) return 'correct';
    if (index < correctIndex) return 'too-low';
    return 'too-high';
  };

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
  while (ticker <= options.cards.length && correctIndices[ticker]) {
    initialLeftMargin += 1;
    ticker++;
  }

  return (
    <div className="w-full mx-auto max-w-[1792px]">
      {guessedOrders.map((guess, guessIdx) => 
        <div className="p-6 max-w-[1792px] bg-[#333] mt-6 mb-6 rounded-xl" key={guessIdx}>
          <div className="flex">
            {guess.map((card, cardIndex) => {
              const feedback = getPositionFeedback(card, cardIndex);
              return (
                <div key={card.id} className="relative overflow-hidden rounded-xl flex items-center justify-center">
                  <Image 
                    src={card.image_url} 
                    alt={card.name}
                    width={256}
                    height={357}
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
          items={cardsInCurrentGuess.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-col w-full p-6 bg-[#444] mt-6 mb-6 rounded-xl">
            <div className="flex flex-row">
            {cardsInCurrentGuess.map((item, index) => {
              return (
                <SortableItem key={item.id} id={item.id} index={index} leftSkipCount={index == 0 ? initialLeftMargin : 0} rightSkipCount={rightMargins[index]}>
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
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex flex-row gap-4 justify-between">
        <span>◀ Most Popular</span>
        <button
          onClick={handleLockInGuess}
          className="px-8 py-4 bg-[#2694AF] text-white rounded-xl hover:bg-[#1e7a8f] transition-colors text-lg font-semibold"
        >
          Submit Guess
        </button>
        <span>Least Popular ▶</span>
      </div>
    </div>
  );
} 