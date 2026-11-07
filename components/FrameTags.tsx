"use client";

import { useEffect } from "react";
import { sound } from "@/lib/sound";

interface FrameTagsProps {
  isActive: boolean;
}

const TAG_DEFS = [
  { label: "Branding", side: "l", left: "28%", top: "34%", delay: 0 },
  { label: "3D", side: "r", left: "72%", top: "28%", delay: 120 },
  { label: "Motion", side: "r", left: "68%", top: "54%", delay: 240 },
  { label: "Design engineering", side: "l", left: "24%", top: "68%", delay: 360 },
  { label: "Product design", side: "r", left: "74%", top: "78%", delay: 480 },
];

export function FrameTags({ isActive }: FrameTagsProps) {
  useEffect(() => {
    document.body.classList.toggle("frame-tags-on", isActive);

    if (isActive) {
      TAG_DEFS.forEach((_, idx) => {
        setTimeout(() => {
          sound.playSfx("tag");
        }, idx * 140);
      });
    }

    return () => {
      document.body.classList.remove("frame-tags-on");
    };
  }, [isActive]);

  return (
    <div className="frame-tags" id="frame-tags" aria-hidden={!isActive}>
      {TAG_DEFS.map((tag, idx) => (
        <div
          key={tag.label}
          className={`ft-tag ${tag.side} ${isActive ? "on" : ""}`}
          style={{
            left: tag.left,
            top: tag.top,
            "--i": idx,
          } as React.CSSProperties}
        >
          <i className="ft-dot"></i>
          <i className="ft-lead"></i>
          <span className="mono">{tag.label}</span>
        </div>
      ))}
    </div>
  );
}
