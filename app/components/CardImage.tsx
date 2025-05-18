import Image from "next/image";
import { Card } from "../types";

export function CardImage({ card }: { card: Card }) {
    return (<Image 
        src={card.image_url} 
        alt={card.name}
        width={256}
        height={357}
        className="object-contain mw-[256px] mh-[357px] border-[20%]"
        style={{ touchAction: 'none' }}
      />);
}