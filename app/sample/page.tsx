import sampleGameCards from "../lib/sample-game-cards.json"
import { NonPersistentGameContent } from "../components/NonPersistentGameContent";

export default async function Home() {

    const dailyCardsData = {
      cards: sampleGameCards.cards,
      date: sampleGameCards.date
    };
  

  return <NonPersistentGameContent cards={dailyCardsData.cards} date={dailyCardsData.date} />;
}

export const dynamic = 'force-dynamic';