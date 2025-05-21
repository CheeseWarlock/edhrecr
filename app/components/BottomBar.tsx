export default function BottomBar({ onSubmit, disabled } : { onSubmit?: () => void, disabled?: boolean }) {
    return <div className="flex flex-row gap-4 max-w-[1792px] justify-between py-2 px-2 md:px-0">
    <div>
      <div className="flex flex-row gap-2 items-center">
        <span>◀</span><span>Most Popular</span>
      </div>
    </div>
    <button
      onClick={() => onSubmit?.()}
      className={`${disabled ? 'bg-[#aaaaaa]' : 'bg-[#2694AF] cursor-pointer hover:bg-[#1e7a8f]' } px-8 py-4 text-white rounded-xl transition-colors text-lg font-semibold`}
    >
      Submit Guess
    </button>
    <div>
      <div className="flex flex-row gap-2 items-center text-right">
        <span>Least Popular</span><span>▶</span>
      </div>
    </div>
  </div>
}