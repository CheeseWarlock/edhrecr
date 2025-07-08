import postgres from 'postgres';
import { addDays } from 'date-fns';
import { Card, ScryfallCard } from '../types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

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
      const isDataGood = data.edhrec_rank !== null && (data.image_uris?.normal !== null || data.card_faces?.[0]?.image_uris?.normal !== null);
      
      if (isDataGood) {
        const dataAsScryfallCard = data as ScryfallCard;
        const image_url = dataAsScryfallCard.image_uris?.normal ?? dataAsScryfallCard.card_faces![0].image_uris.normal;
        await sql`
          INSERT INTO cards_v2 (date, edhrec_rank, image_uri, name, added_at, bad_data)
          VALUES (${today}, ${dataAsScryfallCard.edhrec_rank}, ${image_url}, ${dataAsScryfallCard.name}, ${new Date().toISOString()}, ${!isDataGood})
        `;
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