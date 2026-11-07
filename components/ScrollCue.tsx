"use client";

interface ScrollCueProps {
  opacity: number;
}

export function ScrollCue({ opacity }: ScrollCueProps) {
  if (opacity <= 0.01) return null;

  return (
    <div
      className="scroll-cue mono"
      id="cue"
      style={{ opacity }}
    >
      <span>Scroll</span>
      <i></i>
    </div>
  );
}
