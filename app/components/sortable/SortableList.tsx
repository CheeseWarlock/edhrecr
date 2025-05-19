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
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CardImage } from '../CardImage';
import { Feedback, FeedbackMark } from '../FeedbackMark';
import { GuessResult } from '../GuessResult';
interface Card {
  id: string;
  name: string;
  image_url: string;
  edhrec_rank: number;
}

function CurrentGuess({ remainingCards, correctIndices, onGuessSubmit, correctCards, onDragEnd }: { 
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
                <SortableItem key={item.id} id={item.id} itemsInGroup={correctIndices.length} leftSkipCount={index == 0 ? initialLeftMargin : 0} rightSkipCount={rightMargins[index]}>
                  <CardImage card={item} />
                </SortableItem>
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

export function SortableList(options: { cards: Card[] }) {
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
  /**
   * The current guess being built
   */
  const [currentGuess, setCurrentGuess] = useState<Card[]>(options.cards);

  const handleLockInGuess = (cardsInCurrentGuess: Card[]) => {
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
    setCorrectIndices(newCorrectIndices);
    setCurrentGuess(wrongCards);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentGuess.findIndex((item) => item.id === active.id);
      const newIndex = currentGuess.findIndex((item) => item.id === over.id);
      setCurrentGuess(arrayMove([...currentGuess], oldIndex, newIndex));
    }
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

  const correctOrder = ([...options.cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);

  const correctCards = correctIndices.map((position, index) => {
    if (!position) return null;
    return { card: options.cards[index], index: index };
  }).filter(item => item != null);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto flex flex-col justify-end">
        <div>
          {guessedOrders.map((guess, guessIdx) => 
            <GuessResult guess={guess} key={guessIdx} correctOrder={correctOrder} />
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        {remainingCards.length == 0 ? (
          <div className="flex flex-col w-full p-6 bg-[#444] max-w-[1792px] mt-0 rounded-xl justify-center items-center">
            <span className="text-white text-2xl font-bold">You won in {guessedOrders.length} guesses!</span>
            <span className="text-white text-lg">Come back tomorrow for another challenge.</span>
          </div>
        ) : (
          <CurrentGuess 
            remainingCards={currentGuess} 
            correctIndices={correctIndices} 
            onGuessSubmit={handleLockInGuess}
            correctCards={correctCards}
            onDragEnd={handleDragEnd}
          />
        )}
      </div>
    </div>
  );
} 