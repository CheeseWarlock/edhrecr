import { getDailyCollectionv2 } from "../lib/daily-cards";
import { NonPersistentGameContent } from "../components/NonPersistentGameContent";

export default async function Home() {
  const dailyCardsData = await getDailyCollectionv2();
  return <NonPersistentGameContent cards={dailyCardsData.collection.cards} date={dailyCardsData.collection.date} today={dailyCardsData.today} />;
}
