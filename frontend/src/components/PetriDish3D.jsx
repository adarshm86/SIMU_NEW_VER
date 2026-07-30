import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const CLASS_COLORS = {
  0: new THREE.Color("#3FA9FF"), // Electric Blue -> Susceptible
  1: new THREE.Color("#FFD54A"), // Bright Yellow -> Intermediate Resistance
  2: new THREE.Color("#FF8C32"), // Bright Orange -> Resistant
  3: new THREE.Color("#FF3B3B"), // Bright Red -> Highly Resistant
  4: new THREE.Color("#E5ECF7"), // Light Gray -> Dead Cell
};

const SPECIES_LABELS = {
  ecoli: "Escherichia coli (E. coli)",
  mrsa: "MRSA (Methicillin-resistant S. aureus)",
  pseudomonas: "Pseudomonas aeruginosa",
};

const TIMELINE_STAGES = [
  { id: 0, label: "Inoculation", range: "Gen 0" },
  { id: 1, label: "Adaptation", range: "Gen 1–2" },
  { id: 2, label: "Colony Expansion", range: "Gen 3–5" },
  { id: 3, label: "Diffusion", range: "Gen 6–10" },
  { id: 4, label: "Mutation", range: "Gen 11–20" },
  { id: 5, label: "Evolution", range: "Gen 21–40" },
  { id: 6, label: "Domination", range: "Gen 40+" },
];

const MAX_INSTANCES = 3000;

function getStageInfo(gen) {
  if (gen === 0) return { index: 0, status: "Inoculating culture — seeding initial population...", stageName: "Stage 1 — Inoculation" };
  if (gen <= 2) return { index: 1, status: "Initial adaptation — cell growth & binary division...", stageName: "Stage 2 — Growth & Division" };
  if (gen <= 5) return { index: 2, status: "Colony expansion detected — organic clustering...", stageName: "Stage 3 — Colony Formation" };
  if (gen <= 10) return { index: 3, status: "Antibiotic applied — diffusion wave expanding across grid...", stageName: "Stage 4 — Antibiotic Action" };
  if (gen <= 20) return { index: 4, status: "Antibiotic clearance — genomic mutation detected!", stageName: "Stage 5 — Genomic Mutation" };
  if (gen <= 40) return { index: 5, status: "Selective pressure — resistant strains expanding...", stageName: "Stage 6 — Resistance Evolution" };
  return { index: 6, status: "Resistant superbug colony dominant — natural selection complete.", stageName: "Stage 7 — Superbug Domination" };
}

export default function PetriDish3D({
  cells = [],
  antibioticField = [],
  gridSize = 40,
  generation = 0,
  species = "ecoli",
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});
  const cellStateRef = useRef([]);
  const generationRef = useRef(generation);
  const startTimeRef = useRef(0);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [mutationNotice, setMutationNotice] = useState(null);

  const currentStage = getStageInfo(generation);

  const previewCells = useMemo(() => {
    if (cells?.length) return cells;

    const preview = [];
    const base = Math.max(18, Math.min(48, Math.round(gridSize / 2)));
    for (let i = 0; i < 80; i++) {
      const offsetX = (i % 9) - 4;
      const offsetY = Math.floor(i / 9) - 4;
      const cls = i % 4;
      preview.push({
        id: i + 1,
        x: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetX * 1.8))),
        y: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetY * 1.8))),
        r: cls === 0 ? 0.18 : cls === 1 ? 0.45 : cls === 2 ? 0.72 : 0.95,
        cls,
        alive: true,
        generation_born: 0,
        mutation_count: cls > 1 ? 1 : 0,
        growth_rate: 0.35,
        parent_id: null,
      });
    }
    return preview;
  }, [cells, gridSize]);

  const speciesScale = useMemo(() => {
    if (species === "mrsa") return 1.35;
    if (species === "pseudomonas") return 1.1;
    return 1;
  }, [species]);

  // Monitor mutation events for live notice banner
  useEffect(() => {
    generationRef.current = generation;
    const mutants = (cells || []).filter((c) => (c.mutation_count || 0) > 0);
    if (mutants.length > 0 && generation > 0) {
      setMutationNotice(`🧬 Mutation Event: ${mutants.length} mutant variants active in Gen ${generation}`);
      const timer = setTimeout(() => setMutationNotice(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [generation, cells]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020712);
    scene.fog = new THREE.FogExp2(0x040c1a, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 11.2, 13.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.75;
    mount.appendChild(renderer.domElement);

    // Unreal Bloom Post-Processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.65, // Bloom Strength
      0.85, // Radius
      0.08  // Threshold
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;
    controls.minDistance = 6;
    controls.maxDistance = 22;
    controls.target.set(0, 0.4, 0);

    // 1. ELEVATED TRANSPARENT GLASS SLAB SURFACE
    const glassSlab = new THREE.Mesh(
      new THREE.BoxGeometry(11.4, 0.45, 11.4),
      new THREE.MeshPhysicalMaterial({
        color: 0x00e5ff,
        metalness: 0.1,
        roughness: 0.04,
        transmission: 0.94,
        transparent: true,
        opacity: 0.35,
        ior: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        reflectivity: 0.9,
      })
    );
    glassSlab.position.y = -0.48;
    glassSlab.receiveShadow = true;
    scene.add(glassSlab);

    // 2. DROP SHADOW BASE
    const shadowBase = new THREE.Mesh(
      new THREE.PlaneGeometry(13.5, 13.5),
      new THREE.MeshBasicMaterial({
        color: 0x01050e,
        transparent: true,
        opacity: 0.88,
      })
    );
    shadowBase.rotation.x = -Math.PI / 2;
    shadowBase.position.y = -0.85;
    scene.add(shadowBase);

    // 3. UNDER-SLAB GLOW DISK
    const slabGlow = new THREE.Mesh(
      new THREE.CircleGeometry(5.8, 64),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
      })
    );
    slabGlow.rotation.x = -Math.PI / 2;
    slabGlow.position.y = -0.72;
    scene.add(slabGlow);

    // 4. NEON CYAN EDGE FRAME
    const glassEdgeFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(11.42, 0.47, 11.42)),
      new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.85 })
    );
    glassEdgeFrame.position.y = -0.48;
    scene.add(glassEdgeFrame);

    // 5. GLOWING SHIMMER GRID
    const grid = new THREE.GridHelper(11.0, Math.max(20, gridSize), 0x00e5ff, 0x1d4ed8);
    grid.position.y = -0.25;
    grid.material.opacity = 0.85;
    grid.material.transparent = true;
    scene.add(grid);

    // 6. CONCENTRIC ANIMATED ANTIBIOTIC DIFFUSION WAVE RINGS
    const waveRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.05, 16, 120),
      new THREE.MeshBasicMaterial({
        color: 0x9c27ff,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      })
    );
    waveRing1.rotation.x = Math.PI / 2;
    waveRing1.position.y = -0.24;
    scene.add(waveRing1);

    const waveRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.04, 16, 120),
      new THREE.MeshBasicMaterial({
        color: 0xff4dff,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
      })
    );
    waveRing2.rotation.x = Math.PI / 2;
    waveRing2.position.y = -0.23;
    scene.add(waveRing2);

    const waveRing3 = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.035, 16, 120),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      })
    );
    waveRing3.rotation.x = Math.PI / 2;
    waveRing3.position.y = -0.22;
    scene.add(waveRing3);

    // 7. ANIMATED ANTIBIOTIC DROPLET (FALLS ON STAGE 4)
    const dropletGeo = new THREE.SphereGeometry(0.32, 24, 24);
    const dropletMat = new THREE.MeshPhongMaterial({
      color: 0xff4dff,
      emissive: 0x9c27ff,
      emissiveIntensity: 2.5,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.9,
    });
    const antibioticDroplet = new THREE.Mesh(dropletGeo, dropletMat);
    antibioticDroplet.position.set(0, 5.0, 0);
    scene.add(antibioticDroplet);

    // 8. CULTURE BASE PLATE
    const culturePlate = new THREE.Mesh(
      new THREE.PlaneGeometry(11.0, 11.0),
      new THREE.MeshStandardMaterial({
        color: 0x061124,
        metalness: 0.1,
        roughness: 0.75,
        transparent: true,
        opacity: 0.92,
      })
    );
    culturePlate.rotation.x = -Math.PI / 2;
    culturePlate.position.y = -0.26;
    culturePlate.receiveShadow = true;
    scene.add(culturePlate);

    // 9. ANTIBIOTIC DIFFUSION HEATMAP CANVAS
    const heatCanvas = document.createElement("canvas");
    heatCanvas.width = 64;
    heatCanvas.height = 64;
    const heatTexture = new THREE.CanvasTexture(heatCanvas);
    const heatGeo = new THREE.PlaneGeometry(11.0, 11.0);
    const heatMat = new THREE.MeshBasicMaterial({
      map: heatTexture,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const heatPlane = new THREE.Mesh(heatGeo, heatMat);
    heatPlane.rotation.x = -Math.PI / 2;
    heatPlane.position.y = -0.245;
    scene.add(heatPlane);

    // 10. NEON BIO-PARTICLES
    const particleCount = 180;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 12.0;
      particlePositions[i3 + 1] = -0.2 + Math.random() * 0.8;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 12.0;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // 11. CINEMATIC LIGHTING SETUP
    scene.add(new THREE.HemisphereLight(0x00e5ff, 0x07111f, 1.6));
    scene.add(new THREE.AmbientLight(0x2288ff, 1.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 12, 7);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const cyanRim = new THREE.PointLight(0x00e5ff, 2.2, 40);
    cyanRim.position.set(-7, 8, -5);
    scene.add(cyanRim);

    const purpleSide = new THREE.PointLight(0x9c27ff, 2.0, 40);
    purpleSide.position.set(6, 6, 6);
    scene.add(purpleSide);

    const orangeAccent = new THREE.PointLight(0xff8c32, 1.5, 30);
    orangeAccent.position.set(5, 7, -4);
    scene.add(orangeAccent);

    const undersideLight = new THREE.PointLight(0x00e5ff, 2.8, 30);
    undersideLight.position.set(0, -1.2, 0);
    scene.add(undersideLight);

    // 12. SPECIES-BASED BACTERIAL GEOMETRY
    let bacteriaGeo;
    if (species === "mrsa") {
      bacteriaGeo = new THREE.SphereGeometry(0.25, 24, 24);
    } else if (species === "pseudomonas") {
      bacteriaGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.46, 16);
    } else {
      bacteriaGeo = new THREE.CapsuleGeometry(0.15, 0.32, 8, 16);
    }

    const bacteriaMat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.98,
      vertexColors: true,
      shininess: 120,
      specular: 0xffffff,
      emissive: new THREE.Color("#081226"),
      emissiveIntensity: 2.2,
      depthWrite: false,
    });

    const instancedMesh = new THREE.InstancedMesh(bacteriaGeo, bacteriaMat, MAX_INSTANCES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(MAX_INSTANCES * 3),
      3
    );
    instancedMesh.frustumCulled = false;
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const tempColor = new THREE.Color();
    let animationId;

    const updateInteraction = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObject(instancedMesh);

      if (intersections.length > 0 && intersections[0].instanceId !== undefined) {
        const instanceId = intersections[0].instanceId;
        const cell = cellStateRef.current[instanceId] || null;
        setHoveredCell(
          cell
            ? {
                id: cell.id,
                generationBorn: cell.generation_born,
                resistanceLevel: typeof cell.r === "number" ? safePct(cell.r) : "10%",
                mutationCount: cell.mutation_count || 0,
                growthRate: cell.growth_rate ?? 0.35,
                alive: cell.alive !== false && cell.cls !== 4,
                parentId: cell.parent_id ?? "—",
              }
            : null
        );
      } else {
        setHoveredCell(null);
      }
    };

    startTimeRef.current = performance.now();

    // 13. ANIMATION & STAGE PROGRESSION LOOP
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      const elapsed = performance.now() - startTimeRef.current;
      const liveCells = cellStateRef.current;
      const generationValue = generationRef.current || 0;
      
      // Stage 1 Inoculation: Cells reveal progressively over 1.8s
      const revealProgress = Math.min(1, elapsed / 1800);
      const visibleCount = Math.min(
        liveCells.length,
        Math.max(30, Math.floor(liveCells.length * (generationValue === 0 ? revealProgress : 1.0)))
      );
      const gridRadius = 5.25;
      const antibioticTint = new THREE.Color("#9C27FF");
      const diffusionTint = new THREE.Color("#FF4DFF");

      controls.autoRotate = generationValue > 0;

      // Grid Shimmer
      if (grid.material && grid.material.opacity !== undefined) {
        grid.material.opacity = 0.72 + Math.sin(time * 3.2) * 0.18;
      }
      slabGlow.material.opacity = 0.22 + Math.sin(time * 2.0) * 0.12;

      // Stage 4 Antibiotic Droplet Drop Animation
      if (generationValue >= 6 && generationValue <= 10) {
        const dropCycle = (time * 0.8) % 3.0;
        const dropY = Math.max(-0.24, 5.0 - dropCycle * 3.5);
        antibioticDroplet.position.y = dropY;
        antibioticDroplet.visible = true;
        if (dropY <= 0) {
          waveRing1.scale.setScalar(1 + (3.0 - dropCycle) * 0.4);
          waveRing2.scale.setScalar(1 + (3.0 - dropCycle) * 0.3);
        }
      } else {
        antibioticDroplet.visible = false;
        waveRing1.scale.setScalar(1 + Math.sin(time * 1.8) * 0.08);
        waveRing2.scale.setScalar(1 + Math.cos(time * 2.2) * 0.10);
      }

      waveRing3.scale.setScalar(1 + Math.sin(time * 2.6) * 0.12);
      waveRing1.rotation.z = time * 0.25;
      waveRing2.rotation.z = -time * 0.35;
      waveRing3.rotation.z = time * 0.45;

      particleField.rotation.y = time * 0.12;
      particleField.material.opacity = 0.45 + Math.sin(time * 2.4) * 0.15;
      controls.update();

      // Render Bacteria Instances
      for (let i = 0; i < visibleCount; i++) {
        const cell = liveCells[i];
        const isCellAlive = cell.alive !== false && cell.cls !== 4;
        const xNorm = (cell.x / Math.max(1, gridSize)) * 2 - 1;
        const yNorm = (cell.y / Math.max(1, gridSize)) * 2 - 1;

        // Cluster bias and organic drift
        const clusterBiasX = Math.sin((cell.y + 1) * 0.34) * 0.55;
        const clusterBiasZ = Math.cos((cell.x + 1) * 0.32) * 0.55;
        const drift = Math.sin(time * 2.2 + i * 0.16 + generationValue * 0.4) * 0.06;
        const px = (xNorm * gridRadius + clusterBiasX + drift) * 0.88;
        const pz = (yNorm * gridRadius + clusterBiasZ + Math.cos(time * 1.8 + i * 0.2 + generationValue * 0.35) * 0.06) * 0.88;

        // Stage 2 Binary Division Stretching & Pulsing
        const isDividing = generationValue >= 1 && generationValue <= 3 && i % 3 === 0;
        const stretchZ = isDividing ? 1.0 + Math.sin(time * 5.0) * 0.35 : 1.0;
        const pulse = isCellAlive ? (1.0 + Math.sin(time * (4.2 + cell.r * 2.4) + i * 0.42) * 0.18) : 0.75;
        const resistanceLift = cell.cls === 3 ? 0.14 : cell.cls === 2 ? 0.10 : cell.cls === 1 ? 0.06 : 0.02;
        const mutationGlow = Math.min(0.55, (cell.mutation_count || 0) * 0.09);
        const scale = speciesScale * (pulse * 1.25) + mutationGlow;
        const lift = isCellAlive ? (0.16 + resistanceLift + Math.sin(time * 3.0 + i * 0.3) * 0.04) : 0.02;

        const abField = antibioticField[Math.floor(((cell.y / Math.max(1, gridSize)) * (antibioticField.length || 1)))]?.[
          Math.floor(((cell.x / Math.max(1, gridSize)) * (antibioticField.length || 1)))
        ] ?? 0;
        const diffusionBlend = Math.min(0.6, abField * 0.75);

        dummy.position.set(px, lift, pz);
        dummy.scale.set(scale, scale, scale * stretchZ);
        if (species === "ecoli" || species === "pseudomonas") {
          dummy.rotation.x = Math.PI / 2;
          dummy.rotation.z = i * 0.35 + time * 0.1;
        }
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Smooth Color Transitions
        tempColor.copy(CLASS_COLORS[cell.cls] ?? CLASS_COLORS[0]);
        if (isCellAlive) {
          tempColor.lerp(antibioticTint, diffusionBlend * 0.35);
          tempColor.lerp(diffusionTint, Math.min(0.3, mutationGlow * 0.9));
          tempColor.multiplyScalar(1.35 + Math.max(0, cell.r) * 0.65);
        } else {
          tempColor.copy(CLASS_COLORS[4]); // Light Gray Dead
          tempColor.multiplyScalar(0.6);
        }
        instancedMesh.setColorAt(i, tempColor);
      }

      for (let i = visibleCount; i < MAX_INSTANCES; i++) {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.count = visibleCount;
      instancedMesh.instanceMatrix.needsUpdate = true;
      instancedMesh.instanceColor.needsUpdate = true;
      composer.render();
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    renderer.domElement.addEventListener("pointermove", updateInteraction);
    renderer.domElement.addEventListener("click", updateInteraction);
    window.addEventListener("resize", onResize);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      instancedMesh,
      dummy,
      heatCanvas,
      heatTexture,
      mount,
      tempColor,
      particleField,
      slabGlow,
    };
  }, [gridSize, species, speciesScale]);

  // UPDATE ANTIBIOTIC DIFFUSION HEATMAP TEXTURE
  useEffect(() => {
    const { heatCanvas, heatTexture } = sceneRef.current;
    if (!heatCanvas || !heatTexture) return;

    if (heatCanvas && antibioticField.length) {
      const ctx = heatCanvas.getContext("2d");
      const size = antibioticField.length;
      heatCanvas.width = size;
      heatCanvas.height = size;
      const imgData = ctx.createImageData(size, size);

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const v = antibioticField[y][x];
          const idx = (y * size + x) * 4;
          const warmth = Math.max(0, Math.min(1, v));

          if (warmth < 0.15) {
            imgData.data[idx] = 0;
            imgData.data[idx + 1] = 0;
            imgData.data[idx + 2] = 0;
            imgData.data[idx + 3] = 0;
          } else if (warmth < 0.5) {
            imgData.data[idx] = 156;
            imgData.data[idx + 1] = 39;
            imgData.data[idx + 2] = 255;
            imgData.data[idx + 3] = Math.round(warmth * 180);
          } else {
            imgData.data[idx] = Math.min(255, 255);
            imgData.data[idx + 1] = Math.min(255, Math.round(77 + warmth * 150));
            imgData.data[idx + 2] = 255;
            imgData.data[idx + 3] = Math.round(warmth * 230);
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      heatTexture.needsUpdate = true;
    }
  }, [antibioticField]);

  useEffect(() => {
    const state = (previewCells || []).map((cell, index) => ({
      ...cell,
      x: typeof cell.x === "number" ? cell.x : index,
      y: typeof cell.y === "number" ? cell.y : index,
    }));
    cellStateRef.current = state;
  }, [previewCells]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex flex-col justify-between">
      <div ref={mountRef} className="w-full h-full min-h-[460px]" />

      {/* TOP BIOLOGICAL STAGE STATUS BANNER */}
      <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between gap-3">
        <div className="rounded-xl border border-cyan-400/40 bg-navy-deep/85 px-4 py-2 text-xs font-data text-medical-white/90 backdrop-blur-md shadow-glass flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <div className="text-[10px] text-cyan-soft uppercase tracking-wider font-bold">{currentStage.stageName}</div>
            <div className="text-xs text-medical-white font-medium">{currentStage.status}</div>
          </div>
        </div>

        <div className="rounded-full border border-purple-400/40 bg-navy-deep/85 px-3.5 py-1.5 text-xs font-data text-purple-300 backdrop-blur-md shadow-glass">
          Generation {generation}
        </div>
      </div>

      {/* LIVE MUTATION NOTICE POPUP */}
      {mutationNotice && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 rounded-xl border border-gold-400/60 bg-gold-500/20 px-4 py-2 text-xs font-data text-gold-300 backdrop-blur-md shadow-glass animate-bounce">
          {mutationNotice}
        </div>
      )}

      {/* RIGHT SIDE PHENOTYPE LEGEND */}
      <div className="pointer-events-none absolute top-16 right-3 rounded-xl border border-cyan-400/30 bg-navy-deep/85 px-3.5 py-2.5 text-[10px] font-data text-medical-white/90 backdrop-blur-md shadow-glass">
        <div className="mb-1.5 text-[9px] tracking-[0.24em] text-cyan-soft uppercase font-bold">Colony Phenotype</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#3FA9FF] shadow-[0_0_8px_#3FA9FF]" />Susceptible</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FFD54A] shadow-[0_0_8px_#FFD54A]" />Intermediate</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FF8C32] shadow-[0_0_8px_#FF8C32]" />Resistant</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FF3B3B] shadow-[0_0_8px_#FF3B3B]" />Highly Resistant</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#E5ECF7] opacity-60" />Dead Cell</div>
        </div>
      </div>

      {/* BOTTOM BIOLOGICAL STAGE TIMELINE BAR */}
      <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-navy-deep/85 p-2 backdrop-blur-md shadow-glass">
        <div className="grid grid-cols-7 gap-1">
          {TIMELINE_STAGES.map((s) => {
            const isActive = currentStage.index === s.id;
            return (
              <div
                key={s.id}
                className={`rounded-lg px-2 py-1.5 text-center transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/30 to-purple-600/30 border border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                    : "bg-charcoal/40 text-medical-white/50 border border-transparent"
                }`}
              >
                <div className="text-[9px] uppercase font-data truncate">{s.label}</div>
                <div className="text-[8px] font-data text-cyan-soft/80">{s.range}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED EDUCATIONAL HOVER TOOLTIP */}
      {hoveredCell && (
        <div className="pointer-events-none absolute bottom-16 right-3 w-[240px] rounded-xl border border-gold-500/50 bg-navy-deep/90 p-3.5 text-[11px] font-data text-medical-white/90 backdrop-blur-md shadow-glass z-20">
          <div className="mb-2 border-b border-white/10 pb-1.5 flex justify-between items-center">
            <span className="text-[10px] tracking-[0.24em] text-cyan-soft uppercase font-bold">Cell Details</span>
            <span className="text-[9px] text-gold-400 font-bold">#CELL-{hoveredCell.id}</span>
          </div>
          <div className="space-y-1 text-[10.5px]">
            <div className="truncate"><span className="text-medical-white/60">Organism:</span> {SPECIES_LABELS[species] || species}</div>
            <div><span className="text-medical-white/60">Current Gen:</span> Gen {generation}</div>
            <div><span className="text-medical-white/60">Resistance Level:</span> <span className="text-cyan-soft font-bold">{hoveredCell.resistanceLevel}</span></div>
            <div><span className="text-medical-white/60">Mutations:</span> <span className="text-purple-300 font-bold">{hoveredCell.mutationCount} events</span></div>
            <div><span className="text-medical-white/60">Growth Rate:</span> {hoveredCell.growthRate} / gen</div>
            <div><span className="text-medical-white/60">Parent Cell:</span> {hoveredCell.parentId}</div>
            <div><span className="text-medical-white/60">Gen Born:</span> Born Gen {hoveredCell.generationBorn}</div>
            <div><span className="text-medical-white/60">Status:</span> <span className={hoveredCell.alive ? "text-emerald-400 font-bold" : "text-gray-400"}>{hoveredCell.alive ? "🟢 Alive (Viable)" : "🔴 Dead (Lysis)"}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function safePct(val) {
  const p = Math.round((val ?? 0) * 100);
  return `${p}%`;
}
