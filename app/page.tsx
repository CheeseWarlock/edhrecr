import { SortableList } from "./components/sortable/SortableList";
import { getCards } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { Card } from "./types";

export default async function Home() {
  let cards: Card[];
  if (process.env.USE_LIVE_DATA === "true") {
    cards = await getCards();
  } else {
    cards = dummyData.slice(0, Number.parseInt(process.env.DUMMY_DATA_SIZE || "7"));
  }
  return (
    <div className="grid grid-rows-[40px_1fr] items-center justify-items-center min-h-screen md:p-8 font-[family-name:var(--font-geist-sans)] flex justify-center">
      <main className="flex flex-col h-full row-start-2">
        <SortableList cards={cards} />
      </main>
    </div>
  );
}
