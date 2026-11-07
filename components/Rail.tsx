"use client";

import { CHAPTERS } from "@/data/site-data";
import { sound } from "@/lib/sound";

interface RailProps {
  currentChapter: number;
  scrollProgress: number;
  onJump: (chapterIndex: number) => void;
}

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
        const topPercent = (idx / (CHAPTERS.length - 1)) * 100;
        const isActive = currentChapter === idx;
        const numStr = String(idx + 1).padStart(2, "0");

        return (
          <a
            key={ch.id}
            href={`#chapter-${idx + 1}`}
            className={isActive ? "on" : ""}
            style={{ top: `${topPercent}%` }}
            aria-label={`Chapter ${idx + 1}: ${ch.title}`}
            onClick={(e) => {
              e.preventDefault();
              sound.playSfx("click");
              onJump(idx + 1);
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
