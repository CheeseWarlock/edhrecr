import postgres from 'postgres';
import { Card, ServerResponse } from '../types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * The date at which the migration to v2 occurred, in YYYY-MM-DD format.
 * Before this date, use the old cards and collections tables.
 * After this date, use the new cards and collections tables.
 * If the migration date is not set, always use the new tables.
 */
const MIGRATION_DATE = process.env.MIGRATION_DATE;

/**
 * Get the v1 cards for a given day.
 * This references the old cards and collections tables, so trying to
 * get a game from beyond the migration date will return an empty collection.
 * @param day - The date to get the cards for, in YYYY-MM-DD format.
 * @returns The cards for the day.
 */
async function getCardsForDay(day: string): Promise<ServerResponse> {
  const pastDay = day.slice(0, 10);
  const today = (new Date()).toISOString().slice(0, 10);

  const result = await sql`
  SELECT c.*
  FROM cards c
  JOIN collectioncards cc ON c.id = cc.card_id
  JOIN dailycollections dc ON cc.collection_id = dc.id
  WHERE dc.date = ${pastDay}
`;
  const mapped = result.map((card) => ({
    id: card.id,
    name: card.name,
    image_url: card.image_url,
    edhrec_rank: card.edhrec_rank
  }));
  return {
    collection: {
      cards: mapped,
      date: pastDay
    },
    today: today
  };
}

/**
 * Get the daily collection for a given day from the database.
 * @param day - The day to get the collection for, in YYYY-MM-DD format.
 */
async function getCardsForDayV2(day: string) {
  const pastDay = day.slice(0, 10);
  const today = (new Date()).toISOString().slice(0, 10);
  const result = await sql`
    SELECT (cards_v2.*), collections_v2.title, collections_v2.is_special FROM cards_v2 INNER JOIN collections_v2 ON collections_v2.id = cards_v2.collection_index WHERE collections_v2.date = ${pastDay}  ORDER BY cards_v2.sort_order ASC, cards_v2.id ASC;
  `;
  const mapped: Card[] = result.map((card) => ({
    id: card.id,
    name: card.name,
    image_url: card.image_uri,
    edhrec_rank: card.edhrec_rank
  }));
  return {
    collection: {
      cards: mapped,
      date: pastDay,
      title: result[0].is_special && result[0].title
    },
    today: today
  };
}

/**
 * Get the collection for a given day, for client-side purposes.
 * Beyond a certain date, get the v2 cards.
 * Earlier games use the old cards table.
 * If the day is in the future, return an empty collection.
 */
export async function getCardsForDayWithAutoVersioning(day: string): Promise<ServerResponse> {
  const today = (new Date()).toISOString().slice(0, 10);
  const pastDay = day.slice(0, 10);
  // Protect against users trying to load games from the future
  // Comparing strings looks sketchy, but it works for YYYY-MM-DD format
  if (pastDay > today) {
    return {
      collection: {
        cards: [],
        date: pastDay
      },
      today: today
    };
  }
  if (MIGRATION_DATE && pastDay < MIGRATION_DATE) {
    return await getCardsForDay(pastDay);
  } else {
    return await getCardsForDayV2(pastDay);
  }
}

/**
 * Get the collection for today, for client-side purposes.
 */
export async function getCardsForTodayWithAutoVersioning(): Promise<ServerResponse> {
  const today = (new Date()).toISOString().slice(0, 10);
  return await getCardsForDayWithAutoVersioning(today);
}

/**
 * Get the current date (in server time) in YYYY-MM-DD format.
 */
export async function getToday(): Promise<string> {
  const today = (new Date()).toISOString().slice(0, 10);
  return today;
}

export const dynamic = 'force-dynamic';