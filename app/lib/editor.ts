"use server";

import postgres from 'postgres';
import { ScryfallCard } from '../types';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function getPopulatedDays() {
  const today = (new Date()).toISOString().slice(0, 10);
  const populatedDays = await sql`SELECT date FROM collections_v2`;
  const result = populatedDays.map((dayRow => dayRow.date));

  return {
    populatedDays: result,
    today: today
  }
}

export async function addMessage(message: string) {
  console.log("Adding message", message);
  if (!message) {
    return;
  }
  if (typeof message !== 'string') {
    return;
  }
  if (message.length > 200) {
    return;
  }
  if (message.length > 1) {
    const result = await sql`INSERT INTO messages (message) VALUES (${message})`;
    return result;
  }
}

export async function createGame(date: string, title: string, cards: ScryfallCard[]) {

  await sql.begin(async sql => {
    // Check if a collection already exists for this date
    // For now, disallow that
    const existingCollection = await sql`SELECT id FROM collections_v2 WHERE date = ${date}`;
    if (existingCollection.length > 0) {
      return;
    }
    await sql`INSERT INTO collections_v2 (date, title, is_special) VALUES (${date}, ${title}, true)`;
    const latestId = await sql`SELECT id FROM collections_v2 WHERE date = ${date}`;
    const collectionId = latestId[0].id;
    if (!collectionId || typeof collectionId !== 'number') {
      return;
    }
    const cardNames = cards.map(card => card.name);
    const cardImages = cards.map(card => card.image_uris?.normal);
    const cardEdhrecRanks = cards.map(card => card.edhrec_rank);

    if (cardNames.length !== cards.length || cardImages.length !== cards.length || cardEdhrecRanks.length !== cards.length) {
      return;
    }

    const cardData = cardNames.map((name, index) => ({
      name,
      image_uri: cardImages[index],
      edhrec_rank: cardEdhrecRanks[index],
      date: date,
      added_at: date,
      bad_data: false,
      collection_index: collectionId,
      from_editor: true
    }));

    const result = await sql`INSERT INTO cards_v2 ${sql(cardData)}`;
    return result;
  });

  
  // fields:
  // date, edhrec_rank, image_uri, name, added_at, bad_data, collection_index, from_editor

  // const result = await sql`INSERT INTO collections_v2 (date, title, cards) VALUES (${date}, ${title}, ${cards})`;
  // return result;
}
