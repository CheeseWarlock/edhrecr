import postgres from 'postgres';
// import TEST_DATA from '../lib/test.json';
// import BULK_DATA from '../lib/oracle-cards-20250514210930.json';
// import MINI_BULK_DATA from '../lib/a-few-cards.json';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getCardsForDate(date: string) {
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
    LIMIT 8
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
