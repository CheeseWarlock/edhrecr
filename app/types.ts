/**
 * The relevant fields of a card as returned by the Scryfall API.
 * Should eventually be replaced with official types when they're stable.
 * This is not an exhaustive list of fields, but only the ones we care about.
 * Some notes:
 * card_faces is defined for double-faced cards as well as split cards, adventures, etc.
 * However, the image_uris field in card_faces is only defined when the card is a double-faced card.
 * To get the "front image" of a card, try the base image_uris first, then the first card_faces.
 */
type ScryfallCard = {
  id: string;
  name: string;
  image_uris?: {
    normal: string;
  },
  legalities: {
    commander: string;
  },
  edhrec_rank: number;
  card_faces?: {
    image_uris: {
      normal: string;
    };
  }[];
  set: string;
  collector_number: string;
}

/**
 * A card in the format returned by the database and used internally.
 */
type Card = {
    /**
     * The ID of the card.
     * Does not relate to any external ID.
     */
    id: string;
    /**
     * The name of the card.
     * Not guaranteed to be unique, as the same card may appear in multiple collections.
     */
    name: string;
    /**
     * The URL of the card's image.
     * Currently points to Scryfall.
     */
    image_url: string;
    /**
     * The URL of the card's back face image, if it's a double-faced card.
     * Currently points to Scryfall.
     */
    back_face_image_url?: string;
    /**
     * The EDHREC rank of the card- lower is more popular.
     */
    edhrec_rank: number;
    /**
     * The sort order of the card in the collection.
     * Cards should be sorted by this field in ascending order.
     * If not provided, the collection should be shuffled client-side
     * regardless of the collection's shuffle setting.
     */
    sort_order?: number;
}

/**
 * A collection of cards for a challenge.
 */
type DailyCollection = {
  cards: Card[];
  date: string;
  /**
   * Whether the cards should be shuffled client-side.
   */
  shuffle?: boolean;
  /**
   * Whether the collection was custom-created.
   */
  is_special?: boolean;
  /**
   * The title of the collection.
   */
  title?: string;
  /**
   * The creator of the collection.
   */
  creator?: string;
}

/**
 * A card collection along with the server's idea of "today".
 */
type ServerResponse = {
  collection: DailyCollection,
  today: string
}

/**
 * A day in the calendar for which a game exists.
 */
type CalendarDay = {
  date: string;
  is_special: boolean;
}

export type { ScryfallCard, Card, DailyCollection, ServerResponse, CalendarDay };
