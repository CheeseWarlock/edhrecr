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
interface Card {
  id: string;
  name: string;
  image_url: string;
  edhrec_rank: number;
}

type Feedback = 'correct' | 'off-by-one' | 'incorrect';

function getFeedbackColor(feedback: Feedback) {
  return feedback === 'correct' ? '#7C9B13' : feedback === 'off-by-one' ? '#CEA648' : '#635634';
}

function getFeedbackShadowColor(feedback: Feedback) {
  return feedback === 'correct' ? '#414E00' : feedback === 'off-by-one' ? '#7C6A2E' : '#453D24';
}

function FeedbackMark({ feedback }: { feedback: Feedback }) {
  const color = getFeedbackColor(feedback);
  const shadowColor = getFeedbackShadowColor(feedback);
  return (
    <>
    <div style={{ background: `linear-gradient(45deg, transparent 42%, ${color} 65%), radial-gradient(${color} 0%, ${color} 45%, ${shadowColor} 55%, ${color} 66%)` }}
    className={`flex absolute bottom-0 border-2 border-black text-center text-white md:w-[48px] md:h-[48px] w-[28px] h-[28px] rounded-full items-center justify-center md:text-2xl text-xl`}>
      {feedback === 'correct' ? '✓' : feedback === 'off-by-one' ? '⇔' : '✗'}
    </div>
    </>
  );
}

/**
 * A row of cards representing a previous guess
 */
function PreviousGuess({ guess, correctOrder }: { guess: Card[], correctOrder: Card[] }) {
  const getPositionFeedback = (card: Card, index: number): Feedback => {
    const correctIndex = correctOrder.findIndex(c => c.id === card.id);
    if (index === correctIndex) return 'correct';
    if ((index === correctIndex + 1 || index === correctIndex - 1) && process.env.NEXT_PUBLIC_GIVE_OFF_BY_ONE == 'true') return 'off-by-one';
    return 'incorrect';
  };
  return (<div className="md:px-6 max-w-[1792px] mt-6 mb-6 rounded-xl">
    <div className="flex">
      {guess.map((card, cardIndex) => {
        const feedback = getPositionFeedback(card, cardIndex);
        return (
          <div key={card.id} className={`relative overflow-hidden rounded-t-xl flex items-start justify-center h-[8vw]`}>
            <Image 
              src={card.image_url} 
              alt={card.name}
              width={256}
              height={200}
              className="object-contain"
              style={{ 
                mask: `linear-gradient(to bottom, 
                  rgba(0,0,0, 1) 0,   
                  rgba(0,0,0, 1) 22%, 
                  rgba(0,0,0,0) 28%
                ) 100% 0% / 100% 102%`,
              }}
            />
            <FeedbackMark feedback={feedback} />
          </div>
        );
      })}
    </div>
  </div>)
}

function CurrentGuess({ remainingCards, correctIndices, onGuessSubmit, correctCards }: { remainingCards: Card[], correctIndices: boolean[], onGuessSubmit: (cards: Card[]) => void, correctCards: { card: Card, index: number }[] }) {
  /**
  * The items in the current guess
  */
  const [cardsInCurrentGuess, setCardsInCurrentGuess] = useState<Card[]>(remainingCards);

  // Update local state when cards prop changes
  useEffect(() => {
    setCardsInCurrentGuess(remainingCards);
  }, [remainingCards]);

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
        modifiers={[restrictToParentElement]}
        autoScroll={false}
      >
        <SortableContext
          items={cardsInCurrentGuess.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex flex-col w-full py-6 md:px-6 bg-[#444] max-w-[1792px] mt-0 md:rounded-xl" style={{ touchAction: 'none' }}>
          <div className="flex flex-row" style={{ touchAction: 'none', filter: 'grayscale(1) opacity(0.3)' }}>
        {correctCards.map((data) => {
          return (
          <Image 
            key={data.card.id}
            src={data.card.image_url} 
            alt={data.card.name}
            width={256}
            height={357}
            className={`absolute overflow-hidden rounded-xl`}
            style={{
              marginLeft: `calc(100% * ${data.index / correctIndices.length})`,
              width: `calc(100% * (1 / ${correctIndices.length}))`,
              height: 'auto',
              mask: `linear-gradient(
rgba(0, 0, 0, 0.5) 0px, 
rgb(0, 0, 0) 22%, 
rgb(0, 0, 0) 78%, 
rgba(0, 0, 0, 0.5) 100%) 100% 0% / 100% 102%`
            }}
          />
          )
        })}
      </div>
            <div className="flex flex-row" style={{ touchAction: 'none' }}>
            {cardsInCurrentGuess.map((item, index) => {
              return (
                <SortableItem key={item.id} id={item.id} itemsInGroup={correctIndices.length} leftSkipCount={index == 0 ? initialLeftMargin : 0} rightSkipCount={rightMargins[index]}>
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
      <div className="flex flex-row gap-4 max-w-[1792px] justify-between py-2 px-2 md:px-0">
        <div>
          <div className="flex flex-row gap-2 items-center">
            <span>◀</span><span>Most Popular</span>
          </div>
        </div>
        <button
          onClick={() => onGuessSubmit(cardsInCurrentGuess)}
          className="px-8 py-4 bg-[#2694AF] text-white rounded-xl hover:bg-[#1e7a8f] transition-colors text-lg font-semibold"
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

  const correctCards = correctIndices.map((position, index) => {
    if (!position) return null;
    return { card: options.cards[index], index: index };
  }).filter(item => item != null);

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
        {remainingCards.length == 0 ? (
          <div className="flex flex-col w-full p-6 bg-[#444] max-w-[1792px] mt-0 rounded-xl justify-center items-center">
            <span className="text-white text-2xl font-bold">You won in {guessedOrders.length} guesses!</span>
            <span className="text-white text-lg">Come back tomorrow for another challenge.</span>

          </div>
        ) : (
          <CurrentGuess 
            remainingCards={remainingCards} 
            correctIndices={correctIndices} 
            onGuessSubmit={handleLockInGuess}
            correctCards={correctCards}
          />
        )}
      </div>
    </div>
  );
} 