"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Chapter } from "@/data/site-data";
import { sound } from "@/lib/sound";

interface ChapterViewProps {
  chapter: Chapter | null;
  chapterIndex: number;
  progress: number;
  isActive: boolean;
}

export function ChapterView({
  chapter,
  chapterIndex,
  progress,
  isActive,
}: ChapterViewProps) {
  const [displayedChapter, setDisplayedChapter] = useState<Chapter | null>(chapter);
  const [displayedIndex, setDisplayedIndex] = useState<number>(chapterIndex);
  const [isOn, setIsOn] = useState<boolean>(false);
  const swapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (swapTimeoutRef.current) {
      clearTimeout(swapTimeoutRef.current);
    }

    if (!isActive || !chapter || chapter.quiet) {
      setIsOn(false);
      return;
    }

    // If chapter changed, trigger the authentic 380ms exit / swap lifecycle
    if (chapter.id !== displayedChapter?.id) {
      setIsOn(false);
      swapTimeoutRef.current = setTimeout(() => {
        setDisplayedChapter(chapter);
        setDisplayedIndex(chapterIndex);

        // Double requestAnimationFrame guarantees DOM paint before adding .on
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsOn(true);
            sound.playSfx("title");
          });
        });
      }, 380);
    } else {
      setIsOn(true);
    }

    return () => {
      if (swapTimeoutRef.current) {
        clearTimeout(swapTimeoutRef.current);
      }
    };
  }, [chapter, chapterIndex, isActive, displayedChapter?.id]);

  const renderedTitle = useMemo(() => {
    if (!displayedChapter) return null;
    let n = 0;
    const words = displayedChapter.title.split(" ");
    return words.map((word, wIdx) => {
      const chars = Array.from(word).map((char) => {
        const i = n++;
        return (
          <span
            key={i}
            className="ch-char"
            style={{ "--i": i } as React.CSSProperties}
          >
            {char}
          </span>
        );
      });
      return (
        <span key={wIdx}>
          <span className="ch-word">{chars}</span>
          {wIdx < words.length - 1 ? " " : ""}
        </span>
      );
    });
  }, [displayedChapter]);

  const numStr = String(Math.max(1, displayedIndex + 1)).padStart(2, "0");

  return (
    <section
      className={`chapter ${isOn ? "on" : ""}`}
      id="chapter"
      aria-live="polite"
      style={{ "--p": progress.toFixed(3) } as React.CSSProperties}
    >
      <div className="ch-meta mono">
        <span className="ch-num" id="ch-num">
          {numStr}
        </span>
        <span className="ch-rule"></span>
        <span className="ch-kicker">Chapter</span>
      </div>

      <h2 className="ch-title" id="ch-title" aria-label={displayedChapter?.title || ""}>
        {renderedTitle}
      </h2>

      {displayedChapter?.line && (
        <p className="ch-line" id="ch-line">
          {displayedChapter.line}
        </p>
      )}

      {displayedChapter?.stats && displayedChapter.stats.length > 0 && (
        <dl className="ch-stats" id="ch-stats">
          {displayedChapter.stats.map(([num, desc], j) => (
            <div key={j} style={{ "--j": j } as React.CSSProperties}>
              <dt>{num}</dt>
              <dd className="mono">{desc}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
