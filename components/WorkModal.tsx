"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Project } from "@/data/site-data";
import { sound } from "@/lib/sound";

interface WorkModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkModal({ project, isOpen, onClose }: WorkModalProps) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveMediaIndex(0);
      document.documentElement.classList.add("modal-open");
      sound.playSfx("open");
    } else {
      document.documentElement.classList.remove("modal-open");
    }

    return () => {
      document.documentElement.classList.remove("modal-open");
    };
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !project) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setActiveMediaIndex((prev) => (prev + 1) % project.media.length);
        sound.playSfx("hover");
      } else if (e.key === "ArrowLeft") {
        setActiveMediaIndex((prev) => (prev - 1 + project.media.length) % project.media.length);
        sound.playSfx("hover");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, project, onClose]);

  if (!isOpen || !project) return null;

  const currentMedia = project.media[activeMediaIndex];

  const handleStep = (delta: number) => {
    setActiveMediaIndex((prev) => {
      const total = project.media.length;
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
      aria-labelledby="wm-title"
      style={{ "--pc": project.color } as React.CSSProperties}
    >
      <div
        className="wm-backdrop"
        onClick={onClose}
        data-close
      ></div>

      <article className="wm-glass">
        <header className="wm-head">
          <h3 className="wm-title" id="wm-title">
            {project.name}
          </h3>
          <p className="wm-desc" id="wm-desc">
            {project.desc}
          </p>
          <button
            className="wm-close"
            onClick={onClose}
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
            <Image
              key={currentMedia.src}
              src={currentMedia.src}
              alt={project.name}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              priority
              style={{ objectFit: "contain" }}
            />
          ) : null}
        </div>

        <footer className="wm-foot">
          <div className="wm-thumbs" id="wm-thumbs">
            {project.media.map((med, idx) => {
              const isSelected = idx === activeMediaIndex;
              return (
                <button
                  key={idx}
                  className={`wm-thumb ${isSelected ? "on" : ""}`}
                  aria-label={med.label || `${project.name} — ${idx + 1}`}
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
                    <video
                      src={med.thumb || med.src}
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}
                  <span className="mono">{med.label || "Film"}</span>
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
