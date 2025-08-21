"use client";

import { useState } from "react";
import { Metamorphous } from "next/font/google";
import { OverlayFrame } from "./OverlayFrame";
import Link from "next/link";

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
        <ul className="list-disc">
          <li>Is it a staple that can appear in many decks- something you run in your decks or commonly play against?</li>
          <li>Is it powerful in a specific archetype, like a free sacrifice outlet for an Aristocrat deck?</li>
          <li>Does it have something that gives it niche usage, like a creature type or a keyword ability?</li>
          <li>Was it designed for commander, or more for a different format like limited or EDH?</li>
          <li>Does it do something unique, or is it interchangeable with many other cards?</li>
        </ul>
      </div>
    </OverlayFrame>
  );
}