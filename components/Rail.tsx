"use client";

import { CHAPTERS } from "@/data/site-data";
import { sound } from "@/lib/sound";

interface RailProps {
  currentChapter: number;
  scrollProgress: number;
  onJump: (chapterIndex: number) => void;
}

// Exact authentic rail percentages extracted from analysis/main.js
const RAIL_FRACTIONS = [0, 0.1296, 0.2407, 0.3889, 0.7407, 0.8704];

export function Rail({
  currentChapter,
  scrollProgress,
  onJump,
}: RailProps) {
  return (
    <nav className="rail" id="rail" aria-label="Chapters">
      <i
        className="rail-fill"
        style={{ transform: `scaleY(${Math.min(1, Math.max(0, scrollProgress))})` }}
      ></i>
      {CHAPTERS.map((ch, idx) => {
        const topPercent = (RAIL_FRACTIONS[idx] ?? (idx / (CHAPTERS.length - 1))) * 100;
        const isActive = currentChapter === idx;
        const numStr = String(idx + 1).padStart(2, "0");

        return (
          <a
            key={ch.id}
            href={`#chapter-${idx + 1}`}
            className={isActive ? "on" : ""}
            style={{ top: `${topPercent.toFixed(2)}%` }}
            aria-label={`Chapter ${idx + 1}: ${ch.title}`}
            onClick={(e) => {
              e.preventDefault();
              sound.playSfx("click");
              onJump(idx);
            }}
            onMouseEnter={() => sound.playSfx("hover")}
          >
            <span>
              {numStr} {ch.title}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
