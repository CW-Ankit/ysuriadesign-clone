"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isAway = false;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (isAway) {
        isAway = false;
        cursorRef.current?.classList.remove("away");
      }
    };

    const onPointerLeave = () => {
      isAway = true;
      cursorRef.current?.classList.add("away");
    };

    const onPointerEnter = () => {
      isAway = false;
      cursorRef.current?.classList.remove("away");
    };

    const onPointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = target?.closest?.("a, button, [data-interactive], .wm-thumb, .wl");
      document.body.classList.toggle("hovering", !!isInteractive);
    };

    window.addEventListener("pointermove", onMouseMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("pointerenter", onPointerEnter);
    document.addEventListener("pointerover", onPointerOver);

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMouseMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("pointerenter", onPointerEnter);
      document.removeEventListener("pointerover", onPointerOver);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div id="cursor" ref={cursorRef} aria-hidden="true">
      <i className="c-dot" ref={dotRef}></i>
      <i className="c-ring" ref={ringRef}></i>
    </div>
  );
}
