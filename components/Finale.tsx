"use client";

interface FinaleProps {
  isActive: boolean;
}

export function Finale({ isActive }: FinaleProps) {
  return (
    <section className={`finale ${isActive ? "on" : ""}`} id="finale">
      <p className="finale-kicker mono">
        Design engineer · Motion designer · Marketer
      </p>
      <h2 className="finale-title">
        One person. <em>One thread.</em>
      </h2>
    </section>
  );
}
