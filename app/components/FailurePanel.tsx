import { Card } from "../types"
import { CardImage } from "./CardImage"
import ShareLink from "./ShareLink"

export default function FailurePanel({ cards, isPastGame, date, guesses, solution }: {
    cards: Card[],
    isPastGame: boolean,
    date: string,
    guesses: Card[][],
    solution: Card[]
}) {
    return <>
        <div className="w-full flex flex-row" style={{
        filter: 'grayscale(0.5) opacity(0.3)'}}>
        {cards.map((card, idx) => {
            return (
            <div key={idx} style={{
                width: `calc(100% * (1 / ${cards.length}))`,
                }}>
                <CardImage card={card} />
            </div>
            )
        })}
        </div>
        <div
            
            className="flex flex-col items-center absolute bottom-0 top-0 justify-center w-full pointer-events-none left-0">
            <span className="text-white text-2xl font-bold bg-[rgba(68,68,68,0.7)] p-2 rounded-t-md">No more guesses!</span>
            {!isPastGame && <span className="text-white md:text-lg text-center bg-[rgba(68,68,68,0.7)] p-2 rounded-md">Come back tomorrow for another challenge.</span>}
            <span className="text-white md:text-lg text-center bg-[rgba(68,68,68,0.7)] p-2 rounded-b-md">The correct order is shown here.</span>
            <span className="pointer-events-auto"><ShareLink guesses={guesses} solution={solution} today={date} win={false} /></span>
        </div></>
}