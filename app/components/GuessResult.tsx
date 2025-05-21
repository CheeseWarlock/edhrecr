import { motion } from "framer-motion";
import { Card } from "../types";
import { CardImage } from "./CardImage";
import { Feedback, FeedbackMark } from "./FeedbackMark";

/**
 * A row of cards representing a previous guess
 */
export function GuessResult({ guess, correctOrder }: { guess: Card[], correctOrder: Card[] }) {
    const getPositionFeedback = (card: Card, index: number): Feedback => {
      const correctIndex = correctOrder.findIndex(c => c.id === card.id);
      if (index === correctIndex) return 'correct';
      if ((index === correctIndex + 1 || index === correctIndex - 1) && process.env.NEXT_PUBLIC_GIVE_OFF_BY_ONE == 'true') return 'off-by-one';
      return 'incorrect';
    };
    return (
      <motion.div
        initial={{ y: 100, height: 0, opacity: 0, marginBottom: 0 }}
        animate={{ y: 0, height: 'auto', opacity: 1, marginBottom: 10 }}
        transition={{ duration: 0.5 }}
        className="flex flex-row w-full md:px-6"
        style={{
          touchAction: 'none',
          mask: `linear-gradient(
            rgba(0, 0, 0, 0.5) 0px, 
            rgb(0, 0, 0) 22%,
            rgb(0, 0, 0) 78%, 
            rgba(0, 0, 0, 0.5) 100%) 100% 0% / 100% 102%`
        }}
      >
        <div className="flex">
          {guess.map((card, cardIndex) => {
            const feedback = getPositionFeedback(card, cardIndex);
            return (
              <div
                  key={card.id}
                  className={`relative overflow-hidden flex items-start justify-center h-[8vw] max-h-[85px]`}>
                  <div
                  className="h-full"
                  style={{ 
                  mask: `linear-gradient(to bottom, 
                      rgba(0,0,0,1) 0,   
                      rgba(0,0,0,1) 50%, 
                      rgba(0,0,0,0) 95%
                  )`,
                  }}
                >
                  <CardImage card={card} />
                </div>
                <FeedbackMark feedback={feedback} />
              </div>
            );
          })}
        </div>
      </motion.div>
    )
  }