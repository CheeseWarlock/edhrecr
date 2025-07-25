'use client';

import { useState } from "react";
import { ScryfallCard, Card } from "@/app/types";
import CardSearchResult from "./CardSearchResult";

const sortByRankOrUndefined = (a: ScryfallCard, b: ScryfallCard) => {
  const aRank = a.edhrec_rank || 999999;
  const bRank = b.edhrec_rank || 999999;
  return aRank - bRank;
}

type SEARCH_STATE = "INITIAL" | "LOADING" | "NO_RESULTS" | "RESULTS";

interface CardSearchProps {
  onAddCard: (card: Card) => void;
}

export default function CardSearch({ onAddCard }: CardSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [searchState, setSearchState] = useState<SEARCH_STATE>("INITIAL");

  const handleSearch = async () => {
    setResults([]);
    setSearchState("LOADING");
    const headers = new Headers();
    headers.append('User-Agent', 'EDHRanker/1.0');
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${query}`, {cache: 'no-store', headers});
    const data = await response.json();
    if (data.data) {
      const processedData = data.data
        .filter((card: ScryfallCard) => card.legalities.commander === 'legal' && card.edhrec_rank != null)
        .sort(sortByRankOrUndefined);
      setResults(processedData);
      setSearchState("RESULTS");
    } else {
      setSearchState("NO_RESULTS");
      setResults([]);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  const handleAddCard = (card: Card) => {
    onAddCard(card);
  }

  return (
    <>
      <div className="flex flex-row shrink-0">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          onKeyDown={handleKeyDown}
          placeholder="(Supports Scryfall syntax)"
          className="border-2 border-gray-300 rounded-md p-2 w-100" 
        />
        <button className="bg-mana-blue text-white px-2 py-1 rounded-md cursor-pointer" onClick={handleSearch}>Search</button>
      </div>
      <div className="flex flex-col shrink overflow-y-auto w-screen items-center">
        {searchState === "LOADING" && <div className="text-white">Loading...</div>}
        {searchState === "NO_RESULTS" && <div className="text-white">No results found</div>}
        {searchState === "RESULTS" && results.map((result) => (
          <CardSearchResult key={result.id} result={result} handleAddCard={handleAddCard} /> 
        ))}
      </div>
    </>
  );
} 