import { getCards } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { Card } from "./types";
import { GameContent } from './components/GameContent';

export default async function Home() {
  let dailyCardsData: { cards: Card[], date: string };
  if (process.env.USE_LIVE_DATA === "true") {
    dailyCardsData = await getCards();
  } else {
    const offset = 0;
    const date = "2024-01-07";
    dailyCardsData = {
      cards: dummyData.cards.slice(offset, offset + Number.parseInt(process.env.DUMMY_DATA_SIZE || "7")),
      date: date
    };
  }

  return <GameContent cards={dailyCardsData.cards} date={dailyCardsData.date} />;
}

export const dynamic = 'force-dynamic';