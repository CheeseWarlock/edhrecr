"use server";

import postgres from 'postgres';
import { Card } from '../types';
import { isAuthenticated } from './auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * Get the days for which a game exists and today's date.
 */
export async function getPopulatedDays() {
  const today = (new Date()).toISOString().slice(0, 10);
  const populatedDays = await sql`SELECT date FROM collections_v2`;
  const result = populatedDays.map((dayRow => dayRow.date));

  return {
    populatedDays: result,
    today: today
  }
}

/**
 * Get the game for a given day, if one exists.
 * This is editor-side, so it can return future games.
 * @param date - The date to get the game for, in YYYY-MM-DD format.
 */
export async function getGameForDay(date: string): Promise<{ cards: Card[], title: string } | null> {
  try {
    // Get the collection info
    const collection = await sql`SELECT title FROM collections_v2 WHERE date = ${date}`;
    if (collection.length === 0) {
      return null;
    }
    
    // Get the cards for this collection
    const cards = await sql`
      SELECT cards_v2.* FROM cards_v2 
      INNER JOIN collections_v2 ON collections_v2.id = cards_v2.collection_index 
      WHERE collections_v2.date = ${date}
    `;
    
    const mappedCards: Card[] = cards.map((card) => ({
      id: card.id,
      name: card.name,
      image_url: card.image_uri,
      edhrec_rank: card.edhrec_rank,
      sort_order: card.sort_order
    }));
    
    return {
      cards: mappedCards,
      title: collection[0].title
    };
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
}

/**
 * Create a new game.
 * If a game already exists for the given date, update it.
 * @param date - The date to create the game for, in YYYY-MM-DD format.
 */
export async function createGame(date: string, title: string, cards: Card[]): Promise<{ success: boolean, error?: string }> {
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
    const existingCollection = await sql`SELECT id FROM collections_v2 WHERE date = ${date}`;
    
    if (existingCollection.length > 0) {
      // Update existing game by deleting existing cards and inserting new ones
      const collectionId = existingCollection[0].id;
      
      await sql`DELETE FROM cards_v2 WHERE collection_index = ${collectionId}`;
      
      await sql`UPDATE collections_v2 SET is_special = true, shuffle = true,  title = ${title} WHERE id = ${collectionId}`;
      
      const cardNames = cards.map(card => card.name);
      const cardImages = cards.map(card => card.image_url);
      const cardEdhrecRanks = cards.map(card => card.edhrec_rank);
      const cardOrders = cards.map(card => card.sort_order);

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
        from_editor: true,
        sort_order: cardOrders[index]
      }));

      await sql`INSERT INTO cards_v2 ${sql(cardData)}`;
      return { success: true };
    } else {
      // Create new game
      await sql`INSERT INTO collections_v2 (date, title, is_special, shuffle) VALUES (${date}, ${title}, true, true)`;
      const latestId = await sql`SELECT id FROM collections_v2 WHERE date = ${date}`;
      const collectionId = latestId[0].id;
      if (!collectionId || typeof collectionId !== 'number') {
        return { success: false, error: "Failed to get collection id" };
      }
      
      const cardNames = cards.map(card => card.name);
      const cardImages = cards.map(card => card.image_url);
      const cardEdhrecRanks = cards.map(card => card.edhrec_rank);
      const cardOrders = cards.map(card => card.sort_order);

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
        from_editor: true,
        sort_order: cardOrders[index]
      }));

      await sql`INSERT INTO cards_v2 ${sql(cardData)}`;
      return { success: true };
    }
  });
  return result;
}
