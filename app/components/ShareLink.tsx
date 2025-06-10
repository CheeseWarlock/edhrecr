import { FaShareNodes } from "react-icons/fa6";
import { Card } from "../types";
import { useState } from "react";

function ShareLink({ today, guesses, solution, win }: { today: string | undefined, guesses: Card[][], solution: Card[], win: boolean }) {
  const icon = win ? '✓' :  '✗';
  const share = (today: string | undefined, guesses: Card[][], solution: Card[]) => {
    const resultString = guesses.map((guess) => {
      return guess.map((card, index) => {
        return (index === solution.indexOf(card) ? "🟩" : "⬛")
      }).join("");
    }).join('\n');
    const dateSegment = today ? ` for ${today}` : "";
    const shareData = {
      text: `EDHRanker ${dateSegment} ${icon}\n${resultString}`,
      url: "https://edhranker.vercel.app",
      title: "EDHRanker",
    }

    const useNavigatorShare = /android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) &&
      !/firefox/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare(shareData);
    if (!useNavigatorShare) {
      navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      navigator.share(shareData);
    }
  }

  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
      share(today, guesses, solution);
    }}>
      <FaShareNodes/>
      <span>{isCopied ? "Copied!" : "Share"}</span>
    </div>
  );
}

export default ShareLink;