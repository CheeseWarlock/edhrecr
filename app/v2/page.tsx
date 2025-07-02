import { getCardsForToday_better } from "../lib/daily-cards";
import { NonPersistentGameContent } from "../components/NonPersistentGameContent";

export default async function Home() {
  console.log("v2 page");
  const dailyCardsData = await getCardsForToday_better();
  console.log(dailyCardsData);
  return <>
    <span className="text-white text-center absolute top-40 left-0 w-full z-50 text-2xl">v2 Content Preview, will not count towards streak</span>
    <NonPersistentGameContent cards={dailyCardsData.collection.cards} date={dailyCardsData.collection.date} today={dailyCardsData.today} />
  </>;
}
