"use client";

import { useEffect, useState, useRef } from "react";
import { Project } from "@/data/site-data";
import { sound } from "@/lib/sound";

interface WorkModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkModal({ project, isOpen, onClose }: WorkModalProps) {
  const [displayedProject, setDisplayedProject] = useState<Project | null>(project);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (project) {
      setDisplayedProject(project);
    }
  }, [project]);

  useEffect(() => {
    if (isOpen) {
      setActiveMediaIndex(0);
      document.documentElement.classList.add("modal-open");
      sound.playSfx("open");
      sound.setModalDucking(true);
    } else {
      document.documentElement.classList.remove("modal-open");
      sound.setModalDucking(false);
    }

    return () => {
      document.documentElement.classList.remove("modal-open");
      sound.setModalDucking(false);
    };
  }, [isOpen]);

  const handleClose = () => {
    sound.playSfx("close");
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !displayedProject) return;
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowRight") {
        setActiveMediaIndex((prev) => (prev + 1) % displayedProject.media.length);
        sound.playSfx("hover");
      } else if (e.key === "ArrowLeft") {
        setActiveMediaIndex((prev) => (prev - 1 + displayedProject.media.length) % displayedProject.media.length);
        sound.playSfx("hover");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, displayedProject]);

  const currentMedia = displayedProject?.media[activeMediaIndex];

  const handleStep = (delta: number) => {
    if (!displayedProject) return;
    setActiveMediaIndex((prev) => {
      const total = displayedProject.media.length;
      return (prev + delta + total) % total;
    });
    sound.playSfx("hover");
  };

  return (
    <div
      className={`work-modal ${isOpen ? "open" : ""}`}
      id="work-modal"
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-labelledby="wm-title"
      style={{ "--pc": displayedProject?.color || "#3b7bff" } as React.CSSProperties}
    >
      <div
        className="wm-backdrop"
        onClick={handleClose}
        data-close
      ></div>

      <article className="wm-glass">
        <header className="wm-head">
          <h3 className="wm-title" id="wm-title">
            {displayedProject?.name}
          </h3>
          <p className="wm-desc" id="wm-desc">
            {displayedProject?.desc}
          </p>
          <button
            className="wm-close"
            onClick={handleClose}
            aria-label="Close"
            onMouseEnter={() => sound.playSfx("hover")}
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              aria-hidden="true"
            >
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="wm-stage" id="wm-stage">
          {currentMedia && currentMedia.type === "video" ? (
            <video
              ref={videoRef}
              key={currentMedia.src}
              src={currentMedia.src}
              playsInline
              autoPlay
              controls={currentMedia.sound}
              muted={!currentMedia.sound}
              loop={!currentMedia.sound}
            />
          ) : currentMedia ? (
            <img
              key={currentMedia.src}
              src={currentMedia.src}
              alt={`${displayedProject?.name || "Work"} — sample ${activeMediaIndex + 1}`}
              decoding="async"
            />
          ) : null}

          {currentMedia?.label && (
            <p className={`wm-cap mono ${currentMedia.sound ? "wm-cap-hi" : ""}`}>
              {currentMedia.label}
            </p>
          )}
        </div>

        <footer className="wm-foot">
          <div className="wm-thumbs" id="wm-thumbs">
            {displayedProject?.media.map((med, idx) => {
              const isSelected = idx === activeMediaIndex;
              return (
                <button
                  key={idx}
                  className={`wm-thumb ${isSelected ? "on" : ""}`}
                  aria-label={med.label || `${displayedProject.name} — ${idx + 1}`}
                  onClick={() => {
                    setActiveMediaIndex(idx);
                    sound.playSfx("click");
                  }}
                  onMouseEnter={() => sound.playSfx("hover")}
                  style={
                    med.type === "image"
                      ? { backgroundImage: `url("${med.src}")` }
                      : undefined
                  }
                >
                  {med.type === "video" && (
                    <>
                      <video
                        src={med.thumb || med.src}
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget;
                          v.currentTime = Math.min(1.2, (v.duration || 2) / 3);
                        }}
                      />
                      <span className="mono">{med.label || "Film"}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <nav className="wm-nav" aria-label="Media">
            <button
              id="wm-prev"
              aria-label="Previous"
              onClick={() => handleStep(-1)}
              onMouseEnter={() => sound.playSfx("hover")}
            >
              ←
            </button>
            <button
              id="wm-next"
              aria-label="Next"
              onClick={() => handleStep(1)}
              onMouseEnter={() => sound.playSfx("hover")}
            >
              →
            </button>
          </nav>
        </footer>
      </article>
    </div>
  );
}
