import { getCards } from "./lib/daily-cards";
import dummyData from "./lib/dummy-data.json"
import { Card } from "./types";
import { GameContent } from './components/GameContent';

export default async function Home() {
  let cards: Card[];
  if (process.env.USE_LIVE_DATA === "true") {
    cards = (await getCards()).cards;
  } else {
    cards = dummyData.cards.slice(0, Number.parseInt(process.env.DUMMY_DATA_SIZE || "7"));
  }

  return <GameContent cards={cards} />;
}
