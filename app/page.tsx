import { getCards, getToday } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { Card } from "./types";
import { PersistentGameContent } from './components/PersistentGameContent';

export default async function Home() {
  let dailyCardsData: { cards: Card[], date: string };
  if (process.env.USE_LIVE_DATA === "true") {
    const response = await getCards();
    dailyCardsData = response.collection;
  } else {
    const offset = 7;
    const date = "2024-01-21";
    dailyCardsData = {
      cards: dummyData.cards.slice(offset, offset + Number.parseInt(process.env.DUMMY_DATA_SIZE || "7")),
      date: date
    };
  }
  const today = await getToday();

  return <PersistentGameContent cards={dailyCardsData.cards} date={dailyCardsData.date} today={today} />;
}

export const dynamic = 'force-dynamic';