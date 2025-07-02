'use client';

import { useState } from "react";
import { GameDayPicker } from "./GameDayPicker";
import { ScryfallCard } from "@/app/types";
import { createGame } from "@/app/lib/editor";

const sortByRankOrUndefined = (a: ScryfallCard, b: ScryfallCard) => {
  const aRank = a.edhrec_rank || 999999;
  const bRank = b.edhrec_rank || 999999;
  return aRank - bRank;
}

type STATE = "INITIAL" | "LOADING" | "NO_RESULTS" | "RESULTS";

export default function BuilderContent({ populatedDays, today }: { populatedDays: Set<string>, today: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<ScryfallCard[]>([]);
  const [state, setState] = useState<STATE>("INITIAL");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [gameDate, setGameDate] = useState<string>(today);
  const [resultsPopup, setResultsPopup] = useState<string>('');

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
      const processedData = data.data.filter((card: ScryfallCard) => card.legalities.commander === 'legal').sort(sortByRankOrUndefined);
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

  const handleDateSelect = (date: Date) => {
    setGameDate(date.toISOString().slice(0, 10));
    setCalendarOpen(false);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  const handleCreateGame = async () => {
    setResultsPopup('Creating game...');
    const result = await createGame(gameDate, title, selectedCards);
    showResultsPopup(result.error || 'Game created successfully');
  }

  const addCardToSelection = (card: ScryfallCard) => {
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
      <div className="flex flex-col gap-2 p-2 shrink-0">
        <div className="flex flex-row items-center">
          <span className="m-2">Game Title: </span>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" />
        </div>
        <div>
          <span>Game Date: </span>
          <button className="bg-[#2694AF] text-white px-2 py-1 rounded-md cursor-pointer" onClick={() => setCalendarOpen(!calendarOpen)}>{gameDate}</button>
          <span>{populatedDays.has(gameDate) ? " Already exists" : ""}</span>
        </div>
        {calendarOpen && <GameDayPicker populatedDays={populatedDays} today={today} gameDate={gameDate} onSelect={handleDateSelect} />}
        <button className="bg-[#2694AF] text-white px-2 py-1 rounded-md cursor-pointer" onClick={handleCreateGame}>Create Game</button>
        {resultsPopup != '' && <div className="absolute bg-[#444] text-white p-2 rounded-md border-2 border-[#dead3d]">{resultsPopup}</div>}
      </div>
      <div className="flex flex-row h-110 bg-[#444] w-full justify-center p-4 shrink-0">
        {selectedCards.length == 0 && <div>
          <div className="flex flex-col">
            <div className="bg-gradient-to-r from-20% from-[#136235] via-50% via-[#43783F] to-80% to-[#136235] rounded-[5%] w-[256px] h-[357px] flex items-center justify-center border-12 border-[#171717]">
              <span className="m-2">No cards selected</span>
            </div>
          </div>
        </div>}
        {selectedCards.map((card) => (
          <div className="flex flex-col" key={card.id}>
            <div className="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
              src={card.image_uris.normal}
              alt={card.name}
              width={256}
              height={357} 
              className={`select-none object-contain mw-[256px] mh-[357px] rounded-[5%]`} />
              <div className="flex flex-row justify-around">
                <span className="m-2">#{card.edhrec_rank}</span>
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
        {state === "LOADING" && <div>Loading...</div>}
        {state === "NO_RESULTS" && <div>No results found</div>}
        {state === "RESULTS" && results.map((result) => (
          <div key={result.id} className="flex flex-row bg-[#444] m-2 p-2 rounded-md gap-2 justify-between w-200">
            <span className="m-2">{result.name}</span>
            <div className="flex flex-row gap-2">
              <span className="m-2">#{result.edhrec_rank}</span>
              <button onClick={() => window.open(`https://edhrec.com/route/?cc=${result.name}`, '_blank')} className="bg-[#2694AF] text-white px-2 py-1 rounded-md cursor-pointer">EDHRec</button>
              <button onClick={() => addCardToSelection(result)} className="bg-[#7C9B13] text-white px-2 py-1 rounded-md cursor-pointer">Add</button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}