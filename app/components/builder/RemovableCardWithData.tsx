'use client';

import { Card } from "@/app/types";
import { CardImage } from "../CardImage";

interface RemovableCardWithDataProps {
  card: Card;
  onRemoveCard: (cardId: string) => void;
}

export default function RemovableCardWithData({ card, onRemoveCard }: RemovableCardWithDataProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <CardImage card={card} width={256} height={357} />
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
  );
} 