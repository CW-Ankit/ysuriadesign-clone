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
  return (
    <div className="work-labels" id="work-labels" aria-hidden={!isVisible}>
      {PROJECTS.map((proj, idx) => {
        const isCurrent = isVisible && idx === activeProjectIndex;
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
            tabIndex={isCurrent ? 0 : -1}
          >
            <div className="wl-row mono">
              <span className="wl-num">{numStr}</span>
              <span className="wl-rule"></span>
              <span className="wl-tag">{proj.tag}</span>
            </div>
            <span className="wl-name">{proj.name}</span>
            <span className="wl-cta mono">
              Explore work <i aria-hidden="true">↗</i>
            </span>
          </button>
        );
      })}
    </div>
  );
}
