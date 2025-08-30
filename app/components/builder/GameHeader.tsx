'use client';

interface GameHeaderProps {
  title: string;
  creator: string;
  guesses: number;
  gameDate: string;
  isExistingGame: boolean;
  onTitleChange: (title: string) => void;
  onCreatorChange: (creator: string) => void;
  onGuessesChange: (guesses: number) => void;
  onBackToDateSelect: () => void;
  onCreateGame: () => void;
  resultsPopup: string;
}

export default function GameHeader({
  title,
  creator,
  guesses,
  gameDate,
  isExistingGame,
  onTitleChange,
  onCreatorChange,
  onGuessesChange,
  onBackToDateSelect,
  onCreateGame,
  resultsPopup
}: GameHeaderProps) {
  return (
    <div className="flex flex-col gap-2 p-2 shrink-0">
      <div className="flex flex-row items-center">
        <span className="mr-2 text-white font-bold">Game Title: </span>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => onTitleChange(e.target.value)} 
          className="border-2 border-gray-300 rounded-md p-2 grow" 
        />
      </div>
      <div className="flex flex-row items-center">
        <span className="mr-2 text-white font-bold">Game Creator: </span>
        <input 
          type="text" 
          value={creator} 
          onChange={(e) => onCreatorChange(e.target.value)} 
          className="border-2 border-gray-300 rounded-md p-2 grow" 
        />
      </div>
      <div className="flex flex-row items-center">
        <span className="mr-2 text-white font-bold">Max Guesses: </span>
        <input 
          type="number"
          min={1}
          max={10}
          step={1}
          value={guesses} 
          onChange={(e) => onGuessesChange(Number(e.target.value))} 
          className="border-2 border-gray-300 rounded-md p-2 grow" 
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="mr-2 text-white font-bold">Game Date: </span>
        <span className="text-white">
          {gameDate} {isExistingGame ? " (Editing existing game)" : " (New game)"}
        </span>
        <button 
          className="bg-mana-green text-white px-2 py-1 rounded-md cursor-pointer ml-4"
          onClick={onBackToDateSelect}
        >
          Back to Date Select
        </button>
      </div>
      <button 
        className="bg-mana-green text-white px-2 py-1 rounded-md cursor-pointer" 
        onClick={onCreateGame}
      >
        {isExistingGame ? 'Update Game' : 'Create Game'}
      </button>
      {resultsPopup !== '' && (
        <div className="absolute bg-[#444] text-white p-2 rounded-md border-2 border-[#dead3d]">
          {resultsPopup}
        </div>
      )}
    </div>
  );
} 