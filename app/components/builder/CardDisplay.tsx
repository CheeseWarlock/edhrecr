'use client';

import { Card } from "@/app/types";
import RemovableCardWithData from "./RemovableCardWithData";

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
        <RemovableCardWithData
          key={card.id}
          card={card}
          onRemoveCard={onRemoveCard}
        />
      ))}
    </div>
  );
} 