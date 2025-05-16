import {SortableList} from "./components/sortable/SortableList";
import { getCards } from "./seed/route";

export default async function Home() {
  const cards = await getCards();
  return (
    <div className="grid grid-rows-[40px_1fr_40px] items-center justify-items-center min-h-screen p-8 pb-20 gap-20 sm:p-24 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[48px] row-start-2 items-center sm:items-start w-full">
            <SortableList cards={cards} />
      </main>
    </div>
  );
}
