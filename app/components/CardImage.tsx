import Image from "next/image";
import { Card } from "../types";
import { useContext } from "react";
import { CardViewerContext, ClickPosition } from "./CardViewerContext";

/**
 * A card image that scales elegantly with border radius.
 */
export function CardImage({ card, isDraggable = false }: { card: Card, isDraggable?: boolean }) {
  const callback = useContext(CardViewerContext);
  
  const handleClick = (event: React.MouseEvent) => {
    const position: ClickPosition = {
      x: event.clientX,
      y: event.clientY
    };
    callback(card, position);
  };

  return (<Image 
      src={card.image_url}
      onClick={handleClick}
      alt={card.name}
      width={256}
      height={357}
      draggable={false}
      className={`select-none object-contain mw-[256px] mh-[357px] rounded-[5%] ${isDraggable ? "cursor-grab" : "cursor-pointer"}`}
    />);
}