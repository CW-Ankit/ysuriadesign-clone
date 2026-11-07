"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";

interface LoaderProps {
  isAssetsLoaded: boolean;
  onEnter: (withSound: boolean) => void;
}

export function Loader({ isAssetsLoaded, onEnter }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 8 + 3;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setIsReady(true);
      } else {
        setProgress(Math.floor(current));
      }
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = (withSound: boolean) => {
    if (withSound) {
      sound.enable();
    } else {
      sound.disable();
    }
    sound.playSfx("door");
    setIsDone(true);
    setTimeout(() => {
      onEnter(withSound);
    }, 800);
  };

  useEffect(() => {
    const handleDismiss = () => {
      if (isReady && !isDone) {
        handleEnter(false);
      }
    };
    window.addEventListener("wheel", handleDismiss, { passive: true });
    window.addEventListener("touchmove", handleDismiss, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleDismiss);
      window.removeEventListener("touchmove", handleDismiss);
    };
  }, [isReady, isDone]);

  return (
    <div
      id="loader"
      className={`${isReady ? "ready" : ""} ${isDone ? "done" : ""}`}
    >
      <div className="loader-inner">
        <p className="mono loader-k">Tying the thread</p>
        <div className="loader-bar">
          <i
            id="loader-fill"
            style={{ transform: `scaleX(${progress / 100})` }}
          ></i>
        </div>
        <p className="mono loader-p" id="loader-p">
          {String(progress).padStart(3, "0")}
        </p>
        <div className="loader-enter">
          <button
            className="enter-btn on"
            onClick={() => handleEnter(true)}
            onMouseEnter={() => sound.playSfx("hover")}
          >
            Enter with sound
          </button>
          <button
            className="enter-btn"
            onClick={() => handleEnter(false)}
            onMouseEnter={() => sound.playSfx("hover")}
          >
            Enter muted
          </button>
        </div>
      </div>
    </div>
  );
}
