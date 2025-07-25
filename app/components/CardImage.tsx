import Image from "next/image";
import { Card } from "../types";
import { useContext, useState } from "react";
import { CardViewerContext, ClickPosition } from "./CardViewerContext";

/**
 * A card image that scales elegantly with border radius.
 */
export function CardImage({ card, isDraggable = false, width = 256, height = 357, flippable = false }: { card: Card, isDraggable?: boolean, width?: number, height?: number, flippable?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const callback = useContext(CardViewerContext);
  
  const handleClick = (event: React.MouseEvent) => {
    const position: ClickPosition = {
      x: event.clientX,
      y: event.clientY
    };
    callback(card, position);
  };

  return (
    <div className="relative">
      {flippable && <button className="absolute top-12 right-2 bg-mana-blue text-white px-2 py-1 rounded-md cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>Flip</button>}
    <Image
      src={isFlipped && card.back_face_image_url ? card.back_face_image_url : card.image_url}
      onClick={handleClick}
      alt={card.name}
      width={width}
      height={height}
      draggable={false}
      className={`select-none object-contain rounded-[5%] ${isDraggable ? "cursor-grab" : "cursor-pointer"}`}
    />
    </div>
  );
}