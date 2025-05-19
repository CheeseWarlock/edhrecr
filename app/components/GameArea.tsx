'use client';

import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import { Card } from "../types";
import { GuessResult } from "./GuessResult";
import { CurrentGuess } from "./CurrentGuess";
import { CardImage } from "./CardImage";

/**
 * The main game area, containing the previous guesses and the current guess
 */
export function GameArea(options: { cards: Card[] }) {
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
      return { card: correctOrder[index], index: index };
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
            <div className="flex flex-col w-full py-6 md:px-6 bg-[#444] max-w-[1792px] mt-0 md:rounded-xl justify-center items-center relative">
              <div className="w-full flex flex-row" style={{
                touchAction: 'none',
                filter: 'grayscale(1) opacity(0.3)',
                mask: `linear-gradient(
                  rgba(0, 0, 0, 0.5) 0px, 
                  rgb(0, 0, 0) 22%, 
                  rgb(0, 0, 0) 78%, 
                  rgba(0, 0, 0, 0.5) 100%) 100% 0% / 100% 102%`}}>
                {correctCards.map((card, idx) => {
                  return (
                    <div key={idx}style={{ width: `calc(100% * (1 / ${correctCards.length}))` }}>
                      <CardImage card={card.card} />
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col items-center absolute bottom-0 top-0 justify-center">
                <span className="text-white text-2xl font-bold">You won in {guessedOrders.length} guesses!</span>
                <span className="text-white text-lg">Come back tomorrow for another challenge.</span>
              </div>
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