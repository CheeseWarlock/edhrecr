'use client';

import { useState } from "react";
import { ScryfallCard, Card } from "@/app/types";

const sortByRankOrUndefined = (a: Card, b: Card) => {
  const aRank = a.edhrec_rank || 999999;
  const bRank = b.edhrec_rank || 999999;
  return aRank - bRank;
}

/**
 * Convert a Scryfall card (Scryfall API format) to a Card (database format)
 */
const convertScryfallCardToCard = (scryfallCard: ScryfallCard): Card => {
  const image_url = scryfallCard.image_uris?.normal ?? scryfallCard.card_faces![0].image_uris.normal;
  return {
    id: scryfallCard.id,
    name: scryfallCard.name,
    image_url,
    edhrec_rank: scryfallCard.edhrec_rank
  };
};

type SEARCH_STATE = "INITIAL" | "LOADING" | "NO_RESULTS" | "RESULTS";

interface CardSearchProps {
  onAddCard: (card: Card) => void;
}

export default function CardSearch({ onAddCard }: CardSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
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
        .map(convertScryfallCardToCard)
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
          <div key={result.id} className="flex flex-row bg-[#444] m-2 p-2 rounded-md gap-2 justify-between w-200">
            <span className="m-2 text-white">{result.name}</span>
            <div className="flex flex-row gap-2">
              <span className="m-2 text-white">#{result.edhrec_rank}</span>
                          <button onClick={() => window.open(`https://edhrec.com/route/?cc=${result.name}`, '_blank')} className="bg-mana-blue text-white px-2 py-1 rounded-md cursor-pointer">EDHRec</button>
            <button onClick={() => handleAddCard(result)} className="bg-mana-green text-white px-2 py-1 rounded-md cursor-pointer">Add</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 