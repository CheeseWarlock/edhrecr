import { ScryfallCard, Card } from "@/app/types";

/**
 * Convert a Scryfall card (Scryfall API format) to a Card (database format)
 */
const convertScryfallCardToCard = (scryfallCard: ScryfallCard): Card => {
  const image_url = scryfallCard.image_uris?.normal ?? scryfallCard.card_faces![0].image_uris.normal;
  return {
    id: scryfallCard.id,
    name: scryfallCard.name,
    image_url,
    edhrec_rank: scryfallCard.edhrec_rank
  };
};

export default function CardSearchResult({ result, handleAddCard }: { result: ScryfallCard, handleAddCard: (card: Card) => void }) {
  return (
    <div className="flex flex-row bg-[#444] m-2 p-2 rounded-md gap-2 justify-between w-200">
      <div className="flex">
        <span className="m-2 text-white">{result.name}</span>
        <span className="m-2 text-gray-400">{result.set.toUpperCase()} #{result.collector_number}</span>
      </div>
      <div className="flex flex-row gap-2">
        <span className="m-2 text-white">#{result.edhrec_rank}</span>
        <button onClick={() => window.open(`https://edhrec.com/route/?cc=${result.name}`, '_blank')} className="bg-mana-blue text-white px-2 py-1 rounded-md cursor-pointer">EDHRec</button>
      <button onClick={() => handleAddCard(convertScryfallCardToCard(result))} className="bg-mana-green text-white px-2 py-1 rounded-md cursor-pointer">Add</button>
      </div>
    </div>
  );
}