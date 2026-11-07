"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { sound } from "@/lib/sound";

interface HeaderProps {
  currentChapter: number;
  onJump: (index: number) => void;
  isIndexOpen: boolean;
  onToggleIndex: () => void;
}

export function Header({
  currentChapter,
  onJump,
  isIndexOpen,
  onToggleIndex,
}: HeaderProps) {
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => {
    setIsSoundOn(sound.enabled);
  }, []);

  const handleToggleSound = () => {
    const nextState = sound.toggle();
    setIsSoundOn(nextState);
    sound.playSfx("click");
  };

  const countDisplay = currentChapter >= 0 ? String(currentChapter + 1).padStart(2, "0") : "00";

  return (
    <header className="top">
      <a
        className="mark"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          sound.playSfx("click");
          onJump(0);
        }}
        aria-label="One Thread — back to start"
      >
        <span className="mark-pic" aria-hidden="true">
          <Image
            src="/media/profile.jpg"
            alt=""
            width={30}
            height={30}
            priority
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <b>YS</b>
        </span>
        <span className="mark-word">Yogi&nbsp;Suria</span>
      </a>

      <div className="counter mono" aria-live="polite">
        <span id="count-now">{countDisplay}</span>
        <span className="counter-sep">/</span>
        <span>06</span>
      </div>

      <div className="top-r">
        <button
          className={`sound-btn mono ${isSoundOn ? "on" : ""}`}
          id="sound-btn"
          aria-pressed={isSoundOn}
          aria-label="Sound"
          onClick={handleToggleSound}
          onMouseEnter={() => sound.playSfx("hover")}
        >
          Sound <span>{isSoundOn ? "on" : "off"}</span>
        </button>

        <button
          className="index-btn mono"
          id="index-btn"
          aria-expanded={isIndexOpen}
          aria-controls="index"
          onClick={() => {
            sound.playSfx("click");
            onToggleIndex();
          }}
          onMouseEnter={() => sound.playSfx("hover")}
        >
          Index
        </button>
      </div>
    </header>
  );
}
