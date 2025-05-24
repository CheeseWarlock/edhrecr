import Image from "next/image";
import { Card } from "../types";
import { useContext } from "react";
import { CardViewerContext } from "./CardViewerContext";

/**
 * A card image that scales elegantly with border radius.
 */
export function CardImage({ card, isDraggable = false }: { card: Card, isDraggable?: boolean }) {
  const callback = useContext(CardViewerContext);
    return (<Image 
        src={card.image_url}
        
        onClick={() => { callback(card) }}
        alt={card.name}
        width={256}
        height={357}
        draggable={false}
        className={`select-none object-contain mw-[256px] mh-[357px] rounded-[5%] ${isDraggable ? "cursor-grab" : "cursor-pointer"}`}
      />);
}