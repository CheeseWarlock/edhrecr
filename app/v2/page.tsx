import { getCardsForToday_better } from "../lib/daily-cards";
import { NonPersistentGameContent } from "../components/NonPersistentGameContent";

export default async function Home() {
  const dailyCardsData = await getCardsForToday_better();
  console.log(dailyCardsData);
  return <NonPersistentGameContent cards={dailyCardsData.collection.cards} date={dailyCardsData.collection.date} today={dailyCardsData.today} />;
}

export const dynamic = 'force-dynamic';