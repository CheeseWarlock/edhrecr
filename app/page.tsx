import { getCards } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { Card } from "./types";
import { GameContent } from './components/GameContent';

export default async function Home() {
  let dailyCardsData: { cards: Card[], date: string };
  if (process.env.USE_LIVE_DATA === "true") {
    dailyCardsData = (await getCards());
  } else {
    dailyCardsData = {
      cards: dummyData.cards.slice(0, Number.parseInt(process.env.DUMMY_DATA_SIZE || "7")),
      date: dummyData.date
    }
  }

  return <GameContent cards={dailyCardsData.cards} date={dailyCardsData.date} />;
}
