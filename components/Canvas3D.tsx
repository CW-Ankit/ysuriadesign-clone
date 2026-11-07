"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { sound } from "@/lib/sound";
import { PROJECTS } from "@/data/site-data";

interface Canvas3DProps {
  onProgressUpdate: (progress: number, chapter: number, chapterProgress: number) => void;
  onSelectProject?: (index: number) => void;
  onFooterVisibility?: (visible: boolean) => void;
}

// Procedural 512x512 Lens Dirt Texture (exact replica of original Ng() generator)
function createLensDirtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, 512, 512);

  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // 90 soft radial dust motes
  for (let i = 0; i < 90; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const radius = 6 + rand() * rand() * 70;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const alpha = 0.04 + rand() * 0.14;
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(0.7, `rgba(255,255,255,${alpha * 0.6})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 700 fine speckles
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 700; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.6})`;
    ctx.beginPath();
    ctx.arc(rand() * 512, rand() * 512, 0.4 + rand() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 14 subtle hairline glass scratches
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#fff";
  for (let i = 0; i < 14; i++) {
    ctx.lineWidth = 4 + rand() * 18;
    ctx.beginPath();
    const x = rand() * 512;
    const y = rand() * 512;
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + rand() * 200 - 100,
      y + rand() * 200 - 100,
      x + rand() * 200 - 100,
      y + rand() * 200 - 100,
      x + rand() * 300 - 150,
      y + rand() * 300 - 150
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Chapter Environment & Grading Profiles (extracted directly from Rg presets in main.js)
const CHAPTER_PRESETS = [
  // 0: Origin
  {
    skyTop: "#010204",
    fogColor: "#05080a",
    hemiSky: "#5f7f8e",
    bloom: 1.05,
    streak: 0.55,
    streakTint: new THREE.Color("#ff4a38"),
    lens: 0.06,
    ca: 0.0036,
    grain: 0.075,
    vignette: 0.62,
    exposure: 1.0,
    lift: new THREE.Vector3(0.004, 0.008, 0.012),
    gain: new THREE.Vector3(1, 1, 1),
    tint: new THREE.Vector3(1, 1, 1),
  },
  // 1: Memory
  {
    skyTop: "#010204",
    fogColor: "#070c0e",
    hemiSky: "#527584",
    bloom: 1.15,
    streak: 0.55,
    streakTint: new THREE.Color("#ff4a38"),
    lens: 0.06,
    ca: 0.0038,
    grain: 0.08,
    vignette: 0.64,
    exposure: 0.98,
    lift: new THREE.Vector3(0.006, 0.01, 0.014),
    gain: new THREE.Vector3(0.98, 1.02, 1.04),
    tint: new THREE.Vector3(0.96, 1.0, 1.02),
  },
  // 2: Refraction
  {
    skyTop: "#030206",
    fogColor: "#09060c",
    hemiSky: "#826b8e",
    bloom: 1.35,
    streak: 0.85,
    streakTint: new THREE.Color("#ff4230"),
    lens: 0.08,
    ca: 0.0055,
    grain: 0.085,
    vignette: 0.68,
    exposure: 1.06,
    lift: new THREE.Vector3(0.012, 0.006, 0.016),
    gain: new THREE.Vector3(1.05, 0.96, 1.04),
    tint: new THREE.Vector3(1.04, 0.96, 1.02),
  },
  // 3: The Work
  {
    skyTop: "#020205",
    fogColor: "#07070b",
    hemiSky: "#62738e",
    bloom: 1.25,
    streak: 0.6,
    streakTint: new THREE.Color("#ff3624"),
    lens: 0.06,
    ca: 0.004,
    grain: 0.075,
    vignette: 0.62,
    exposure: 1.04,
    lift: new THREE.Vector3(0.006, 0.008, 0.014),
    gain: new THREE.Vector3(1, 1.01, 1.03),
    tint: new THREE.Vector3(1, 1, 1),
  },
  // 4: Threshold
  {
    skyTop: "#030101",
    fogColor: "#0a0403",
    hemiSky: "#8e5246",
    bloom: 1.45,
    streak: 0.95,
    streakTint: new THREE.Color("#ff2a14"),
    lens: 0.09,
    ca: 0.0065,
    grain: 0.09,
    vignette: 0.72,
    exposure: 1.1,
    lift: new THREE.Vector3(0.016, 0.004, 0.004),
    gain: new THREE.Vector3(1.08, 0.92, 0.92),
    tint: new THREE.Vector3(1.06, 0.94, 0.94),
  },
  // 5: Network
  {
    skyTop: "#010204",
    fogColor: "#04080d",
    hemiSky: "#4b6c82",
    bloom: 1.3,
    streak: 0.7,
    streakTint: new THREE.Color("#ff3220"),
    lens: 0.07,
    ca: 0.0045,
    grain: 0.08,
    vignette: 0.65,
    exposure: 1.02,
    lift: new THREE.Vector3(0.004, 0.01, 0.016),
    gain: new THREE.Vector3(0.96, 1.02, 1.06),
    tint: new THREE.Vector3(0.96, 1.02, 1.04),
  },
  // 6: Finale
  {
    skyTop: "#000000",
    fogColor: "#030406",
    hemiSky: "#3a4a58",
    bloom: 1.1,
    streak: 0.5,
    streakTint: new THREE.Color("#ff2812"),
    lens: 0.05,
    ca: 0.003,
    grain: 0.07,
    vignette: 0.75,
    exposure: 0.95,
    lift: new THREE.Vector3(0.002, 0.004, 0.006),
    gain: new THREE.Vector3(1, 1, 1),
    tint: new THREE.Vector3(1, 1, 1),
  },
];

// Exact Cylindrical Helix Chapter World Configurations (Extracted from analysis/main.js)
const CHAPTER_CONFIGS = [
  { id: "origin", origin: new THREE.Vector3(0, 0, 0), yaw: 1.11701 },
  { id: "memory", origin: new THREE.Vector3(-126.082, -65, -61.494), yaw: 1.11701 },
  { id: "refraction", origin: new THREE.Vector3(-155.247, -130, -198.708), yaw: 0.20944 },
  { id: "work", origin: new THREE.Vector3(-65.078, -195, -306.167), yaw: -0.69813 },
  { id: "threshold", origin: new THREE.Vector3(89.471, -260, -292.646), yaw: -1.65806 },
  { id: "network", origin: new THREE.Vector3(196.267, -299.083, -283.303), yaw: -1.65806 },
  { id: "finale", origin: new THREE.Vector3(0, -200, -160), yaw: 0 },
];

function toWorld(chapterIndex: number, localX: number, localY: number, localZ: number): THREE.Vector3 {
  const cfg = CHAPTER_CONFIGS[chapterIndex];
  const cosY = Math.cos(cfg.yaw);
  const sinY = Math.sin(cfg.yaw);
  return new THREE.Vector3(
    cfg.origin.x + (localX * cosY + localZ * sinY),
    cfg.origin.y + localY,
    cfg.origin.z + (-localX * sinY + localZ * cosY)
  );
}

export default function Canvas3D({
  onProgressUpdate,
  onSelectProject,
  onFooterVisibility,
}: Canvas3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Store callbacks in ref so Canvas3D NEVER remounts on parent state changes
  const callbacksRef = useRef({ onProgressUpdate, onSelectProject, onFooterVisibility });
  callbacksRef.current = { onProgressUpdate, onSelectProject, onFooterVisibility };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // -------------------------------------------------------------
    // Three.js Scene, Camera, and Renderer Setup
    // -------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05080a");
    scene.fog = new THREE.FogExp2("#05080a", 0.009);

    const camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      6000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas,
      powerPreference: "high-performance",
      antialias: false,
      stencil: false,
      depth: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // -------------------------------------------------------------
    // Lighting Rig
    // -------------------------------------------------------------
    const hemiLight = new THREE.HemisphereLight("#5f7f8e", "#050505", 0.4);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight("#fff5eb", 2.2);
    dirLight.position.set(20, 80, 40);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    const redLight = new THREE.PointLight("#ff2a1a", 4.5, 90);
    scene.add(redLight);

    // -------------------------------------------------------------
    // Chapter Root Groups (Placed at exact cylindrical helix coords)
    // -------------------------------------------------------------
    const chapterGroups: THREE.Group[] = [];
    CHAPTER_CONFIGS.forEach((cfg) => {
      const grp = new THREE.Group();
      grp.name = cfg.id;
      grp.position.copy(cfg.origin);
      grp.rotation.y = cfg.yaw;
      grp.updateMatrixWorld(true);
      scene.add(grp);
      chapterGroups.push(grp);
    });

    const [
      originGroup,
      memoryGroup,
      refractionGroup,
      workGroup,
      thresholdGroup,
      networkGroup,
      finaleGroup,
    ] = chapterGroups;

    // -------------------------------------------------------------
    // Camera Spline Path (CatmullRom Curve along helix trajectory)
    // -------------------------------------------------------------
    const camWaypoints = [
      // Chapter 0: Origin
      toWorld(0, 0, 0.4, 38),
      toWorld(0, 5, 1.2, 26),
      toWorld(0, -5.5, 2.4, 18),
      toWorld(0, -2, 7.5, 11),
      toWorld(0, 1.5, 2, 5.5),
      toWorld(0, 1.2, -16, -1),
      // Transition 0 -> 1
      toWorld(0, 0, 0, 0).lerp(toWorld(1, 0, 0, 0), 0.62).add(new THREE.Vector3(0, 18, 0)),
      // Chapter 1: Memory
      toWorld(1, 9, 7, 17),
      toWorld(1, 4.5, 2.4, 10),
      toWorld(1, -1.2, 1.7, 7.8),
      toWorld(1, -6.8, 2.5, 6.4),
      toWorld(1, -4, 6, -2),
      // Transition 1 -> 2
      toWorld(1, 0, 0, 0).lerp(toWorld(2, 0, 0, 0), 0.55).add(new THREE.Vector3(0, 14, 0)),
      // Chapter 2: Refraction
      toWorld(2, 15, 4.5, 30),
      toWorld(2, 7, 2.1, 15),
      toWorld(2, 2.2, 1.4, 10),
      toWorld(2, -4.8, 2.5, 8.8),
      toWorld(2, 0, 3.5, 4),
      toWorld(2, 0, 2.8, -8),
      // Chapter 3: The Work
      toWorld(3, 15, 10, 27),
      toWorld(3, 7.8, 5.4, 12.6),
      // Orbiting panels shots
      toWorld(3, 3.2, 4.8, 8.5),
      toWorld(3, 7.2, 4.2, -1.5),
      toWorld(3, -2.5, 4.8, -8.2),
      toWorld(3, -7.5, 4.5, 2.2),
      toWorld(3, -0.4, 2.2, 1.7),
      // Chapter 4: Threshold
      toWorld(4, -11, 40, 110),
      toWorld(4, -6, 25, 75),
      toWorld(4, 0, 10, 35),
      toWorld(4, 0, 4, 12),
      toWorld(4, 0, 2, -10),
      // Chapter 5: Network
      toWorld(5, 0, 18, 32),
      toWorld(5, 0, 8, 16),
      toWorld(5, 0, 2, -5),
      // Chapter 6: Finale
      new THREE.Vector3(0, -200, -160),
    ];

    const cameraCurve = new THREE.CatmullRomCurve3(camWaypoints, false, "centripetal", 0.5);

    // -------------------------------------------------------------
    // The Red Thread (Glowing Spline connecting chapters)
    // -------------------------------------------------------------
    const threadPoints: THREE.Vector3[] = [];
    const threadSubdiv = 500;
    for (let i = 0; i <= threadSubdiv; i++) {
      const t = i / threadSubdiv;
      const pt = cameraCurve.getPoint(t);
      const jitter = new THREE.Vector3(
        Math.sin(i * 0.18) * 0.45,
        Math.cos(i * 0.14) * 0.35,
        Math.sin(i * 0.22) * 0.3
      );
      threadPoints.push(pt.clone().add(jitter));
    }
    const threadCurve = new THREE.CatmullRomCurve3(threadPoints, false, "centripetal", 0.5);
    const threadGeo = new THREE.TubeGeometry(threadCurve, 700, 0.07, 8, false);
    const threadMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff2a1a").multiplyScalar(3.2),
    });
    const threadMesh = new THREE.Mesh(threadGeo, threadMat);
    scene.add(threadMesh);

    // -------------------------------------------------------------
    // Volumetric Dust Motes Particle Cloud
    // -------------------------------------------------------------
    const dustCount = 2000;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const t = Math.random();
      const pt = cameraCurve.getPoint(t);
      dustPositions[i * 3] = pt.x + (Math.random() - 0.5) * 50;
      dustPositions[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 40;
      dustPositions[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 50;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: new THREE.Color("#ffe4d4"),
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // -------------------------------------------------------------
    // Chapter 0: Origin (Orbiting Basalt Monoliths & Micro-shards)
    // -------------------------------------------------------------
    const basaltMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#3b3b40"),
      roughness: 0.85,
      metalness: 0.15,
    });

    const monoliths: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 6.4 + (Math.random() - 0.5) * 0.8;
      const geo = new THREE.BoxGeometry(1.4, 4.5 + Math.random() * 2.5, 1.4);
      const mesh = new THREE.Mesh(geo, basaltMat);
      mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 1.5, Math.sin(angle) * radius);
      mesh.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      originGroup.add(mesh);
      monoliths.push(mesh);
    }

    const shards: THREE.Mesh[] = [];
    for (let i = 0; i < 14; i++) {
      const geo = new THREE.TetrahedronGeometry(0.3 + Math.random() * 0.35);
      const mesh = new THREE.Mesh(geo, basaltMat);
      const angle = Math.random() * Math.PI * 2;
      const r = 4 + Math.random() * 5;
      mesh.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 3, Math.sin(angle) * r);
      originGroup.add(mesh);
      shards.push(mesh);
    }

    // -------------------------------------------------------------
    // Chapter 1: Memory (Volcanic Earth & Basalt Pillars)
    // -------------------------------------------------------------
    const terrainGeo = new THREE.PlaneGeometry(65, 65, 48, 48);
    terrainGeo.rotateX(-Math.PI / 2);
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const dist = Math.hypot(x, z);
      const y = 1.3 * Math.exp(-(dist * dist) / 38) + Math.sin(x * 0.25) * Math.cos(z * 0.25) * 1.8 - 4;
      posAttr.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2a2c27"),
      roughness: 0.95,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    memoryGroup.add(terrainMesh);

    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const r = 3 + Math.random() * 6;
      const h = 5 + Math.random() * 6;
      const geo = new THREE.CylinderGeometry(0.5, 0.7, h, 6);
      const pillar = new THREE.Mesh(geo, basaltMat);
      pillar.position.set(Math.cos(angle) * r, -1 + h / 2, Math.sin(angle) * r);
      pillar.rotation.set((Math.random() - 0.5) * 0.3, Math.random() * Math.PI, (Math.random() - 0.5) * 0.3);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      memoryGroup.add(pillar);
    }

    // -------------------------------------------------------------
    // Chapter 2: Refraction (Volcanic Magma Lake & Jagged Rocks)
    // -------------------------------------------------------------
    const lavaMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff3a1a").multiplyScalar(1.6),
    });
    const lavaGeo = new THREE.PlaneGeometry(75, 75);
    lavaGeo.rotateX(-Math.PI / 2);
    const lavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    lavaMesh.position.y = -5;
    refractionGroup.add(lavaMesh);

    for (let i = 0; i < 14; i++) {
      const geo = new THREE.DodecahedronGeometry(1.2 + Math.random() * 1.6);
      const rock = new THREE.Mesh(geo, basaltMat);
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
      const r = 5 + Math.random() * 12;
      rock.position.set(Math.cos(angle) * r, -3 + Math.random() * 2, Math.sin(angle) * r);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.castShadow = true;
      rock.receiveShadow = true;
      refractionGroup.add(rock);
    }

    // -------------------------------------------------------------
    // Chapter 3: The Work (7 Rock Platforms, Swaying Grass & Orbiting Panels)
    // -------------------------------------------------------------
    // 7 Basalt Platforms extracted from Q_
    const platformDefs = [
      [0.0, 0.35, 0.0, 2.2],
      [-9.5, 1.2, -6.0, 1.6],
      [10.5, 4.4, -4.5, 1.2],
      [-7.5, 6.8, 7.5, 0.9],
      [7.0, -1.6, 9.5, 1.5],
      [-3.0, -3.5, -11.0, 2.4],
      [13.0, 0.5, 6.0, 0.8],
    ];

    platformDefs.forEach(([px, py, pz, pscale]) => {
      const pGeo = new THREE.CylinderGeometry(pscale * 1.8, pscale * 2.2, pscale * 1.2, 8);
      const pMesh = new THREE.Mesh(pGeo, basaltMat);
      pMesh.position.set(px, py, pz);
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      workGroup.add(pMesh);
    });

    // 3,000 Instanced Wind-Swayed Grass Blades
    const grassBladeGeo = new THREE.ConeGeometry(0.04, 0.7, 4);
    const grassBladeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#322520"),
      roughness: 0.9,
    });
    const grassCount = 3000;
    const grassInstanced = new THREE.InstancedMesh(grassBladeGeo, grassBladeMat, grassCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < grassCount; i++) {
      const r = Math.sqrt(Math.random()) * 20;
      const theta = Math.random() * Math.PI * 2;
      dummy.position.set(Math.cos(theta) * r, -1.2 + Math.random() * 0.2, Math.sin(theta) * r);
      dummy.scale.setScalar(0.8 + Math.random() * 0.5);
      dummy.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2);
      dummy.updateMatrix();
      grassInstanced.setMatrixAt(i, dummy.matrix);
    }
    grassInstanced.instanceMatrix.needsUpdate = true;
    workGroup.add(grassInstanced);

    // 4 Orbiting Project Panels (Radius 5.7m, Center Y: 3.4m)
    const textureLoader = new THREE.TextureLoader();
    const panelMeshes: THREE.Group[] = [];
    const panelSlabs: THREE.Mesh[] = [];
    const panelBases: { basePos: THREE.Vector3; baseRot: THREE.Euler }[] = [];

    const heightOffsets = [0.35, -0.3, 0.5, -0.15];
    const projectColors = ["#3b7bff", "#3fe0c0", "#ff2a48", "#b35cff"];

    PROJECTS.forEach((proj, idx) => {
      const angle = 0.6 + (idx / 4) * Math.PI * 2;
      const radius = 5.7;
      const py = 3.4 + heightOffsets[idx % heightOffsets.length];
      const px = Math.sin(angle) * radius;
      const pz = Math.cos(angle) * radius;

      const panelGrp = new THREE.Group();
      panelGrp.position.set(px, py, pz);
      panelGrp.lookAt(px * 2, py, pz * 2);
      panelGrp.rotateY((idx % 2 ? -1 : 1) * 0.22);

      // Backing Glass Slab
      const slabGeo = new THREE.BoxGeometry(3.54, 2.2, 0.14);
      const slabMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#0b0a10"),
        roughness: 0.18,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        iridescence: 0.35,
        iridescenceIOR: 1.3,
        emissive: new THREE.Color(projectColors[idx]),
        emissiveIntensity: 0.06,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.castShadow = true;
      slab.receiveShadow = true;
      slab.userData = { projectIndex: idx };
      panelGrp.add(slab);
      panelSlabs.push(slab);

      // Front Media Plane with Loaded Texture
      const coverUrl = proj.cover.src;
      const mediaTexture = textureLoader.load(coverUrl);
      const mediaMat = new THREE.MeshBasicMaterial({
        map: mediaTexture,
      });
      const mediaGeo = new THREE.PlaneGeometry(3.4, 2.0);
      const mediaMesh = new THREE.Mesh(mediaGeo, mediaMat);
      mediaMesh.position.z = 0.075;
      panelGrp.add(mediaMesh);

      // Accent Rim Point Light
      const pLight = new THREE.PointLight(projectColors[idx], 2.4, 7);
      pLight.position.set(0, 0, 0.5);
      panelGrp.add(pLight);

      workGroup.add(panelGrp);
      panelMeshes.push(panelGrp);
      panelBases.push({
        basePos: panelGrp.position.clone(),
        baseRot: panelGrp.rotation.clone(),
      });
    });

    // -------------------------------------------------------------
    // Chapter 4: Threshold (Mountain Dunes & Luminous Portal Ring)
    // -------------------------------------------------------------
    const duneGeo = new THREE.PlaneGeometry(90, 90, 48, 48);
    duneGeo.rotateX(-Math.PI / 2);
    const dunePos = duneGeo.attributes.position;
    for (let i = 0; i < dunePos.count; i++) {
      const x = dunePos.getX(i);
      const z = dunePos.getZ(i);
      const y = Math.sin(x * 0.08) * 3.5 + Math.cos(z * 0.06) * 4.2 - 2;
      dunePos.setY(i, y);
    }
    duneGeo.computeVertexNormals();
    const duneMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#15130f"),
      roughness: 0.92,
      metalness: 0.0,
    });
    const duneMesh = new THREE.Mesh(duneGeo, duneMat);
    duneMesh.receiveShadow = true;
    thresholdGroup.add(duneMesh);

    const portalGeo = new THREE.TorusGeometry(3.8, 0.1, 16, 64);
    const portalMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff2414").multiplyScalar(2.6),
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.position.set(0, 2, 0);
    thresholdGroup.add(portalMesh);

    const coreGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff5030").multiplyScalar(3.0),
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 2, 0);
    thresholdGroup.add(coreMesh);

    // -------------------------------------------------------------
    // Chapter 5: Network (Tower Spire & Catenary Cables)
    // -------------------------------------------------------------
    const spireGeo = new THREE.CylinderGeometry(0.2, 1.8, 30, 8);
    const spireMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a1a20"),
      roughness: 0.4,
      metalness: 0.8,
    });
    const spireMesh = new THREE.Mesh(spireGeo, spireMat);
    spireMesh.position.set(0, 8, 0);
    networkGroup.add(spireMesh);

    const cableMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#ff2a18").multiplyScalar(1.8),
    });
    const numCables = 48;
    for (let i = 0; i < numCables; i++) {
      const angle = (i / numCables) * Math.PI * 2;
      const radius = 10 + (i % 3) * 6;
      const topY = 16 - (i % 4) * 2;
      const botY = -8 + (i % 3) * 3;
      const midY = (topY + botY) * 0.4 - 3;

      const p0 = new THREE.Vector3(Math.cos(angle) * (radius * 0.1), topY, Math.sin(angle) * (radius * 0.1));
      const p1 = new THREE.Vector3(Math.cos(angle) * (radius * 0.7), midY, Math.sin(angle) * (radius * 0.7));
      const p2 = new THREE.Vector3(Math.cos(angle) * radius, botY, Math.sin(angle) * radius);

      const cableCurve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
      const cableGeo = new THREE.TubeGeometry(cableCurve, 24, 0.035, 4, false);
      const cableMesh = new THREE.Mesh(cableGeo, cableMat);
      networkGroup.add(cableMesh);
    }

    // -------------------------------------------------------------
    // Chapter 6: Finale
    // -------------------------------------------------------------
    const finaleLight = new THREE.PointLight("#ff2410", 8, 120);
    finaleLight.position.set(0, 10, 0);
    finaleGroup.add(finaleLight);

    // -------------------------------------------------------------
    // Skinned Character Model Loading (`figure.v2.glb` with Meshopt)
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

        // Glowing Eye Sprites
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
    // Post-Processing Pipeline Setup (Fullscreen Quad + ShaderPass)
    // -------------------------------------------------------------
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 1.5);

    let renderTarget = new THREE.WebGLRenderTarget(width * dpr, height * dpr, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    });

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postQuadGeo = new THREE.PlaneGeometry(2, 2);

    const dirtTexture = createLensDirtTexture();

    const postMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D tDirt;
        uniform vec2 uResolution;
        uniform float uTime;
        uniform float uLens;
        uniform float uCA;
        uniform float uSpeed;
        uniform float uGrain;
        uniform float uVignette;
        uniform float uStreak;
        uniform vec3 uStreakTint;
        uniform float uDirt;
        uniform float uExposure;
        uniform float uContrast;
        uniform float uSaturation;
        uniform vec3 uLift;
        uniform vec3 uGain;
        uniform vec3 uTint;

        varying vec2 vUv;

        float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        vec3 aces(vec3 x) {
          float a = 2.51;
          float b = 0.03;
          float c = 2.43;
          float d = 0.59;
          float e = 0.14;
          return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
        }

        void main() {
          vec2 uv = vUv;
          vec2 p = uv * 2.0 - 1.0;
          float asp = uResolution.x / uResolution.y;
          p.x *= asp;

          // Barrel lens distortion
          float r2 = dot(p, p);
          vec2 pd = p * (1.0 + uLens * r2);
          vec2 distortedUv = pd;
          distortedUv.x /= asp;
          distortedUv = distortedUv * 0.5 + 0.5;

          // Chromatic aberration (RGB split)
          vec2 uvR = (pd * (1.0 + uCA)) / vec2(asp, 1.0) * 0.5 + 0.5;
          vec2 uvG = distortedUv;
          vec2 uvB = (pd * (1.0 - uCA)) / vec2(asp, 1.0) * 0.5 + 0.5;

          vec3 col = vec3(
            texture2D(tDiffuse, uvR).r,
            texture2D(tDiffuse, uvG).g,
            texture2D(tDiffuse, uvB).b
          );

          // Speed motion streak: single additional sample when moving
          if (uSpeed > 0.002) {
            vec2 speedOffset = (uvG - 0.5) * uSpeed * 0.12;
            vec3 blurSample = texture2D(tDiffuse, uvG - speedOffset).rgb;
            col = mix(col, blurSample, 0.35);
          }

          // Horizontal anamorphic flare streak
          vec3 streakSample = texture2D(tDiffuse, vec2(uvG.x + 0.007, uvG.y)).rgb;
          float bright = max(0.0, max(streakSample.r, max(streakSample.g, streakSample.b)) - 0.82);
          col += bright * uStreakTint * uStreak * 1.5;

          // Lens dirt
          vec3 dirt = texture2D(tDirt, uv).rgb;
          float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
          col += col * dirt * uDirt * smoothstep(0.4, 1.4, lum);

          // Exposure & ACES Tonemapping
          col *= uExposure;
          col = aces(col);

          // Color grading (Lift / Gain)
          col = col * uGain + uLift * (1.0 - col);

          // Saturation
          float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
          col = mix(vec3(l), col, uSaturation);

          // Contrast
          col = (col - 0.5) * uContrast + 0.5;

          // Color Tint
          col *= uTint;

          // Corner Vignette
          float v = smoothstep(1.35, 0.15, length(p * vec2(0.92, 1.08)));
          col *= mix(1.0, v, uVignette);

          // Film Grain & Dither
          float gr = hash12(floor(uv * uResolution) + fract(uTime * 13.7) * 311.0) - 0.5;
          col += gr * uGrain * (0.5 + 0.5 * (1.0 - l));
          col += (hash12(uv * uResolution + 71.3) - 0.5) / 255.0;

          gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
        }
      `,
      uniforms: {
        tDiffuse: { value: renderTarget.texture },
        tDirt: { value: dirtTexture },
        uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
        uTime: { value: 0 },
        uLens: { value: 0.05 },
        uCA: { value: 0.0035 },
        uSpeed: { value: 0 },
        uGrain: { value: 0.07 },
        uVignette: { value: 0.6 },
        uStreak: { value: 0.35 },
        uStreakTint: { value: new THREE.Color("#ff4a38") },
        uDirt: { value: 0.6 },
        uExposure: { value: 1.0 },
        uContrast: { value: 1.08 },
        uSaturation: { value: 1.04 },
        uLift: { value: new THREE.Vector3(0, 0, 0) },
        uGain: { value: new THREE.Vector3(1, 1, 1) },
        uTint: { value: new THREE.Vector3(1, 1, 1) },
      },
      depthTest: false,
      depthWrite: false,
    });

    const postQuad = new THREE.Mesh(postQuadGeo, postMaterial);
    postScene.add(postQuad);

    // -------------------------------------------------------------
    // Native Window Scroll Reader (Original Fg replica)
    // -------------------------------------------------------------
    let targetProgress = 0;
    let currentProgress = 0;
    let prevProgress = 0;
    let scrollVel = 0;
    let animId: number;

    const readScroll = () => {
      const storyEl = document.getElementById("scroll");
      const maxScroll = storyEl
        ? Math.max(1, storyEl.offsetHeight - window.innerHeight)
        : Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      targetProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));

      const footerEl = document.getElementById("footer");
      const footerH = footerEl?.offsetHeight || window.innerHeight;
      const footerProgress = Math.min(1, Math.max(0, (window.scrollY - maxScroll) / Math.max(1, footerH)));

      if (callbacksRef.current.onFooterVisibility) {
        callbacksRef.current.onFooterVisibility(footerProgress > 0.02);
      }
    };

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll, { passive: true });
    readScroll();

    // Smooth Chapter Jump Custom Event Listener
    const handleJump = (e: CustomEvent<{ chapter: number }>) => {
      const chapter = e.detail?.chapter ?? 0;
      const targetPct = chapter <= 0 ? 0 : Math.min(1, chapter / 6);
      const storyEl = document.getElementById("scroll");
      const maxScroll = storyEl
        ? Math.max(1, storyEl.offsetHeight - window.innerHeight)
        : Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: targetPct * maxScroll, behavior: "smooth" });
    };
    window.addEventListener("jump-to-chapter" as any, handleJump);

    // -------------------------------------------------------------
    // Interactive 3D Raycasting on Project Slabs
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouseNdc = new THREE.Vector2(-999, -999);
    let hoveredIndex = -1;

    const handlePointerMove = (e: MouseEvent) => {
      mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleClick = () => {
      if (hoveredIndex >= 0 && callbacksRef.current.onSelectProject) {
        sound.playSfx("card");
        callbacksRef.current.onSelectProject(hoveredIndex);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("click", handleClick);

    // Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      renderTarget.setSize(width * dpr, height * dpr);
      postMaterial.uniforms.uResolution.value.set(width * dpr, height * dpr);
      readScroll();
    };
    window.addEventListener("resize", handleResize);

    // High-Precision Animation Timer
    const timer = new THREE.Timer();

    // -------------------------------------------------------------
    // Animation Render Loop
    // -------------------------------------------------------------
    const animate = () => {
      timer.update();
      const delta = timer.getDelta();
      const time = timer.getElapsed();

      // Exponential damping on scroll progression matching original hg(scroll, scrollTarget, 2.6, dt)
      const dt = Math.min(0.1, delta);
      prevProgress = currentProgress;
      currentProgress += (targetProgress - currentProgress) * (1 - Math.exp(-2.6 * dt));
      if (Math.abs(currentProgress - targetProgress) < 1e-6) {
        currentProgress = targetProgress;
      }
      scrollVel = Math.abs(currentProgress - prevProgress) / Math.max(1e-4, dt);

      // Camera position along spiral CatmullRom curve
      const safeProgress = Math.min(0.999, Math.max(0, currentProgress));
      const camPos = cameraCurve.getPoint(safeProgress);
      const lookPos = cameraCurve.getPoint(Math.min(0.999, safeProgress + 0.035));

      camera.position.copy(camPos);
      camera.lookAt(lookPos);

      // Camera roll based on scroll velocity
      const rollAmount = (targetProgress - currentProgress) * 0.45;
      camera.rotation.z += rollAmount;

      // Skinned figure follows slightly ahead along spline
      const figPos = cameraCurve.getPoint(Math.min(0.999, safeProgress + 0.022));
      figureGroup.position.copy(figPos);
      figureGroup.position.y -= 1.8;
      figureGroup.lookAt(lookPos);

      // Crimson accent point light tracking
      redLight.position.copy(figPos);
      redLight.position.y += 1.5;

      // Animate Chapter 0 shards
      shards.forEach((s, idx) => {
        s.rotation.x += 0.01 * (idx % 2 === 0 ? 1 : -1);
        s.rotation.y += 0.008;
      });
      monoliths.forEach((m, idx) => {
        m.rotation.y += 0.002 * (idx % 2 === 0 ? 1 : -1);
      });

      // Animate Chapter 3 project platforms & Raycast Hover
      raycaster.setFromCamera(mouseNdc, camera);
      const intersects = raycaster.intersectObjects(panelSlabs, false);
      let newHovered = -1;
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        newHovered = hit.userData.projectIndex ?? -1;
      }

      if (newHovered !== hoveredIndex) {
        if (newHovered >= 0) {
          sound.playSfx("hover");
        }
        hoveredIndex = newHovered;
      }

      panelMeshes.forEach((grp, i) => {
        const isHovered = hoveredIndex === i;
        const base = panelBases[i];
        const targetScale = isHovered ? 1.06 : 1.0;
        grp.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        grp.position.y = base.basePos.y + Math.sin(time * 1.5 + i * 1.5) * 0.08;
      });

      // Animate Chapter 4 portal ring rotation
      portalMesh.rotation.z += 0.01;
      coreMesh.scale.setScalar(1.0 + Math.sin(time * 4) * 0.08);

      // Compute active chapter index (0 to 6)
      const numChapters = 6;
      const normalizedChapter = currentProgress * (numChapters - 0.2);
      const activeChapter = Math.min(numChapters - 1, Math.floor(normalizedChapter));
      const chapterProgress = normalizedChapter - activeChapter;

      // Interpolate chapter grading preset
      const presetA = CHAPTER_PRESETS[Math.min(CHAPTER_PRESETS.length - 1, activeChapter)];
      const presetB = CHAPTER_PRESETS[Math.min(CHAPTER_PRESETS.length - 1, activeChapter + 1)] || presetA;
      const blend = Math.max(0, Math.min(1, chapterProgress));

      // Dynamic distortion & aberration boosted by scroll speed
      const curLens = (presetA.lens + (presetB.lens - presetA.lens) * blend) + Math.min(0.06, scrollVel * 0.06);
      const curCA = (presetA.ca + (presetB.ca - presetA.ca) * blend) + Math.min(0.008, scrollVel * 0.015);
      const curSpeed = Math.min(0.08, scrollVel * 0.04);
      const curVignette = presetA.vignette + (presetB.vignette - presetA.vignette) * blend;
      const curGrain = presetA.grain + (presetB.grain - presetA.grain) * blend;
      const curExposure = presetA.exposure + (presetB.exposure - presetA.exposure) * blend;

      // Update post-processing uniforms
      postMaterial.uniforms.uTime.value = time;
      postMaterial.uniforms.uLens.value = curLens;
      postMaterial.uniforms.uCA.value = curCA;
      postMaterial.uniforms.uSpeed.value = curSpeed;
      postMaterial.uniforms.uVignette.value = curVignette;
      postMaterial.uniforms.uGrain.value = curGrain;
      postMaterial.uniforms.uExposure.value = curExposure;
      postMaterial.uniforms.uStreak.value = presetA.streak + (presetB.streak - presetA.streak) * blend;
      postMaterial.uniforms.uStreakTint.value.lerpColors(presetA.streakTint, presetB.streakTint, blend);
      postMaterial.uniforms.uLift.value.lerpVectors(presetA.lift, presetB.lift, blend);
      postMaterial.uniforms.uGain.value.lerpVectors(presetA.gain, presetB.gain, blend);
      postMaterial.uniforms.uTint.value.lerpVectors(presetA.tint, presetB.tint, blend);

      // Render 1: Main 3D Scene into RenderTarget
      renderer.setRenderTarget(renderTarget);
      renderer.render(scene, camera);

      // Render 2: Post-Processing Quad onto Screen
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);

      // Notify parent component via ref callback
      callbacksRef.current.onProgressUpdate(currentProgress, activeChapter, chapterProgress);

      const isFooter = currentProgress > 0.88;
      document.body.classList.toggle("footer-on", isFooter);

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // -------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------
    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      window.removeEventListener("jump-to-chapter" as any, handleJump);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animId);
      renderTarget.dispose();
      dirtTexture.dispose();
      renderer.dispose();
    };
  }, []); // Empty dependency array ensures Canvas3D is mounted ONCE and never unmounted

  return <canvas id="gl" ref={canvasRef} aria-hidden="true" />;
}

export { Canvas3D };

