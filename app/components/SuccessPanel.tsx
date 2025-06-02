import { Card } from "../types"
import { CardImage } from "./CardImage"

export default function SuccessPanel({ cards, guessCount }: {
    cards: Card[],
    guessCount: number
}) {
    return <>
              <div className="w-full flex flex-row" style={{
                filter: 'grayscale(1) opacity(0.3)',
                mask: `linear-gradient(
                  rgba(0, 0, 0, 0.5) 0px, 
                  rgb(0, 0, 0) 22%, 
                  rgb(0, 0, 0) 78%, 
                  rgba(0, 0, 0, 0.5) 100%) 100% 0% / 100% 102%`}}>
                {cards.map((card, idx) => {
                  return (
                    <div key={idx} style={{
                      width: `calc(100% * (1 / ${cards.length}))`,
                      animation: `1s linear ${idx * 0.2}s spinner`,
                      animationDelay: `${idx * 0.5}`
                      }}>
                      <CardImage card={card} />
                    </div>
                  )
                })}
              </div>
              <div className="flex flex-col items-center absolute bottom-0 top-0 justify-center w-full pointer-events-none left-0">
                <span className="text-white text-2xl font-bold bg-[rgba(68,68,68,0.7)] p-2 rounded-t-md">You won in {guessCount} guess{guessCount == 1 ? "" : "es"}!</span>
                <span className="text-white md:text-lg text-center bg-[rgba(68,68,68,0.7)] p-2 rounded-md">Come back tomorrow for another challenge.</span>
              </div></>
}