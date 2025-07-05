import { getCardsForDayWithAutoVersioning } from "../../lib/daily-cards";
import { Card } from "../../types";
import { NonPersistentGameContent } from '../../components/NonPersistentGameContent';

export default async function Page({ params }: { params: Promise<{ date: string }> }) {
  const {date} = await params;
  const response = await getCardsForDayWithAutoVersioning(date);
  const dailyCardsData: { cards: Card[], date: string } = response.collection;
  const today = response.today;
  return <NonPersistentGameContent cards={dailyCardsData.cards} date={dailyCardsData.date} today={today} />;
}

export const dynamic = 'force-dynamic';