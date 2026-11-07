"use client";

import { sound } from "@/lib/sound";

interface FooterProps {
  onBeginAgain: () => void;
}

export function Footer({ onBeginAgain }: FooterProps) {
  return (
    <footer className="footer" id="footer">
      <div className="ft-bar">
        <div className="ft-l">
          <p className="ft-kick mono">
            <span className="ft-dot" aria-hidden="true"></span>
            Open for new work · 2026
          </p>
          <h2 className="ft-title">
            Let’s build <em>what’s next.</em>
          </h2>
        </div>

        <div className="ft-r">
          <a
            className="ft-mail"
            href="mailto:reachout@yogindersuria.live?subject=Project%20enquiry"
            onMouseEnter={() => sound.playSfx("hover")}
            onClick={() => sound.playSfx("click")}
          >
            reachout@yogindersuria.live<span aria-hidden="true">→</span>
          </a>
          <nav className="ft-links mono" aria-label="Elsewhere">
            <a
              href="https://ysuriadesign.com"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playSfx("hover")}
              onClick={() => sound.playSfx("click")}
            >
              Portfolio ↗
            </a>
            <a
              href="https://x.com/suriadesign"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playSfx("hover")}
              onClick={() => sound.playSfx("click")}
            >
              X ↗
            </a>
            <a
              href="https://www.linkedin.com/in/yogi-suria-a8b787316/"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => sound.playSfx("hover")}
              onClick={() => sound.playSfx("click")}
            >
              LinkedIn ↗
            </a>
          </nav>
        </div>

        <div className="ft-base mono">
          <span>© 2026 Yogi Suria</span>
          <button
            className="ft-again mono"
            onClick={() => {
              sound.playSfx("click");
              onBeginAgain();
            }}
            onMouseEnter={() => sound.playSfx("hover")}
          >
            Begin again ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
