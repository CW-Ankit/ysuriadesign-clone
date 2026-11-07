"use client";

import { useMemo } from "react";
import { Chapter } from "@/data/site-data";

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
  const renderedTitle = useMemo(() => {
    if (!chapter) return null;
    let charCount = 0;
    const words = chapter.title.split(" ");
    return words.map((word, wIdx) => {
      const chars = Array.from(word).map((char) => {
        const i = charCount++;
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
      charCount++; // for space
      return (
        <span key={wIdx} className="ch-word">
          {chars}
          {wIdx < words.length - 1 ? "\u00A0" : ""}
        </span>
      );
    });
  }, [chapter]);

  if (!chapter) return null;

  const numStr = String(chapterIndex + 1).padStart(2, "0");

  return (
    <section
      className={`chapter ${isActive ? "on" : ""}`}
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

      <h2 className="ch-title" id="ch-title">
        {renderedTitle}
      </h2>

      {chapter.line && (
        <p className="ch-line" id="ch-line">
          {chapter.line}
        </p>
      )}

      {chapter.stats && chapter.stats.length > 0 && (
        <dl className="ch-stats" id="ch-stats">
          {chapter.stats.map(([num, desc], j) => (
            <div
              key={j}
              style={{ "--j": j } as React.CSSProperties}
            >
              <dt>{num}</dt>
              <dd className="mono">{desc}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
