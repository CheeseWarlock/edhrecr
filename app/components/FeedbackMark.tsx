
export type Feedback = 'correct' | 'off-by-one' | 'incorrect';

function getFeedbackColor(feedback: Feedback) {
  return feedback === 'correct' ? 'var(--color-mana-green)' : feedback === 'off-by-one' ? '#CEA648' : '#635634';
}

function getFeedbackShadowColor(feedback: Feedback) {
  return feedback === 'correct' ? '#414E00' : feedback === 'off-by-one' ? '#7C6A2E' : '#453D24';
}

/**
 * A small mark that shows correct, incorrect, or off-by-one.
 * Note that off-by-one is only shown if the NEXT_PUBLIC_GIVE_OFF_BY_ONE environment variable is set to true.
 */
export function FeedbackMark({ feedback }: { feedback: Feedback }) {
  const color = getFeedbackColor(feedback);
  const shadowColor = getFeedbackShadowColor(feedback);
  return (
    <>
    <div style={{ background: `linear-gradient(45deg, transparent 42%, ${color} 65%), radial-gradient(${color} 0%, ${color} 45%, ${shadowColor} 55%, ${color} 66%)` }}
    className={`pointer-events-none flex absolute bottom-0 border-2 border-black text-center text-white md:w-[48px] md:h-[48px] w-[28px] h-[28px] rounded-full items-center justify-center md:text-2xl text-xl`}>
      {feedback === 'correct' ? '✓' : feedback === 'off-by-one' ? '⇔' : '✗'}
    </div>
    </>
  );
}