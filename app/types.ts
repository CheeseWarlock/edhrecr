/**
 * The relevant fields of a card as returned by the Scryfall API.
 */
type ScryfallCard = {
    name: string;
    image_uris?: {
      normal?: string;
    };
    edhrec_rank?: number;
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

type DailyCollection = {
  cards: Card[];
  date: string;
}

export type { ScryfallCard, Card, DailyCollection };
