"use client";

import { sound } from "@/lib/sound";

export function BasicPortfolioPill() {
  return (
    <a
      className="basic"
      href="https://v1.ysuriadesign.co"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit my basic portfolio"
      onMouseEnter={() => sound.playSfx("hover")}
      onClick={() => sound.playSfx("click")}
    >
      <span className="basic-pill">Visit basic portfolio</span>
      <span className="basic-pill basic-go" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="15" height="15">
          <path
            d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </a>
  );
}
