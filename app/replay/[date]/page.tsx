import { getCardsForDay } from "../../lib/daily-cards";
import { Card } from "../../types";
import { NonPersistentGameContent } from '../../components/NonPersistentGameContent';

export default async function Page({ params }: { params: { date: string } }) {
  const {date} = await params;
  const dailyCardsData: { cards: Card[], date: string } = await getCardsForDay(date);

  return <NonPersistentGameContent cards={dailyCardsData.cards} date={dailyCardsData.date} />;
}

export const dynamic = 'force-dynamic';