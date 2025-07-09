'use client';

import { useState } from "react";
import { GameDayPicker } from "./GameDayPicker";
import CardSearch from "./CardSearch";
import GameHeader from "./GameHeader";
import CardDisplay from "./CardDisplay";
import { Card } from "@/app/types";
import { createGame, getGameForDay } from "@/app/lib/editor";

type EDITOR_STATE = "SELECTING_DATE" | "LOADING" | "DISPLAYING";

type ORDER_MODE = "CORRECT_ORDER" | "DISPLAY_ORDER";

export default function BuilderContent({ populatedDays, today }: { populatedDays: Set<string>, today: string }) {
  /**
   * The cards that are currently selected,
   * in display order regardless of the order mode.
   */
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [title, setTitle] = useState<string>('');
  const [gameDate, setGameDate] = useState<string | null>(null);
  const [resultsPopup, setResultsPopup] = useState<string>('');
  const [editorState, setEditorState] = useState<EDITOR_STATE>("SELECTING_DATE");
  const [orderMode, setOrderMode] = useState<ORDER_MODE>("DISPLAY_ORDER");

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload(); // Refresh to trigger re-authentication
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const showResultsPopup = (results: string) => {
    setResultsPopup(results);
    setTimeout(() => {
      setResultsPopup('');
    }, 3000);
  }

  const addCardToSelection = (card: Card) => {
    if (!selectedCards.some((c) => c.name === card.name)) {
      const newCards = [...selectedCards, card];
      setSelectedCards(newCards);
    }
  }

  const removeCardFromSelection = (cardId: string) => {
    setSelectedCards(selectedCards.filter((c) => c.id !== cardId));
  }

  const handleReorderCards = (newOrder: Card[]) => {
    if (orderMode === "DISPLAY_ORDER") {
      setSelectedCards(newOrder);
    }
  }

  const handleToggleOrderMode = () => {
    if (orderMode === "CORRECT_ORDER") {
      setOrderMode("DISPLAY_ORDER");
    } else {
      setOrderMode("CORRECT_ORDER");
    }
  }

  const handleDateSelect = async (date: Date) => {
    const selectedDate = date.toISOString().slice(0, 10);
    setGameDate(selectedDate);
    setEditorState("LOADING");
    
    try {
      // Check if this date has an existing game
      if (populatedDays.has(selectedDate)) {
        const gameData = await getGameForDay(selectedDate);
        if (gameData) {
          // If the game was auto-generated, the cards won't have an order set.
          // In that case, set a sort order based on the order they came from the database.
          if (gameData.cards.some((card) => card.sort_order == null)) {
            setSelectedCards(gameData.cards.map((card, index) => ({ ...card, sort_order: index })));
          } else {
            setSelectedCards(gameData.cards.sort((a, b) => a.sort_order! - b.sort_order!));
          }
          setTitle(gameData.title);
        } else {
          // Fallback if game data couldn't be loaded
          setSelectedCards([]);
          setTitle('');
        }
      } else {
        // New game - clear any existing cards
        setSelectedCards([]);
        setTitle('');
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      setResultsPopup('Failed to load game data');
    } finally {
      setEditorState("DISPLAYING");
    }
  }

  const handleCreateGame = async () => {
    if (!gameDate) {
      setResultsPopup('Please select a date first');
      return;
    }
    const isUpdate = populatedDays.has(gameDate);
    setResultsPopup(isUpdate ? 'Updating game...' : 'Creating game...');
    const result = await createGame(gameDate, title, [...selectedCards].map((card, index) => ({ ...card, sort_order: index })));
    showResultsPopup(result.error || (isUpdate ? 'Game updated successfully' : 'Game created successfully'));
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-[#222]">
      <div className="absolute top-4 right-4 shrink-0">
        <button 
          onClick={handleLogout}
          className="bg-mana-red text-white px-3 py-1 rounded-md transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
      
      {editorState === "SELECTING_DATE" && (
        // Day Selection Interface
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold mb-6 text-white">Select a Game Date</h1>
          <div className="bg-[#444] p-4 rounded-lg">
            <GameDayPicker 
              populatedDays={populatedDays} 
              today={today} 
              gameDate={today} 
              onSelect={handleDateSelect} 
            />
            {gameDate && (
              <button className="bg-mana-blue text-white px-2 m-2 h-12 rounded-md cursor-pointer" onClick={() => setEditorState("DISPLAYING")}>Cancel</button>
            )}
          </div>
        </div>
      )}
      {editorState === "LOADING" && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      )}
      {editorState === "DISPLAYING" && (
        // Card Selection Interface
        <>
          <GameHeader
            title={title}
            gameDate={gameDate!}
            isExistingGame={populatedDays.has(gameDate!)}
            onTitleChange={setTitle}
            onBackToDateSelect={() => setEditorState("SELECTING_DATE")}
            onCreateGame={handleCreateGame}
            resultsPopup={resultsPopup}
          />
          
          {/* Order Mode Toggle */}
          <div className="flex flex-row items-center justify-center gap-4 mb-4">
            <span className="text-white text-sm">Card Order:</span>
            <button
              onClick={handleToggleOrderMode}
              className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                orderMode === "CORRECT_ORDER" 
                  ? 'bg-mana-green text-white' 
                  : 'bg-[#666] text-white hover:bg-[#777]'
              }`}
            >
              Correct Order
            </button>
            <button
              onClick={handleToggleOrderMode}
              className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
                orderMode === "DISPLAY_ORDER" 
                  ? 'bg-mana-blue text-white' 
                  : 'bg-[#666] text-white hover:bg-[#777]'
              }`}
            >
              Display Order
            </button>
          </div>
          
          <CardDisplay 
            selectedCards={selectedCards} 
            onRemoveCard={removeCardFromSelection}
            onReorderCards={handleReorderCards}
            isCorrectOrder={orderMode === "CORRECT_ORDER"}
          />
          <CardSearch onAddCard={addCardToSelection} />
        </>
      )}
    </div>
  );
}