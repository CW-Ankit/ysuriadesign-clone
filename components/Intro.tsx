"use client";

import { sound } from "@/lib/sound";

interface IntroProps {
  opacity: number;
}

export function Intro({ opacity }: IntroProps) {
  if (opacity <= 0.01) return null;

  return (
    <section
      className="intro"
      id="intro"
      style={{
        opacity: opacity,
        filter: `blur(${((1 - opacity) * 10).toFixed(1)}px)`,
        pointerEvents: opacity > 0.5 ? "auto" : "none",
      }}
    >
      <p className="intro-kicker mono">
        Welcome to the greatest portfolio of 2026 · Opus 5.5 era
      </p>
      <h1 className="intro-title">
        Yogi Suria — design, motion and code, by one person.
      </h1>
      <p className="intro-now">
        <i aria-hidden="true"></i>
        Currently designing at{" "}
        <a
          href="https://jumper.exchange"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => sound.playSfx("hover")}
        >
          Jumper
        </a>
      </p>
    </section>
  );
}
