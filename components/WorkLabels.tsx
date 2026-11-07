"use client";

import { Project, PROJECTS } from "@/data/site-data";
import { sound } from "@/lib/sound";

interface WorkLabelsProps {
  activeProjectIndex: number;
  isVisible: boolean;
  onSelectProject: (project: Project) => void;
}

export function WorkLabels({
  activeProjectIndex,
  isVisible,
  onSelectProject,
}: WorkLabelsProps) {
  if (!isVisible) return null;

  return (
    <div className="work-labels" id="work-labels">
      {PROJECTS.map((proj, idx) => {
        const isCurrent = idx === activeProjectIndex;
        const numStr = String(idx + 1).padStart(2, "0");

        return (
          <button
            key={proj.id}
            className={`wl ${isCurrent ? "on" : ""}`}
            style={{ "--pc": proj.color } as React.CSSProperties}
            onClick={() => {
              sound.playSfx("click");
              onSelectProject(proj);
            }}
            onMouseEnter={() => sound.playSfx("hover")}
          >
            <div className="wl-row mono">
              <span className="wl-num">{numStr}</span>
              <span className="wl-rule"></span>
              <span>{proj.tag}</span>
            </div>
            <h3 className="wl-name">{proj.name}</h3>
            <span className="wl-cta mono">
              Explore work <i aria-hidden="true">↗</i>
            </span>
          </button>
        );
      })}
    </div>
  );
}
