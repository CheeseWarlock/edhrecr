import sampleGameCards from "../lib/sample-game-cards.json"
import { NonPersistentGameContent } from "../components/NonPersistentGameContent";
import { getToday } from "../lib/daily-cards";
import { TutorialOverlay } from "../components/TutorialOverlay";

export default async function Home() {
    const dailyCardsData = {
      cards: sampleGameCards.cards,
      date: sampleGameCards.date,
      guesses: 10,
      today: await getToday(),
      title: "Sample Game"
    };

  return <>
    <NonPersistentGameContent
      collection={dailyCardsData}
      today={""}
      shareable={false}
    />
    <TutorialOverlay />
  </>;
}

export const dynamic = 'force-dynamic';