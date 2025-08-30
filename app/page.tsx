import { getCardsForTodayWithAutoVersioning, getToday } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { DailyCollection } from "./types";
import { PersistentGameContent } from './components/PersistentGameContent';

export default async function Home() {
  let dailyCardsData: DailyCollection;
  if (process.env.USE_LIVE_DATA !== "false") {
    const response = await getCardsForTodayWithAutoVersioning();
    dailyCardsData = response.collection;
  } else {
    const offset = 7;
    const date = "2024-01-21";
    dailyCardsData = {
      cards: dummyData.cards.slice(offset, offset + Number.parseInt(process.env.DUMMY_DATA_SIZE || "7")),
      date: date,
      title: "Sample Game",
      guesses: 5,
    };
  }
  const today = await getToday();

  return <PersistentGameContent
    collection={dailyCardsData}
    today={today}
    key={today}
  />;
}

export const dynamic = 'force-dynamic';