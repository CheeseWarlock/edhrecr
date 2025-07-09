'use client';

import { useState } from "react";
import { GameDayPicker } from "./GameDayPicker";
import CardSearch from "./CardSearch";
import GameHeader from "./GameHeader";
import CardDisplay from "./CardDisplay";
import { Card } from "@/app/types";
import { createGame, getGameForDay } from "@/app/lib/editor";

type EDITOR_STATE = "SELECTING_DATE" | "LOADING" | "DISPLAYING";

export default function BuilderContent({ populatedDays, today }: { populatedDays: Set<string>, today: string }) {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [title, setTitle] = useState<string>('');
  const [gameDate, setGameDate] = useState<string | null>(null);
  const [resultsPopup, setResultsPopup] = useState<string>('');
  const [editorState, setEditorState] = useState<EDITOR_STATE>("SELECTING_DATE");

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
      setSelectedCards([...selectedCards, card].sort((a, b) => {
        const aRank = a.edhrec_rank;
        const bRank = b.edhrec_rank;
        return aRank - bRank;
      }));
    }
  }

  const removeCardFromSelection = (cardId: string) => {
    setSelectedCards(selectedCards.filter((c) => c.id !== cardId));
  }

  const handleReorderCards = (newOrder: Card[]) => {
    setSelectedCards(newOrder);
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
          setSelectedCards(gameData.cards.sort((a, b) => a.edhrec_rank - b.edhrec_rank));
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
    const result = await createGame(gameDate, title, selectedCards);
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
          <CardDisplay 
            selectedCards={selectedCards} 
            onRemoveCard={removeCardFromSelection}
            onReorderCards={handleReorderCards}
          />
          <CardSearch onAddCard={addCardToSelection} />
        </>
      )}
    </div>
  );
}