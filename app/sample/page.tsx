import sampleGameCards from "../lib/sample-game-cards.json"
import { NonPersistentGameContent } from "../components/NonPersistentGameContent";
import { getToday } from "../lib/daily-cards";

export default async function Home() {
    const dailyCardsData = {
      cards: sampleGameCards.cards,
      date: sampleGameCards.date,
      today: await getToday()
    };

  return <NonPersistentGameContent cards={dailyCardsData.cards} date={dailyCardsData.date} today={dailyCardsData.today} title="Sample Game" shareable={false} />;
}

export const dynamic = 'force-dynamic';