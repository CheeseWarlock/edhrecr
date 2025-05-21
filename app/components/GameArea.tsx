'use client';

import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { Card } from "../types";
import { GuessResult } from "./GuessResult";
import { CurrentGuess } from "./CurrentGuess";
import { CardImage } from "./CardImage";
import BottomBar from "./BottomBar";
import SuccessPanel from "./SuccessPanel";
import FailurePanel from "./FailurePanel";

interface GameAreaProps {
  cards: Card[];
  onPuzzleComplete: () => void;
}

/**
 * The main game area, containing the previous guesses and the current guess
 */
export function GameArea({ cards, onPuzzleComplete }: GameAreaProps) {
    /**
     * The previously guessed orders
     */
    const [guessedOrders, setGuessedOrders] = useState<Card[][]>([]);
    /**
     * The cards not yet placed correctly
     */
    const [remainingCards, setRemainingCards] = useState<Card[]>(cards);
    /**
     * The indices of the cards that have been placed correctly
     */
    const [correctIndices, setCorrectIndices] = useState<boolean[]>(new Array(cards.length).fill(false));
    /**
     * The current guess being built
     */
    const [currentGuess, setCurrentGuess] = useState<Card[]>(cards);

    const correctOrder = ([...cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
  
    useEffect(() => {
      if (remainingCards.length === 0) {
        onPuzzleComplete();
      }
    }, [remainingCards.length, onPuzzleComplete]);
  
    const handleLockInGuess = (cardsInCurrentGuess: Card[]) => {
      const correctOrderForRemainingCards = ([...remainingCards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
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
  
      let currentOrderIndex = 0;
      for (let i = 0; i < cards.length; i++) {
        if (correctIndices[i]) {
          newOrder.push(correctOrder[i]);
        } else {
          newOrder.push(currentGuess[currentOrderIndex++]);
        }
      }
      setGuessedOrders([...guessedOrders, newOrder]);
    };

    const correctCards = correctIndices.map((position, index) => {
      if (!position) return null;
      return { card: correctOrder[index], index: index };
    }).filter(item => item != null);
  
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
          <div className="flex flex-col w-full py-6 md:px-6 bg-[#444] max-w-[1792px] mt-0 md:rounded-xl relative z-10 justify-center" style={{ touchAction: 'none' }}>
          <div className="flex flex-row items-center justify-center mb-4"><span className="text-2xl">{`${5 - guessedOrders.length}/5`}</span><span>&nbsp;guess{5 - guessedOrders.length == 1 ? '' : 'es'} left</span></div>
          {(remainingCards.length == 0) ?
            <SuccessPanel correctCards={correctCards} guessedOrders={guessedOrders} />
          :(guessedOrders.length < 5) ?
          <CurrentGuess 
            remainingCards={currentGuess} 
            correctIndices={correctIndices} 
            correctCards={correctCards}
            onDragEnd={handleDragEnd}
          />
          :
            <FailurePanel cards={correctOrder} />
          }
          </div>
        </div>
      <BottomBar onSubmit={() => { if (remainingCards.length) handleLockInGuess(currentGuess)}} />
      </div>
    );
  } 