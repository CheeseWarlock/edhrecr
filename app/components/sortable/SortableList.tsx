import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { shuffle } from '@/app/utils/shuffle';
import { SortableItem } from './SortableItem';

interface Card {
  id: string;
  name: string;
  image_uris: {
    normal: string;
  };
  edhrec_rank: number;
}

export function SortableList() {
  const [items, setItems] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [guessedOrders, setGuessedOrders] = useState<Card[][]>([]);

  useEffect(() => {
    async function fetchCards() {
      try {
        const response = await fetch('https://api.scryfall.com/cards/search?q=name%3A%2F%5E..x%24%2F+legal%3Acommander');
        const data = await response.json();
        console.log("loaded");
        setItems(shuffle(data.data));
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleLockInGuess = () => {
    addGuessedOrder([...items]);
  };

  const addGuessedOrder = (order: Card[]) => {
    setGuessedOrders([...guessedOrders, order]);
  };

  const getPositionFeedback = (card: Card, index: number) => {
    const correctOrder = ([...items]).sort((a, b) => a.edhrec_rank - b.edhrec_rank);
    const correctIndex = correctOrder.findIndex(c => c.id === card.id);
    if (index === correctIndex) return 'correct';
    if (index < correctIndex) return 'too-low';
    return 'too-high';
  };

  if (loading) {
    return <div className="w-full max-w-4xl mx-auto p-4 text-center">Loading cards...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={handleLockInGuess}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Lock in Guess
        </button>
      </div>
      {guessedOrders.map((guess, guessIdx) => 
        <div className="mt-2" key={guessIdx}>
        <div className="flex gap-4">
          {guess.map((card, index) => {
            const feedback = getPositionFeedback(card, index);
            return (
              <div key={card.id} className="relative overflow-hidden rounded-lg flex items-center justify-center">
                <img 
                  src={card.image_uris.normal} 
                  alt={card.name}
                  className="w-[146px] h-[204px] object-contain"
                />
                <div className={`absolute bottom-0 p-1 text-center text-white w-[40px] h-[40px] rounded-full ${
                  feedback === 'correct' ? 'bg-green-500' :
                  'bg-red-500'
                }`}>
                  {feedback === 'correct' ? '✓' : 'x'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
      

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-4">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                <img 
                  src={item.image_uris.normal} 
                  alt={item.name}
                  className="w-[146px] h-[204px] object-contain"
                />
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
} 