import { Card } from "../types";
import { CardImage } from "./CardImage";

export function GhostCardList({ correctCards, correctIndices, positioning }: { correctCards: { card: Card, index: number }[], correctIndices: boolean[], positioning: string }) {
    return (
    <div className="flex flex-row" style={{ filter: 'grayscale(1) opacity(0.3)' }}>
        {correctCards.map((data) => {
          return (
            <div
            className={positioning}
            key={data.card.id}
            style={{
              marginLeft: `calc(100% * ${data.index / correctIndices.length})`,
              width: `calc(100% * (1 / ${correctIndices.length}))`,
              height: 'auto',
              mask: `linear-gradient(
              rgba(0, 0, 0, 0.5) 0px, 
              rgb(0, 0, 0) 22%, 
              rgb(0, 0, 0) 78%, 
              rgba(0, 0, 0, 0.5) 100%) 100% 0% / 100% 102%`
            }}>
              <CardImage card={data.card} />
            </div>
          )
        })}
    </div>
    )
}