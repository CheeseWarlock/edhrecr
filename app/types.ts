/**
 * The relevant fields of a card as returned by the Scryfall API.
 */
type ScryfallCard = {
  id: string;
  name: string;
  image_uris: {
    normal: string;
  },
  legalities: {
    commander: string;
  },
  edhrec_rank: number;
}

/**
 * A card in the format used internally.
 */
type Card = {
    id: string;
    name: string;
    image_url: string;
    edhrec_rank: number;
}

/**
 * A collection of cards for a challenge.
 */
type DailyCollection = {
  cards: Card[];
  date: string;
}

/**
 * A card collection along with the server's idea of "today".
 */
type ServerResponse = {
  collection: DailyCollection,
  today: string
}

export type { ScryfallCard, Card, DailyCollection, ServerResponse };
