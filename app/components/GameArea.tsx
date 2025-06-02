'use client';

import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { Card } from "../types";
import { GuessResult } from "./GuessResult";
import { CurrentGuess } from "./CurrentGuess";
import BottomBar from "./BottomBar";
import SuccessPanel from "./SuccessPanel";
import FailurePanel from "./FailurePanel";

interface GameAreaProps {
  cards: Card[];
  guessedOrders: Card[][];
  onLockInGuess: (cardsInCurrentGuess: Card[]) => void;
  dateDisplay?: string;
}

/**
 * The main game area, containing the previous guesses and the current guess
 */
export function GameArea({ cards, guessedOrders, onLockInGuess, dateDisplay }: GameAreaProps) {
    const correctOrder = ([...cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
    
    /**
     * The current guess being built.
     * Contains all cards, even if they've been placed correctly.
     */
    const [currentGuess, setCurrentGuess] = useState<Card[]>(guessedOrders[guessedOrders.length - 1] || cards);

    const mostRecentGuess = guessedOrders[guessedOrders.length - 1] || cards;
  
    const correctnessByIndex = guessedOrders.length ? correctOrder.map((card, index) => {
      return mostRecentGuess.indexOf(card) === index;
    }) : new Array(cards.length).fill(false);
  
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
  
      if (over && active.id !== over.id) {
        const movableCards = currentGuess.filter((_, index) => !correctnessByIndex[index]);
        const oldIndex = movableCards.findIndex((item) => item.id === active.id);
        const newIndex = movableCards.findIndex((item) => item.id === over.id);
        const newOrderForMovableCards = arrayMove([...movableCards], oldIndex, newIndex);

        // Rearrange the array, leaving the correct cards in place
        const nextGuess = [];
        for (let i = 0; i < currentGuess.length; i++) {
          if (correctnessByIndex[i]) {
            nextGuess.push(currentGuess[i]);
          } else {
            nextGuess.push(newOrderForMovableCards[0]);
            newOrderForMovableCards.shift();
          }
        }

        setCurrentGuess(nextGuess);
      }
    };

    const dateString = dateDisplay ? new Date(dateDisplay).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined;

    const won = correctnessByIndex.every((index) => index);
    const lost = guessedOrders.length == 5;
    const gameOver = won || lost;
  
    return (
      <div className="w-full h-full flex flex-col">
        <div className="max-w-[1792px] flex-1 overflow-y-visible flex flex-col justify-end">
          <div>
            {guessedOrders.map((guess, guessIdx) => 
              <GuessResult guess={guess} key={guessIdx} correctOrder={correctOrder} />
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="flex flex-col w-full py-6 md:px-6 bg-[#444] max-w-[1792px] mt-0 md:rounded-xl relative z-10 justify-center">
            {dateString && <div className={`text-center mb-4 ${gameOver ? 'text-[#999]' : ''}`}>Replaying game for {dateString}</div>}
          <div className={`flex flex-row items-center justify-center mb-4 ${gameOver ? 'text-[#999]' : ''}`}><span className="text-2xl">{`${5 - guessedOrders.length}/5`}</span><span>&nbsp;guess{5 - guessedOrders.length == 1 ? '' : 'es'} left</span></div>
          {won ?
            <SuccessPanel cards={currentGuess} guessCount={guessedOrders.length} />
          : lost ?
            <FailurePanel cards={correctOrder} />
          :
          <CurrentGuess 
            cards={currentGuess} 
            correctnessByIndex={correctnessByIndex}
            onDragEnd={handleDragEnd}
          />
          }
          </div>
        </div>
      <BottomBar disabled={gameOver} onSubmit={() => { if (!gameOver) onLockInGuess(currentGuess)}} />
      </div>
    );
  } 