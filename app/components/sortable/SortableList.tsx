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
interface Card {
  id: string;
  name: string;
  image_url: string;
  edhrec_rank: number;
}

/**
 * A row of cards representing a previous guess
 */
function PreviousGuess({ guess, correctOrder }: { guess: Card[], correctOrder: Card[] }) {
  const getPositionFeedback = (card: Card, index: number) => {
    const correctIndex = correctOrder.findIndex(c => c.id === card.id);
    if (index === correctIndex) return 'correct';
    if (index < correctIndex) return 'too-low';
    return 'too-high';
  };
  return (<div className="p-6 max-w-[1792px] bg-[#333] mt-6 mb-6 rounded-xl">
    <div className="flex">
      {guess.map((card, cardIndex) => {
        const feedback = getPositionFeedback(card, cardIndex);
        return (
          <div key={card.id} className="relative overflow-hidden rounded-xl flex items-start justify-center h-[100px]">
            <Image 
              src={card.image_url} 
              alt={card.name}
              width={256}
              height={200}
              className="object-contain"
              style={{ 
                mask: `linear-gradient(to bottom, 
                  rgba(0,0,0, 1) 0,   
                  rgba(0,0,0, 1) 23%, 
                  rgba(0,0,0,0) 30%
                ) 100% 0% / 100% 102%`,
              }}
            />
            <div style={{ background: 'linear-gradient(45deg, transparent 42%, #E05617 65%), radial-gradient(#E05617 0%, #E05617 45%, #894218 55%, #E05617 66%)' }}
            className={`absolute bottom-0 p-1 border-2 border-black text-center text-white w-[48px] h-[48px] rounded-full flex items-center justify-center text-xl ${
              feedback === 'correct' ? 'bg-green-500' :
              'bg-red-500'
            }`}>
              {feedback === 'correct' ? '✓' : '✗'}
            </div>
          </div>
        );
      })}
    </div>
  </div>)
}

function CurrentGuess({ cards, correctIndices, onGuessSubmit }: { cards: Card[], correctIndices: boolean[], onGuessSubmit: (cards: Card[]) => void }) {
  /**
  * The items in the current guess
  */
  const [cardsInCurrentGuess, setCardsInCurrentGuess] = useState<Card[]>(cards);

  // Update local state when cards prop changes
  useEffect(() => {
    setCardsInCurrentGuess(cards);
  }, [cards]);

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
        onDragEnd={handleDragEnd}
        modifiers={[]}
        autoScroll={false}
      >
        <SortableContext
          items={cardsInCurrentGuess.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-col w-full p-6 bg-[#444] mt-6 mb-6 rounded-xl" style={{ touchAction: 'none' }}>
            <div className="flex flex-row" style={{ touchAction: 'none' }}>
            {cardsInCurrentGuess.map((item, index) => {
              return (
                <SortableItem key={item.id} id={item.id} index={index} leftSkipCount={index == 0 ? initialLeftMargin : 0} rightSkipCount={rightMargins[index]}>
                  <Image 
                    src={item.image_url} 
                    alt={item.name}
                    width={256}
                    height={357}
                    className="object-contain mw-[256px] mh-[357px]"
                    style={{ touchAction: 'none' }}
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
          onClick={() => onGuessSubmit(cardsInCurrentGuess)}
          className="px-8 py-4 bg-[#2694AF] text-white rounded-xl hover:bg-[#1e7a8f] transition-colors text-lg font-semibold"
        >
          Submit Guess
        </button>
        <span>Least Popular ▶</span>
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

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto flex flex-col justify-end">
        <div>
          {guessedOrders.map((guess, guessIdx) => 
            <PreviousGuess guess={guess} key={guessIdx} correctOrder={correctOrder} />
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        <CurrentGuess 
          cards={remainingCards} 
          correctIndices={correctIndices} 
          onGuessSubmit={handleLockInGuess}
        />
      </div>
    </div>
  );
} 