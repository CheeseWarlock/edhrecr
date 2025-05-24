import { Card } from "../types"
import { CardImage } from "./CardImage"

export default function FailurePanel({ cards }: {
    cards: Card[]
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
                }}>
                <CardImage card={card} />
            </div>
            )
        })}
        </div>
        <div className="flex flex-col items-center absolute bottom-0 top-0 justify-center w-full items-center pointer-events-none left-0">
        <span className="text-white text-2xl font-bold">No more guesses!</span>
        <span className="text-white md:text-lg text-center">Come back tomorrow for another challenge.</span>
        </div></>
}