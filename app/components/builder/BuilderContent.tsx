'use client';

import { useState } from "react";
import { GameDayPicker } from "./GameDayPicker";
import { ScryfallCard, Card } from "@/app/types";
import { createGame, getGameForDay } from "@/app/lib/editor";

const sortByRankOrUndefined = (a: Card, b: Card) => {
  const aRank = a.edhrec_rank || 999999;
  const bRank = b.edhrec_rank || 999999;
  return aRank - bRank;
}

/**
 * Convert a Scryfall card (Scryfall API format) to a Card (database format)
 */
const convertScryfallCardToCard = (scryfallCard: ScryfallCard): Card => {
  return {
    id: scryfallCard.id,
    name: scryfallCard.name,
    image_url: scryfallCard.image_uris.normal,
    edhrec_rank: scryfallCard.edhrec_rank
  };
};

type STATE = "INITIAL" | "LOADING" | "NO_RESULTS" | "RESULTS";

export default function BuilderContent({ populatedDays, today }: { populatedDays: Set<string>, today: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [state, setState] = useState<STATE>("INITIAL");
  const [title, setTitle] = useState<string>('');
  const [gameDate, setGameDate] = useState<string | null>(null);
  const [resultsPopup, setResultsPopup] = useState<string>('');
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload(); // Refresh to trigger re-authentication
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = async () => {
    setResults([]);
    setState("LOADING");
    const headers = new Headers();
    headers.append('User-Agent', 'EDHRanker/1.0');
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${query}`, {cache: 'no-store', headers});
    const data = await response.json();
    if (data.data) {
      const processedData = data.data
        .filter((card: ScryfallCard) => card.legalities.commander === 'legal' && card.edhrec_rank != null)
        .map(convertScryfallCardToCard)
        .sort(sortByRankOrUndefined);
      setResults(processedData);
      setState("RESULTS");
    } else {
      setState("NO_RESULTS");
      setResults([]);
    }
  }

  const showResultsPopup = (results: string) => {
    setResultsPopup(results);
    setTimeout(() => {
      setResultsPopup('');
    }, 3000);
  }

  const handleDateSelect = async (date: Date) => {
    const selectedDate = date.toISOString().slice(0, 10);
    setGameDate(selectedDate);
    setIsLoadingGame(true);
    
    try {
      // Check if this date has an existing game
      if (populatedDays.has(selectedDate)) {
        const gameData = await getGameForDay(selectedDate);
        if (gameData) {
          setSelectedCards(gameData.cards);
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
      setIsLoadingGame(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  const handleCreateGame = async () => {
    if (!gameDate) {
      setResultsPopup('Please select a date first');
      return;
    }
    setResultsPopup('Creating game...');
    const result = await createGame(gameDate, title, selectedCards);
    showResultsPopup(result.error || 'Game created successfully');
  }

  const addCardToSelection = (card: Card) => {
    if (!selectedCards.some((c) => c.id === card.id)) {
      setSelectedCards([...selectedCards, card].sort(sortByRankOrUndefined));
    }
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen bg-[#222]">
      <div className="absolute top-4 right-4 shrink-0">
        <button 
          onClick={handleLogout}
          className="bg-[#DC5E25] text-white px-3 py-1 rounded-md transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
      
      {!gameDate ? (
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
            {isLoadingGame && (
              <div className="text-white text-center mt-4">Loading game...</div>
            )}
          </div>
        </div>
      ) : (
        // Card Selection Interface
        <div className="flex flex-col gap-2 p-2 shrink-0">
          <div className="flex flex-row items-center">
            <span className="m-2 text-white">Game Title: </span>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" />
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="text-white">Game Date: {gameDate} {populatedDays.has(gameDate) ? " (Editing existing game)" : " (New game)"}</span>
            <button 
              className="bg-[#7C9B13] text-white px-2 py-1 rounded-md cursor-pointer ml-4"
              onClick={() => setGameDate(null)}
            >
              Change Date
            </button>
          </div>
          <button className="bg-[#2694AF] text-white px-2 py-1 rounded-md cursor-pointer" onClick={handleCreateGame}>Create Game</button>
          {resultsPopup != '' && <div className="absolute bg-[#444] text-white p-2 rounded-md border-2 border-[#dead3d]">{resultsPopup}</div>}
        </div>
      )}
      
      {gameDate && (
        <>
          <div className="flex flex-row h-110 bg-[#444] w-full justify-center p-4 shrink-0">
            {selectedCards.length == 0 && <div>
              <div className="flex flex-col">
                <div className="bg-gradient-to-r from-20% from-[#136235] via-50% via-[#43783F] to-80% to-[#136235] rounded-[5%] w-[256px] h-[357px] flex items-center justify-center border-12 border-[#171717]">
                  <span className="m-2 text-white">No cards selected</span>
                </div>
              </div>
            </div>}
            {selectedCards.map((card) => (
              <div className="flex flex-col" key={card.id}>
                <div className="">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                  src={card.image_url}
                  alt={card.name}
                  width={256}
                  height={357} 
                  className={`select-none object-contain mw-[256px] mh-[357px] rounded-[5%]`} />
                  <div className="flex flex-row justify-around">
                    <span className="m-2 text-white">#{card.edhrec_rank}</span>
                    <button onClick={() => window.open(`https://edhrec.com/route/?cc=${card.name}`, '_blank')} className="bg-[#2694AF] text-white px-2 py-1 rounded-md cursor-pointer">EDHRec</button>
                    <button onClick={() => setSelectedCards(selectedCards.filter((c) => c.id !== card.id))} className="bg-[#DC5E25] text-white px-2 py-1 rounded-md cursor-pointer">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-row shrink-0">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onKeyDown={handleKeyDown}
              placeholder="(Supports Scryfall syntax)"
              className="border-2 border-gray-300 rounded-md p-2 w-100" 
            />
            <button className="bg-[#2694AF] text-white px-2 py-1 rounded-md cursor-pointer" onClick={handleSearch}>Search</button>
          </div>
          <div className="flex flex-col shrink overflow-y-auto w-screen items-center">
            {state === "LOADING" && <div className="text-white">Loading...</div>}
            {state === "NO_RESULTS" && <div className="text-white">No results found</div>}
            {state === "RESULTS" && results.map((result) => (
              <div key={result.id} className="flex flex-row bg-[#444] m-2 p-2 rounded-md gap-2 justify-between w-200">
                <span className="m-2 text-white">{result.name}</span>
                <div className="flex flex-row gap-2">
                  <span className="m-2 text-white">#{result.edhrec_rank}</span>
                  <button onClick={() => window.open(`https://edhrec.com/route/?cc=${result.name}`, '_blank')} className="bg-[#2694AF] text-white px-2 py-1 rounded-md cursor-pointer">EDHRec</button>
                  <button onClick={() => addCardToSelection(result)} className="bg-[#7C9B13] text-white px-2 py-1 rounded-md cursor-pointer">Add</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
    </div>
  );
}