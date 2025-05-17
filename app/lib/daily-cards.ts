import postgres from 'postgres';
import MINI_BULK_DATA from './dummy-data.json';

// Could also load the entire set of bulk data- currently not in repo
// import BULK_DATA from '../lib/oracle-cards-20250514210930.json';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

interface ScryfallCard {
  name: string;
  image_uris?: {
    normal?: string;
  };
  edhrec_rank?: number;
}

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

export async function getCardsForDate(date: string) {
  return await sql`
    SELECT c.*
    FROM cards c
    JOIN collectioncards cc ON c.id = cc.card_id
    JOIN dailycollections dc ON cc.collection_id = dc.id
    WHERE dc.date = ${date}
  `;
}

async function getDailyCards() {
  const today = (new Date()).toISOString().slice(0, 10);

  const precomputed = await getCardsForDate(today);
  if (precomputed.length > 0) {
    return precomputed;
  }

  // If not precomputed, select some random cards
  const randomCards = await sql`
    SELECT c.*
    FROM cards c
    ORDER BY RANDOM()
    LIMIT 7
  `;

  await sql`
    INSERT INTO dailycollections (date, description)
    VALUES (${today}, 'Random daily cards')
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

export async function populateSomeRealCards(count: number, offset: number) {
  const cardBlock = MINI_BULK_DATA.slice(offset, offset + count).filter(card => card.image_uris?.normal && card.edhrec_rank).map((card) => ({
    name: card.name,
    image_url: card.image_uris.normal,
    edhrec_rank: card.edhrec_rank
  }));

  return await sql`INSERT INTO cards ${sql(cardBlock, 'name', 'image_url', 'edhrec_rank')}`;
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

export async function getCards() {
  const result = await getDailyCards();
  const mapped = result.map((card) => ({
    id: card.id,
    name: card.name,
    image_url: card.image_url,
    edhrec_rank: card.edhrec_rank
  }));
  return mapped;
}
