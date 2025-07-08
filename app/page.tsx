import { getCardsForTodayWithAutoVersioning, getToday } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { DailyCollection } from "./types";
import { PersistentGameContent } from './components/PersistentGameContent';

export default async function Home() {
  let dailyCardsData: DailyCollection;
  if (process.env.USE_LIVE_DATA === "true") {
    const response = await getCardsForTodayWithAutoVersioning();
    dailyCardsData = response.collection;
  } else {
    const offset = 7;
    const date = "2024-01-21";
    dailyCardsData = {
      cards: dummyData.cards.slice(offset, offset + Number.parseInt(process.env.DUMMY_DATA_SIZE || "7")),
      date: date,
      title: "Sample Game"
    };
  }
  const today = await getToday();

  return <PersistentGameContent cards={dailyCardsData.cards} date={dailyCardsData.date} today={today} key={today} title={dailyCardsData.title} />;
}

export const dynamic = 'force-dynamic';