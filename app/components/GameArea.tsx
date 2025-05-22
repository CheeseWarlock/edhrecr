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
import { useLocalStorage } from "../utils/useLocalStorage";

interface GameAreaProps {
  cards: Card[];
  onPuzzleComplete: (guessesCompleted: number) => void;
  onPuzzleFailed: () => void;
  date: string;
}

let didAttemptLoad = false;

/**
 * The main game area, containing the previous guesses and the current guess
 */
export function GameArea({ cards, date, onPuzzleComplete, onPuzzleFailed }: GameAreaProps) {
    const correctOrder = ([...cards]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);

    /**
     * Load previously guessed orders if they're in local storage
     */
    let guessesFromPreviousLoad: Card[][] = [];
    let remainingCardsFromPreviousLoad = cards;
    let correctIndicesFromPreviousLoad: boolean[] = new Array(cards.length).fill(false);
    let currentGuessFromPreviousLoad = cards;

    if (!didAttemptLoad) {
      didAttemptLoad = true;

      const previousLoadString = localStorage.getItem("edhr-guesses");
      const previousLoad = previousLoadString ? JSON.parse(previousLoadString) : null;
      if (previousLoad && previousLoad.date == date) {
        guessesFromPreviousLoad = previousLoad.guesses.map((guess: number[]) => guess.map((cardIdx: number) => cards[cardIdx]));

        if (guessesFromPreviousLoad.length) {
          const lastGuess = guessesFromPreviousLoad[guessesFromPreviousLoad.length - 1];

          remainingCardsFromPreviousLoad = lastGuess.filter((item, index) => {
            return correctOrder.indexOf(item) !== index;
          });

          correctIndicesFromPreviousLoad = correctOrder.map((card, index) => {
            return lastGuess.indexOf(card) === index;
          });

          currentGuessFromPreviousLoad = lastGuess.filter((card, index) => {
            return !(correctIndicesFromPreviousLoad[index]);
          });
        }
      }
    }
    
    /**
     * The previously guessed orders
     */
    const [guessedOrders, setGuessedOrders] = useState<Card[][]>(guessesFromPreviousLoad);
    /**
     * The cards not yet placed correctly
     */
    const [remainingCards, setRemainingCards] = useState<Card[]>(remainingCardsFromPreviousLoad);
    /**
     * The indices of the cards that have been placed correctly
     */
    const [correctIndices, setCorrectIndices] = useState<boolean[]>(correctIndicesFromPreviousLoad);
    /**
     * The current guess being built
     */
    const [currentGuess, setCurrentGuess] = useState<Card[]>(currentGuessFromPreviousLoad);

    const [_storedGuesses, setStoredGuesses] = useLocalStorage<{ date: string, guesses: number[][] }>("edhr-guesses", { date: date, guesses: [] });
  
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

      if (wrongCards.length == 0) {
        onPuzzleComplete(guessedOrders.length + 1);
      } else if (guessedOrders.length == 4) {
        onPuzzleFailed();
      }
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

      setStoredGuesses(
        {
          date: date,
          guesses: [...guessedOrders, newOrder].map(order => order.map(card => cards.indexOf(card)))
        }
      )

      setGuessedOrders([...guessedOrders, newOrder]);
    };

    const correctCards = correctIndices.map((position, index) => {
      if (!position) return null;
      return { card: correctOrder[index], index: index };
    }).filter(item => item != null);

    const gameOver = remainingCards.length == 0 || guessedOrders.length == 5;
  
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
          <div className={`flex flex-row items-center justify-center mb-4 ${gameOver ? 'text-[#999]' : ''}`}><span className="text-2xl">{`${5 - guessedOrders.length}/5`}</span><span>&nbsp;guess{5 - guessedOrders.length == 1 ? '' : 'es'} left</span></div>
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
      <BottomBar disabled={remainingCards.length == 0 || guessedOrders.length == 5} onSubmit={() => { if (remainingCards.length) handleLockInGuess(currentGuess)}} />
      </div>
    );
  } 