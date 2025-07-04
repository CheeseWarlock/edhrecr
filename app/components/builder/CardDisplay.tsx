'use client';

import { Card } from "@/app/types";

interface CardDisplayProps {
  selectedCards: Card[];
  onRemoveCard: (cardId: string) => void;
}

export default function CardDisplay({ selectedCards, onRemoveCard }: CardDisplayProps) {
  return (
    <div className="flex flex-row bg-[#444] w-full justify-center p-4 shrink-0">
      {selectedCards.length === 0 && (
        <div>
          <div className="flex flex-col mb-22">
            <div className="bg-gradient-to-r from-20% from-[#136235] via-50% via-[#43783F] to-80% to-[#136235] rounded-[5%] w-[256px] h-[357px] flex items-center justify-center border-12 border-[#171717]">
              <span className="m-2 text-white">No cards selected</span>
            </div>
          </div>
        </div>
      )}
      {selectedCards.map((card) => (
        <div className="flex flex-col items-center gap-2" key={card.id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image_url}
            alt={card.name}
            width={256}
            height={357} 
            className={`select-none object-contain mw-[256px] mh-[357px] rounded-[5%]`} 
          />
          <div className="flex flex-row items-center justify-center">
            <span className="m-2 text-white">#{card.edhrec_rank}</span>
            <button 
              onClick={() => window.open(`https://edhrec.com/route/?cc=${card.name}`, '_blank')} 
              className="bg-mana-blue text-white px-2 py-1 rounded-md cursor-pointer"
            >
              EDHRec
            </button>
          </div>
          <div className="flex flex-row justify-center">
            <button 
              onClick={() => onRemoveCard(card.id)} 
              className="bg-mana-red text-white px-2 py-1 rounded-md cursor-pointer"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 