"use client";

import { CHAPTERS } from "@/data/site-data";
import { sound } from "@/lib/sound";

interface IndexMenuProps {
  isOpen: boolean;
  currentChapter: number;
  onJump: (chapterIndex: number) => void;
  onClose: () => void;
}

export function IndexMenu({
  isOpen,
  currentChapter,
  onJump,
  onClose,
}: IndexMenuProps) {
  return (
    <nav
      className={`index ${isOpen ? "open" : ""}`}
      id="index"
      aria-hidden={!isOpen}
    >
      <ol id="index-list">
        {CHAPTERS.map((ch, idx) => {
          const numStr = String(idx + 1).padStart(2, "0");
          const isActive = currentChapter === idx;

          return (
            <li key={ch.id}>
              <a
                href={`#chapter-${idx + 1}`}
                className={isActive ? "on" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  sound.playSfx("click");
                  onJump(idx + 1);
                  onClose();
                }}
                onMouseEnter={() => sound.playSfx("hover")}
              >
                <small>{numStr}</small>
                {ch.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
