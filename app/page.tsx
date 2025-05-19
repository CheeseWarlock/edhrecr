import { GameArea } from "./components/GameArea";
import { getCards } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { Card } from "./types";
import { TopBar } from './components/TopBar';

export default async function Home() {
  let cards: Card[];
  if (process.env.USE_LIVE_DATA === "true") {
    cards = await getCards();
  } else {
    cards = dummyData.slice(0, Number.parseInt(process.env.DUMMY_DATA_SIZE || "7"));
  }
  return (
    <main className="min-h-screen bg-[#222]">
      <TopBar />
      <div className="pt-16 min-h-[calc(100vh-4rem)] md:p-8 flex items-center justify-center">
        <GameArea cards={cards} />
      </div>
    </main>
  );
}
