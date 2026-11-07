"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { sound } from "@/lib/sound";

interface Canvas3DProps {
  onProgressUpdate: (progress: number, chapter: number, chapterProgress: number) => void;
  onSelectProject?: (index: number) => void;
  onFooterVisibility?: (visible: boolean) => void;
}

export function Canvas3D({
  onProgressUpdate,
  onSelectProject,
  onFooterVisibility,
}: Canvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050507");
    scene.fog = new THREE.FogExp2("#050507", 0.012);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      600
    );

    // Global Lighting
    const ambientLight = new THREE.AmbientLight("#222026", 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight("#fff5eb", 2.2);
    dirLight.position.set(20, 45, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Crimson accent point light
    const redLight = new THREE.PointLight("#ff2a1a", 4, 80);
    scene.add(redLight);

    // -------------------------------------------------------------
    // Spline & Trajectory Definition
    // -------------------------------------------------------------
    const chapterPoints = [
      new THREE.Vector3(0, 0, 20),      // 0: Origin
      new THREE.Vector3(0, -15, -40),   // 1: Memory
      new THREE.Vector3(25, -30, -100), // 2: Refraction
      new THREE.Vector3(0, -45, -180),  // 3: The Work
      new THREE.Vector3(-30, -60, -260),// 4: Threshold
      new THREE.Vector3(0, -75, -340),  // 5: Network
      new THREE.Vector3(0, -85, -390),  // Finale / Footer
    ];

    const cameraCurve = new THREE.CatmullRomCurve3(chapterPoints, false, "centripetal", 0.5);

    // -------------------------------------------------------------
    // The Red Thread (Glowing Spline)
    // -------------------------------------------------------------
    const threadPoints: THREE.Vector3[] = [];
    const numSubdivisions = 600;
    for (let i = 0; i <= numSubdivisions; i++) {
      const t = i / numSubdivisions;
      const pt = cameraCurve.getPoint(t);
      const jitter = new THREE.Vector3(
        Math.sin(i * 0.15) * 0.8,
        Math.cos(i * 0.12) * 0.6,
        Math.sin(i * 0.2) * 0.5
      );
      threadPoints.push(pt.clone().add(jitter));
    }

    const threadCurve = new THREE.CatmullRomCurve3(threadPoints, false, "centripetal", 0.5);
    const threadGeo = new THREE.TubeGeometry(threadCurve, 800, 0.07, 8, false);
    const threadMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff2a1a").multiplyScalar(1.8),
    });
    const threadMesh = new THREE.Mesh(threadGeo, threadMat);
    scene.add(threadMesh);

    // -------------------------------------------------------------
    // Chapter 0: Origin (Basalt Monoliths & Beams)
    // -------------------------------------------------------------
    const originGroup = new THREE.Group();
    originGroup.position.copy(chapterPoints[0]);
    scene.add(originGroup);

    const basaltMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2a2a2e"),
      roughness: 0.85,
      metalness: 0.1,
    });

    const shards: THREE.Mesh[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 9 + Math.random() * 3;
      const height = 4 + Math.random() * 6;
      const geo = new THREE.CylinderGeometry(0.5, 0.9, height, 6);
      const mesh = new THREE.Mesh(geo, basaltMat);
      mesh.position.set(Math.cos(angle) * radius, height / 2 - 4, Math.sin(angle) * radius);
      mesh.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2);
      originGroup.add(mesh);
      shards.push(mesh);
    }

    // Origin laser beam
    const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 25, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff3a24").multiplyScalar(2),
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(0, 0, 0);
    originGroup.add(beamMesh);

    // -------------------------------------------------------------
    // Chapter 1: Memory (Procedural Ruins & Terrain)
    // -------------------------------------------------------------
    const memoryGroup = new THREE.Group();
    memoryGroup.position.copy(chapterPoints[1]);
    scene.add(memoryGroup);

    const terrainGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2.2 + Math.sin(x * 0.25) * 0.8;
      posAttr.setY(i, y - 6);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#383734"),
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    memoryGroup.add(terrainMesh);

    // Monoliths
    for (let i = 0; i < 7; i++) {
      const geo = new THREE.BoxGeometry(1.6, 7 + Math.random() * 5, 1.6);
      const mesh = new THREE.Mesh(geo, basaltMat);
      mesh.position.set((Math.random() - 0.5) * 35, 0, (Math.random() - 0.5) * 35);
      mesh.rotation.set(Math.random() * 0.1, Math.random() * 3, Math.random() * 0.1);
      memoryGroup.add(mesh);
    }

    // -------------------------------------------------------------
    // Chapter 2: Refraction (Volcanic Columns & Lava)
    // -------------------------------------------------------------
    const refractionGroup = new THREE.Group();
    refractionGroup.position.copy(chapterPoints[2]);
    scene.add(refractionGroup);

    const lavaMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff3a1a").multiplyScalar(1.4),
    });
    const lavaGeo = new THREE.PlaneGeometry(60, 60);
    lavaGeo.rotateX(-Math.PI / 2);
    const lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    lavaMesh.position.y = -5;
    refractionGroup.add(lavaMesh);

    // -------------------------------------------------------------
    // Chapter 3: The Work (Instanced Grass & Project Platforms)
    // -------------------------------------------------------------
    const workGroup = new THREE.Group();
    workGroup.position.copy(chapterPoints[3]);
    scene.add(workGroup);

    // Instanced Grass
    const grassBladeGeo = new THREE.ConeGeometry(0.04, 0.7, 4);
    const grassBladeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#322520"),
      roughness: 0.9,
    });
    const grassCount = 3500;
    const grassInstanced = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < grassCount; i++) {
      const r = Math.sqrt(Math.random()) * 24;
      const theta = Math.random() * Math.PI * 2;
      dummy.position.set(Math.cos(theta) * r, -4 + Math.random() * 0.2, Math.sin(theta) * r);
      dummy.scale.setScalar(0.8 + Math.random() * 0.5);
      dummy.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2);
      dummy.updateMatrix();
      grassInstanced.setMatrixAt(i, dummy.matrix);
    }
    grassInstanced.instanceMatrix.needsUpdate = true;
    workGroup.add(grassInstanced);

    // 4 Project Platforms / Slabs
    const projectSlabs: THREE.Mesh[] = [];
    const slabColors = ["#3b7bff", "#3fe0c0", "#ff2a48", "#b35cff"];
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BoxGeometry(4, 0.4, 2.8);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(slabColors[i]),
        roughness: 0.3,
        metalness: 0.6,
      });
      const slab = new THREE.Mesh(geo, mat);
      const angle = (i / 4) * Math.PI * 2 + 0.4;
      slab.position.set(Math.cos(angle) * 11, -1.5 + i * 0.4, Math.sin(angle) * 11);
      slab.rotation.y = -angle;
      workGroup.add(slab);
      projectSlabs.push(slab);
    }

    // -------------------------------------------------------------
    // Chapter 4: Threshold (Mountain Ridge & Energy Portal)
    // -------------------------------------------------------------
    const thresholdGroup = new THREE.Group();
    thresholdGroup.position.copy(chapterPoints[4]);
    scene.add(thresholdGroup);

    // Portal Ring
    const portalGeo = new THREE.TorusGeometry(3.5, 0.08, 16, 64);
    const portalMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff2414").multiplyScalar(2.2),
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.position.set(0, 0, 0);
    thresholdGroup.add(portalMesh);

    // -------------------------------------------------------------
    // Chapter 5: Network (300 Hanging Glowing Cable Splines)
    // -------------------------------------------------------------
    const networkGroup = new THREE.Group();
    networkGroup.position.copy(chapterPoints[5]);
    scene.add(networkGroup);

    const cableMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff3a24").multiplyScalar(1.6),
    });

    for (let i = 0; i < 90; i++) {
      const angle = (i / 90) * Math.PI * 2;
      const radius = 3 + Math.random() * 18;
      const topY = 16 + Math.random() * 6;
      const botY = -12 - Math.random() * 8;
      const midY = (topY + botY) / 2;

      const p0 = new THREE.Vector3(Math.cos(angle) * radius, topY, Math.sin(angle) * radius);
      const p1 = new THREE.Vector3(
        Math.cos(angle) * (radius * 0.7),
        midY,
        Math.sin(angle) * (radius * 0.7)
      );
      const p2 = new THREE.Vector3(
        Math.cos(angle) * (radius * 0.4),
        botY,
        Math.sin(angle) * (radius * 0.4)
      );

      const cableCurve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 24, 0.03, 4, false);
      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      networkGroup.add(cableMesh);
    }

    // -------------------------------------------------------------
    // Skinned Character Model Loading (`figure.v2.glb`)
    // -------------------------------------------------------------
    const figureGroup = new THREE.Group();
    scene.add(figureGroup);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load(
      "/models/figure.v2.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.setScalar(2.0);
        let headBone: THREE.Bone | null = null;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh || (child as THREE.SkinnedMesh).isSkinnedMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const stdMat = mesh.material as THREE.MeshStandardMaterial;
              stdMat.roughness = 0.88;
              stdMat.metalness = 0.08;
              stdMat.side = THREE.DoubleSide;
            }
          }
          if ((child as THREE.Bone).isBone && child.name === "head") {
            headBone = child as THREE.Bone;
          }
        });

        if (headBone) {
          const eyeCanvas = document.createElement("canvas");
          eyeCanvas.width = 64;
          eyeCanvas.height = 64;
          const ctx = eyeCanvas.getContext("2d");
          if (ctx) {
            const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            grad.addColorStop(0, "rgba(255, 255, 255, 1)");
            grad.addColorStop(0.2, "rgba(255, 220, 160, 0.9)");
            grad.addColorStop(0.5, "rgba(255, 80, 40, 0.3)");
            grad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 64, 64);
          }
          const eyeTexture = new THREE.CanvasTexture(eyeCanvas);
          const eyeMat = new THREE.SpriteMaterial({
            map: eyeTexture,
            color: new THREE.Color("#ffeedd"),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          for (const xOff of [-0.038, 0.038]) {
            const eyeSprite = new THREE.Sprite(eyeMat);
            eyeSprite.position.set(xOff, 0.85, 0.12);
            eyeSprite.scale.setScalar(0.045);
            (headBone as THREE.Bone).add(eyeSprite);
          }
        }

        figureGroup.add(model);
      },
      undefined,
      (err) => {
        console.warn("Figure glb loading fallback:", err);
      }
    );

    // -------------------------------------------------------------
    // Virtual Scroll & Animation Loop
    // -------------------------------------------------------------
    let targetProgress = 0;
    let currentProgress = 0;
    let animId: number;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.00035;
      targetProgress = Math.min(1, Math.max(0, targetProgress + delta));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    // Touch support for mobile
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      targetProgress = Math.min(1, Math.max(0, targetProgress + deltaY * 0.0007));
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Global jump listener (e.g. from nav, rail, header)
    const handleJump = (e: CustomEvent<{ chapter: number }>) => {
      const ch = e.detail.chapter;
      if (ch === 0) {
        targetProgress = 0;
      } else {
        const targetT = Math.min(1, (ch - 1) / (chapterPoints.length - 1.5) + 0.05);
        targetProgress = targetT;
      }
    };
    window.addEventListener("jump-to-chapter" as any, handleJump);

    // Resize listener
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // High-precision animation timer (Three.js Timer)
    const timer = new THREE.Timer();

    const animate = () => {
      timer.update();
      const delta = timer.getDelta();
      const time = timer.getElapsed();

      // Smooth inertia scroll interpolation
      currentProgress += (targetProgress - currentProgress) * 0.06;

      // Camera position along curve
      const camPos = cameraCurve.getPoint(Math.min(0.999, Math.max(0, currentProgress)));
      const lookPos = cameraCurve.getPoint(Math.min(0.999, Math.max(0, currentProgress + 0.04)));

      camera.position.copy(camPos);
      camera.lookAt(lookPos);

      // Skinned figure follows slightly in front of camera
      const figPos = cameraCurve.getPoint(Math.min(0.999, Math.max(0, currentProgress + 0.025)));
      figureGroup.position.copy(figPos);
      figureGroup.position.y -= 1.8;
      figureGroup.lookAt(lookPos);

      // Light animation
      redLight.position.copy(figPos);
      redLight.position.y += 1.5;

      // Rotate shards & elements
      shards.forEach((s, idx) => {
        s.rotation.y += 0.005 * (idx % 2 === 0 ? 1 : -1);
      });
      portalMesh.rotation.z += 0.008;

      // Float project slabs
      projectSlabs.forEach((slab, i) => {
        slab.position.y += Math.sin(time * 2 + i) * 0.003;
      });

      // Render
      renderer.render(scene, camera);

      // Compute active chapter index (0 to 5)
      const numChapters = 6;
      const normalizedChapter = currentProgress * (numChapters - 0.2);
      const activeChapter = Math.min(numChapters - 1, Math.floor(normalizedChapter));
      const chapterProgress = normalizedChapter - activeChapter;

      // Notify parent
      onProgressUpdate(currentProgress, activeChapter, chapterProgress);

      const isFooter = currentProgress > 0.88;
      document.body.classList.toggle("footer-on", isFooter);
      if (onFooterVisibility) {
        onFooterVisibility(isFooter);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("jump-to-chapter" as any, handleJump);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [onProgressUpdate, onSelectProject, onFooterVisibility]);

  return <canvas id="gl" ref={canvasRef} aria-hidden="true" />;
}
