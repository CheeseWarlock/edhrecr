import postgres from 'postgres';
import MINI_BULK_DATA from './dummy-data.json';
import { Card, ScryfallCard, ServerResponse } from '../types';

// Could also load the entire set of bulk data- currently not in repo
// import BULK_DATA from '../lib/oracle-cards-20250514210930.json';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function createCardsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS cards (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      edhrec_rank INT NOT NULL
    );
    `;
}

export async function createCollectionTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS dailycollections (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      date DATE NOT NULL,
      description TEXT NOT NULL
    )
  `;
}

export async function createCollectionCardTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS collectioncards (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      collection_id UUID NOT NULL,
      card_id UUID NOT NULL,
      FOREIGN KEY (collection_id) REFERENCES dailycollections(id),
      FOREIGN KEY (card_id) REFERENCES cards(id)
    )
  `;
}

export async function getPrecomputedCardsForDay(date: string) {
  return await sql`
    SELECT c.*
    FROM cards c
    JOIN collectioncards cc ON c.id = cc.card_id
    JOIN dailycollections dc ON cc.collection_id = dc.id
    WHERE dc.date = ${date}
  `;
}

async function getOrGenerateCardsForDay(today: string) {
  const precomputed = await getPrecomputedCardsForDay(today);
  if (precomputed.length > 0) {
    return precomputed;
  }

  let randomCards: Card[] = [];

  await sql.begin(async sql => {
    await sql`
      INSERT INTO dailycollections (date, description)
      VALUES (${today}, 'Random daily cards')
    `;
    randomCards = await sql`
      SELECT c.*
      FROM cards c
      ORDER BY RANDOM()
      LIMIT 7
    `;
    const todaysCollection = await sql`SELECT d.id FROM dailycollections d WHERE d.date = ${today} LIMIT 1`;
    const collectionId = todaysCollection[0].id;
    const collectionCards = randomCards.map((card) => ({
      collection_id: collectionId,
      card_id: card.id
    }));
  
    await sql`
      INSERT INTO collectioncards ${sql(collectionCards, 'collection_id', 'card_id')}
    `;
  });

  return randomCards;
}

export async function populateDummyCollection() {
  const today = (new Date()).toISOString().slice(0, 10);
  return await sql`
    INSERT INTO dailycollections (date, description)
    VALUES (${today}, 'Dummy data please ignore')
  `;
}

export async function populateDummyCollectionCards() {
  const cards = await sql`SELECT c.id FROM cards c LIMIT 5`;
  const collection = await sql`SELECT d.id FROM dailycollections d LIMIT 1`;

  const cardIds = cards.map((card) => card.id);
  const collectionId = collection[0].id;
  const insertedCollectionCards = await Promise.all(
    cardIds.map(async (cardId) => {
      return await sql`
        INSERT INTO collectioncards (collection_id, card_id)
        VALUES (${collectionId}, ${cardId})
      `;
    })
  );
  return insertedCollectionCards;
}

export async function clearCardTables() {
  const result = await sql.begin((sql) => [
    sql`TRUNCATE TABLE cards CASCADE`,
    sql`TRUNCATE TABLE collectioncards CASCADE`,
    sql`TRUNCATE TABLE dailycollections CASCADE`
  ]);
  return result;
}

export async function populateSomeRealCards() {
  return await sql`INSERT INTO cards ${sql(MINI_BULK_DATA.cards, 'name', 'image_url', 'edhrec_rank')}`;
}

export async function populateFromBulkData(cards: ScryfallCard[], count: number, offset: number) {
  const cardBlock = cards.slice(offset, offset + count).map((card) => ({
    name: card.name,
    image_url: card.image_uris!.normal,
    edhrec_rank: card.edhrec_rank
  }));

  if (cardBlock.length === 0) {
    return;
  }

  return await sql`INSERT INTO cards ${sql(cardBlock, 'name', 'image_url', 'edhrec_rank')}`;
}

export async function getCards(): Promise<ServerResponse> {
  const today = (new Date()).toISOString().slice(0, 10);
  const result = await getOrGenerateCardsForDay(today);
  const mapped = result.map((card) => ({
    id: card.id,
    name: card.name,
    image_url: card.image_url,
    edhrec_rank: card.edhrec_rank
  }));
  return {
    collection: {
      cards: mapped,
      date: today
    },
    today: today
  };
}

export async function getCardsForDay(day: string): Promise<ServerResponse> {
  const pastDay = day.slice(0, 10);
  const today = (new Date()).toISOString().slice(0, 10);

  const result = await getPrecomputedCardsForDay(pastDay);
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
 * Gets the daily collection from the database.
 */
export async function getDailyCollectionv2() {
  const today = (new Date()).toISOString().slice(0, 10);
  const result = await sql`
    SELECT * FROM dailycollectionsv2 WHERE date = ${today} LIMIT 7
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
      date: today
    },
    today: today
  };
}

/**
 * Makes Scryfall API calls to get 7 random cards that are legal in Commander.
 */
export async function generateDailyCollectionv2() {
  const today = (new Date()).toISOString().slice(0, 10);
  let attempts = 0;
  let successes = 0;
  const millis = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const cards: Card[] = [];

  while (attempts < 10 && successes < 7) {
    attempts++;
    await millis(1000);
    const myHeaders = new Headers();
    myHeaders.append('pragma', 'no-cache');
    myHeaders.append('cache-control', 'no-cache');
    myHeaders.append('Cache-Control', 'no-cache');
    const response = await fetch(`https://api.scryfall.com/cards/random?q=legal%3Acommander&idx=${attempts}`, {cache: 'no-store', headers: myHeaders});
    if (!response.ok) {
      throw new Error('Failed to fetch random card from Scryfall');
    }
    
    const data = await response.json();

    if (data.edhrec_rank === null || data.image_uris === null || data.image_uris.normal === null) {
      continue;
    }

    await sql`
        INSERT INTO dailycollectionsv2 (date, edhrec_rank, image_uri, name)
        VALUES (${today}, ${data.edhrec_rank}, ${data.image_uris.normal}, ${data.name})
      `;
    successes++;
    cards.push({
      id: data.id,
      name: data.name,
      image_url: data.image_uris.normal,
      edhrec_rank: data.edhrec_rank
    });
  }
  return cards;
}

export async function getToday(): Promise<string> {
  const today = (new Date()).toISOString().slice(0, 10);
  return today;
}

export const dynamic = 'force-dynamic';