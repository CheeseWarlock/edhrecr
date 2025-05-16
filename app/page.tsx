import {SortableList} from "./components/sortable/SortableList";
// import { getCards } from "./seed/route";

import someCards from "./lib/a-few-cards.json"

export default async function Home() {
  const cards = someCards.map(card => ({
    id: card.id,
    name: card.name,
    image_url: card.image_uris.normal,
    edhrec_rank: card.edhrec_rank || 99999
  }));
  return (
    <div className="grid grid-rows-[40px_1fr_40px] items-center justify-items-center min-h-screen p-8 pb-20 gap-20 sm:p-24 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[48px] row-start-2 items-center sm:items-start w-full">
            <SortableList cards={cards} />
      </main>
    </div>
  );
}
