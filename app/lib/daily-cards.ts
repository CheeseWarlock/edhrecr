import postgres from 'postgres';
import { addDays } from 'date-fns';
import { Card, ServerResponse } from '../types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * The date at which the migration to v2 occurred, in YYYY-MM-DD format.
 * Before this date, use the old cards and collections tables.
 * After this date, use the new cards and collections tables.
 */
const MIGRATION_DATE = "2025-07-06";

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
    SELECT (cards_v2.*) FROM cards_v2 INNER JOIN collections_v2 ON collections_v2.id = cards_v2.collection_index WHERE collections_v2.date = ${pastDay};
  `;
  console.log(result);
  const mapped: Card[] = result.map((card) => ({
    id: card.id,
    name: card.name,
    image_url: card.image_uri,
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
 * Cron job.
 * Generate a new daily collection for two days from now so it's ready to go when the day arrives.
 * Takes 7 cards that haven't been used yet and adds them to the collection.
 */
export async function generateDailyCollectionV2() {
  const today = (new Date()).toISOString().slice(0, 10);
  const twoDaysFromToday = addDays(new Date(today), 2).toISOString().slice(0, 10);
  const result = await sql.unsafe(`
    BEGIN;
    SELECT max(id) FROM collections_v2;
    INSERT INTO collections_v2 (date, title, is_special) VALUES ('${twoDaysFromToday}', 'Daily Collection', false);
    WITH cte AS (SELECT * FROM cards_v2 WHERE collection_index IS NULL ORDER BY id DESC OFFSET 20 LIMIT 7) UPDATE cards_v2 c SET collection_index = (SELECT max(id) FROM collections_v2) FROM cte WHERE c.id = cte.id;
    COMMIT;
  `);
  return result;
}

/**
 * Cron job.
 * Makes Scryfall API calls to get up to 10 random cards that are legal in Commander.
 */
export async function generateCardsV2() {
  const today = (new Date()).toISOString().slice(0, 10);
  let attempts = 0;
  const millis = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const cards: Card[] = [];
  const requests: Promise<Response>[] = [];

  const headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');
    headers.append('Cache-Control', 'no-cache');
    headers.append('User-Agent', 'EDHRanker/1.0');

  while (attempts < 10) {
    if (attempts > 0) await millis(1000);
    requests.push(fetch(`https://api.scryfall.com/cards/random?q=legal%3Acommander&idx=${attempts}`, {cache: 'no-store', headers}));
    attempts++;
  }

  const responses = await Promise.allSettled(requests);
  for (const response of responses) {
    if (response.status === 'fulfilled') {
      const data = await response.value.json();
      const isDataGood = data.edhrec_rank !== null && data.image_uris !== null && data.image_uris.normal !== null;
      await sql`
        INSERT INTO cards_v2 (date, edhrec_rank, image_uri, name, added_at, bad_data)
        VALUES (${today}, ${data.edhrec_rank}, ${data.image_uris.normal}, ${data.name}, ${new Date().toISOString()}, ${!isDataGood})
      `;
      if (isDataGood) {
        cards.push({
          id: data.id,
          name: data.name,
          image_url: data.image_uris.normal,
          edhrec_rank: data.edhrec_rank
        });
      }
    } else {
      // Promise rejected- why?
      console.error(response.reason);
      await sql`
        INSERT INTO fetcherrors (date, failure_reason)
        VALUES (${today}, ${response.reason})
      `
    }
  }
  return cards;
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
  if (pastDay < MIGRATION_DATE) {
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