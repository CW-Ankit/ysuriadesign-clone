"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { CHAPTERS, PROJECTS, Project } from "@/data/site-data";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { ChapterView } from "@/components/ChapterView";
import { Finale } from "@/components/Finale";
import { Rail } from "@/components/Rail";
import { ScrollCue } from "@/components/ScrollCue";
import { BasicPortfolioPill } from "@/components/BasicPortfolioPill";
import { IndexMenu } from "@/components/IndexMenu";
import { WorkModal } from "@/components/WorkModal";
import { WorkLabels } from "@/components/WorkLabels";
import { FrameTags } from "@/components/FrameTags";
import { CustomCursor } from "@/components/CustomCursor";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/Loader";

// Dynamic import for Three.js Canvas to avoid SSR window issues
const Canvas3D = dynamic(
  () => import("@/components/Canvas3D").then((mod) => mod.Canvas3D),
  { ssr: false }
);

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(-1);
  const [chapterProgress, setChapterProgress] = useState(0);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [isEntered, setIsEntered] = useState(false);

  // Jump to specific chapter
  const handleJump = useCallback((chapterNum: number) => {
    window.dispatchEvent(
      new CustomEvent("jump-to-chapter", { detail: { chapter: chapterNum } })
    );
  }, []);

  // Update from 3D Canvas
  const handleProgressUpdate = useCallback(
    (progress: number, chapter: number, chProgress: number) => {
      setScrollProgress(progress);
      setChapterProgress(chProgress);

      if (progress < 0.05) {
        setCurrentChapter(-1);
      } else if (progress > 0.85) {
        setCurrentChapter(6); // Finale / Footer
      } else {
        setCurrentChapter(chapter);
      }

      // Rotate active project in Chapter 3
      if (chapter === 3) {
        const pIdx = Math.min(3, Math.floor(chProgress * 4));
        setActiveProjectIndex(pIdx);
      }
    },
    []
  );

  const handleSelectProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  }, []);

  const handleSelectProjectByIndex = useCallback(
    (idx: number) => {
      if (PROJECTS[idx]) {
        handleSelectProject(PROJECTS[idx]);
      }
    },
    [handleSelectProject]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const introOpacity = Math.max(0, 1 - scrollProgress * 10);
  const cueOpacity = Math.max(0, 1 - scrollProgress * 15);
  const isFinale = currentChapter === 6 || scrollProgress > 0.82;
  const isChapterActive = currentChapter >= 0 && currentChapter < CHAPTERS.length && !isFinale;
  const activeChapterData = isChapterActive ? CHAPTERS[currentChapter] : null;

  return (
    <>
      <Loader
        isAssetsLoaded={true}
        onEnter={(withSound) => {
          setIsEntered(true);
        }}
      />

      <CustomCursor />

      <Canvas3D
        onProgressUpdate={handleProgressUpdate}
        onSelectProject={handleSelectProjectByIndex}
      />

      <div id="scroll" aria-hidden="true" style={{ height: "1748vh" }}></div>

      <main id="ui">
        <Header
          currentChapter={currentChapter >= 0 && currentChapter < 6 ? currentChapter : -1}
          onJump={handleJump}
          isIndexOpen={isIndexOpen}
          onToggleIndex={() => setIsIndexOpen((prev) => !prev)}
        />

        <Intro opacity={introOpacity} />

        <ChapterView
          chapter={activeChapterData}
          chapterIndex={currentChapter}
          progress={chapterProgress}
          isActive={isChapterActive}
        />

        <FrameTags isActive={currentChapter === 2} />

        <WorkLabels
          activeProjectIndex={activeProjectIndex}
          isVisible={currentChapter === 3}
          onSelectProject={handleSelectProject}
        />

        <Finale isActive={isFinale} />

        <Rail
          currentChapter={currentChapter}
          scrollProgress={scrollProgress}
          onJump={handleJump}
        />

        <ScrollCue opacity={cueOpacity} />

        <BasicPortfolioPill />

        <IndexMenu
          isOpen={isIndexOpen}
          currentChapter={currentChapter}
          onJump={handleJump}
          onClose={() => setIsIndexOpen(false)}
        />
      </main>

      <WorkModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <Footer onBeginAgain={() => handleJump(0)} />
    </>
  );
}
