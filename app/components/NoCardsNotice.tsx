export default function NoCardsNotice() {
  return (
    <div className="flex flex-col w-full py-6 md:px-6 bg-[#444] max-w-[1792px] mt-0 md:rounded-xl relative z-10 justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">No cards found</h1>
      <p className="text-lg">
        Oops! Something went wrong. The cards for this game could not be found.
      </p>
    </div>
  );
}