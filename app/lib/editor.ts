"use server";

import postgres from 'postgres';
import { ScryfallCard } from '../types';
import { isAuthenticated } from './auth';

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

export async function createGame(date: string, title: string, cards: ScryfallCard[]): Promise<{ success: boolean, error?: string }> {
  // Check authentication
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return { success: false, error: "Authentication required" };
  }

  if (cards.length > 10) {
    return { success: false, error: "Too many cards selected" };
  } else if (cards.length < 2) {
    return { success: false, error: "Not enough cards selected" };
  }

  const result = await sql.begin(async sql => {
    // Check if a collection already exists for this date
    // For now, disallow that
    const existingCollection = await sql`SELECT id FROM collections_v2 WHERE date = ${date}`;
    if (existingCollection.length > 0) {
      return { success: false, error: "Collection already exists for this date" };
    }
    await sql`INSERT INTO collections_v2 (date, title, is_special) VALUES (${date}, ${title}, true)`;
    const latestId = await sql`SELECT id FROM collections_v2 WHERE date = ${date}`;
    const collectionId = latestId[0].id;
    if (!collectionId || typeof collectionId !== 'number') {
      return { success: false, error: "Failed to get collection id" };
    }
    const cardNames = cards.map(card => card.name);
    const cardImages = cards.map(card => card.image_uris?.normal);
    const cardEdhrecRanks = cards.map(card => card.edhrec_rank);

    if (cardNames.length !== cards.length || cardImages.length !== cards.length || cardEdhrecRanks.length !== cards.length) {
      return { success: false, error: "Card data mismatch" };
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

    await sql`INSERT INTO cards_v2 ${sql(cardData)}`;
    return { success: true };
  });
  return result;
}
