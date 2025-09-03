"use client";

import { useState } from "react";
import { Metamorphous } from "next/font/google";
import { OverlayFrame } from "./OverlayFrame";

const metamorphous = Metamorphous({ 
  weight: '400',
  subsets: ["latin"],
});

export function TutorialOverlay() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <OverlayFrame isOpen={isOpen} onClose={() => {setIsOpen(false)}}>
      <div className="text-white space-y-4">
        <h2 className={`text-2xl md:text-4xl font-bold mb-6 ${metamorphous.className}`}>Tips and Tricks</h2>
        <p>
          Lots of factors can influence a card&apos;s popularity. It can be helpful to think- what would make someone want to put this card in their deck?
          Here&apos;s some ideas for how to evaluate a card:
        </p>
        <ul className="list-disc pl-5">
          <li>Is it a staple that can appear in many decks- maybe something you run in your decks or commonly play against?</li>
          <li>Is it powerful in a specific archetype, like a free sacrifice outlet for an Aristocrat deck?</li>
          <li>Does it have something that gives it niche usage, like a creature type or a keyword ability?</li>
          <li>Was it released too recently to be in a lot of decks, or so long ago it might be forgotten?</li>
          <li>Was it designed for commander, or something like a small efficient creature designed for standard or limited?</li>
          <li>Does it do something unique, or could many other cards fill the same role?</li>
        </ul>
      </div>
    </OverlayFrame>
  );
}