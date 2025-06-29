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

  const handleSearch = async () => {
    setResults([]);
    setState("LOADING");
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${query}`);
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
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold">Game Builder</h2>
      <div className="flex flex-row">
        <span>Game Title: </span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="border-2 border-gray-300 rounded-md p-2" />
      </div>
      <div>
        <span>Game Date: </span>
        <button className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer" onClick={() => setCalendarOpen(!calendarOpen)}>{gameDate}</button>
        <span>{populatedDays.has(gameDate) ? " Already exists" : ""}</span>
      </div>
      {calendarOpen && <GameDayPicker populatedDays={populatedDays} today={today} gameDate={gameDate} onSelect={handleDateSelect} />}
      <button className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer" onClick={handleCreateGame}>Create Game</button>
      {resultsPopup != '' && <div className="absolute bg-gray-800 text-white p-2 rounded-md p-4 border-2 border-[#dead3d]">{resultsPopup}</div>}
      <div className="flex flex-row h-110 bg-gray-800 w-full justify-center p-4">
        {selectedCards.length == 0 && <div>
          <div className="flex flex-col">
            <div className="bg-gray-900 rounded-[5%] w-[256px] h-[357px] flex items-center justify-center">
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
                <button onClick={() => window.open(`https://edhrec.com/route/?cc=${card.name}`, '_blank')} className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer">EDHRec</button>
                <button onClick={() => setSelectedCards(selectedCards.filter((c) => c.id !== card.id))} className="bg-red-500 text-white px-2 py-1 rounded-md cursor-pointer">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-row">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onKeyDown={handleKeyDown}
          className="border-2 border-gray-300 rounded-md p-2 w-100" 
        />
        <button className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer" onClick={handleSearch}>Search</button>
      </div>
      <div className="flex flex-col flex-wrap">
        {state === "LOADING" && <div>Loading...</div>}
        {state === "NO_RESULTS" && <div>No results found</div>}
        {state === "RESULTS" && results.map((result) => (
          <div key={result.id} className="flex flex-row bg-gray-800 m-2 p-2 rounded-md gap-2 justify-between">
            <span className="m-2">{result.name}</span>
            <div className="flex flex-row gap-2">
              <span className="m-2">#{result.edhrec_rank}</span>
              <button onClick={() => window.open(`https://edhrec.com/route/?cc=${result.name}`, '_blank')} className="bg-blue-500 text-white px-2 py-1 rounded-md cursor-pointer">EDHRec</button>
              <button onClick={() => addCardToSelection(result)} className="bg-green-500 text-white px-2 py-1 rounded-md cursor-pointer">Add</button>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}