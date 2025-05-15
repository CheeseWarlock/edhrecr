'use client'

import { useEffect, useState } from "react";
import {SortableList} from "./components/sortable/SortableList";
import { shuffle } from '@/app/utils/shuffle';

interface Card {
  id: string;
  name: string;
  image_uris: {
    normal: string;
  };
  edhrec_rank: number;
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch('https://api.scryfall.com/cards/search?q=name%3A%2F%5E..x%24%2F+legal%3Acommander');
        const data = await response.json();
        console.log("loaded", data.data.length);
        setCards(shuffle(data.data));
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <SortableList cards={cards} />
      </main>
    </div>
  );
}
