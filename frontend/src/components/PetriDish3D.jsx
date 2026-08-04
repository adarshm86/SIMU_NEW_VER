// import { useEffect, useMemo, useRef, useState } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// // Vibrant, distinct color-coding for jury presentation & bacterial classification
// const CLASS_COLORS = {
//   0: new THREE.Color("#38BDF8"), // Translucent Cyan -> Susceptible Seeding Cells
//   1: new THREE.Color("#0284C7"), // Deep Blue -> Proliferating Active Strains
//   2: new THREE.Color("#F59E0B"), // Amber Gold -> Mutating Intermediate Cells
//   3: new THREE.Color("#EF4444"), // Crimson Red -> Superbug Resistant Strains
//   4: new THREE.Color("#334155"), // Dark Slate -> Lysed / Dead Debris
// };

// const SPECIES_LABELS = {
//   ecoli: "Escherichia coli (Plasmid-Bearing Bacilli)",
//   mrsa: "MRSA (Resistant Staphylococcal Clusters)",
//   pseudomonas: "Pseudomonas aeruginosa (Flagellated Micro-Rods)",
// };

// const TIMELINE_STAGES = [
//   { id: 0, label: "Inoculation", desc: "Seeding cellular matrix" },
//   { id: 1, label: "Proliferation", desc: "Binary fission replication" },
//   { id: 2, label: "Competition", desc: "Nutrient crowding & pressure" },
//   { id: 3, label: "Drug Wave", desc: "Antibiotic chemical assault" },
//   { id: 4, label: "Mutation", desc: "Genomic plasmid ring shift" },
//   { id: 5, label: "Counter-Attack", desc: "Resistant strain survival" },
//   { id: 6, label: "Domination", desc: "Superbug colony takeover" },
// ];

// const MAX_INSTANCES = 2400;

// function getStageInfo(gen) {
//   if (gen === 0) return { index: 0, status: "Seeding translucent bacterial host cells...", stageName: "Phase 1 — Inoculation" };
//   if (gen <= 2) return { index: 1, status: "Replicating intracellular plasmid rings & dividing...", stageName: "Phase 2 — Proliferation" };
//   if (gen <= 5) return { index: 2, status: "Colony crowding and nutrient competition...", stageName: "Phase 3 — Competition" };
//   if (gen <= 10) return { index: 3, status: "⚠️ ANTIBIOTIC CHEMICAL GRADIENT WAVE SPREADING!", stageName: "Phase 4 — Chemical Assault" };
//   if (gen <= 20) return { index: 4, status: "🧬 Plasmid gene transfer & resistance mutation active!", stageName: "Phase 5 — Resistance Warfare" };
//   if (gen <= 40) return { index: 5, status: "Resistant bacteria surviving drug cytotoxicity...", stageName: "Phase 6 — Evolutionary Counter" };
//   return { index: 6, status: "Superbug strain complete microbiological domination.", stageName: "Phase 7 — Strain Domination" };
// }

// export default function PetriDish3D({
//   cells = [],
//   antibioticField = [],
//   gridSize = 40,
//   generation = 0,
//   species = "ecoli",
// }) {
//   const mountRef = useRef(null);
//   const sceneRef = useRef({});
//   const cellStateRef = useRef([]);
//   const generationRef = useRef(generation);
//   const startTimeRef = useRef(0);
//   const [hoveredCell, setHoveredCell] = useState(null);

//   const currentStage = getStageInfo(generation);

//   const previewCells = useMemo(() => {
//     if (cells?.length) return cells;

//     const preview = [];
//     const base = Math.max(18, Math.min(48, Math.round(gridSize / 2)));
//     for (let i = 0; i < 120; i++) {
//       const angle = i * 0.5;
//       const radius = Math.sqrt(i) * 0.35;
//       const cls = i % 4;
//       preview.push({
//         id: i + 1,
//         x: Math.max(0, Math.min(gridSize - 1, Math.round(base + Math.cos(angle) * radius * 3.5))),
//         y: Math.max(0, Math.min(gridSize - 1, Math.round(base + Math.sin(angle) * radius * 3.5))),
//         r: cls === 0 ? 0.05 : cls === 1 ? 0.35 : cls === 2 ? 0.68 : 0.92,
//         cls,
//         alive: true,
//         generation_born: 0,
//         mutation_count: cls > 1 ? 2 : 0,
//         growth_rate: 0.32,
//         parent_id: Math.max(1, i - 4),
//       });
//     }
//     return preview;
//   }, [cells, gridSize]);

//   useEffect(() => {
//     generationRef.current = generation;
//   }, [generation]);

//   useEffect(() => {
//     const mount = mountRef.current;
//     if (!mount) return;

//     const width = mount.clientWidth;
//     const height = mount.clientHeight;

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x020617); // Deep micro-laboratory navy
//     scene.fog = new THREE.FogExp2(0x020617, 0.018);

//     const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
//     camera.position.set(0, 11.0, 12.0);
//     camera.lookAt(0, 0, 0);

//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.outputColorSpace = THREE.SRGBColorSpace;
//     renderer.shadowMap.enabled = true;
//     renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     renderer.toneMappingExposure = 1.8;
//     mount.appendChild(renderer.domElement);

//     const composer = new EffectComposer(renderer);
//     const renderPass = new RenderPass(scene, camera);
//     const bloomPass = new UnrealBloomPass(
//       new THREE.Vector2(width, height),
//       1.3,  // High-end glowing bioluminescence for DNA rings & cell walls
//       0.7,
//       0.12
//     );
//     composer.addPass(renderPass);
//     composer.addPass(bloomPass);

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.enablePan = true;
//     controls.autoRotate = true;
//     controls.autoRotateSpeed = 0.25;
//     controls.minDistance = 4;
//     controls.maxDistance = 18;
//     controls.target.set(0, 0, 0);

//     // GLASS PETRI DISH & AGAR GEL LAYER
//     const dishGlass = new THREE.Mesh(
//       new THREE.CylinderGeometry(5.4, 5.4, 0.3, 64),
//       new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.94, transparent: true, opacity: 0.45, roughness: 0.05 })
//     );
//     dishGlass.position.y = -0.25;
//     scene.add(dishGlass);

//     const agarGel = new THREE.Mesh(
//       new THREE.CylinderGeometry(5.2, 5.2, 0.15, 64),
//       new THREE.MeshStandardMaterial({ color: 0x060f22, roughness: 0.4, metalness: 0.1 })
//     );
//     agarGel.position.y = -0.15;
//     scene.add(agarGel);

//     // ANTIBIOTIC HEATMAP CANVAS
//     const heatCanvas = document.createElement("canvas");
//     heatCanvas.width = 64;
//     heatCanvas.height = 64;
//     const heatTexture = new THREE.CanvasTexture(heatCanvas);
//     const heatPlane = new THREE.Mesh(
//       new THREE.PlaneGeometry(10.2, 10.2),
//       new THREE.MeshBasicMaterial({ map: heatTexture, transparent: true, opacity: 0.88, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
//     );
//     heatPlane.rotation.x = -Math.PI / 2;
//     heatPlane.position.y = -0.06;
//     scene.add(heatPlane);

//     // SCIENTIFIC GRID
//     const grid = new THREE.GridHelper(10.2, Math.max(20, gridSize), 0x0284c7, 0x0f172a);
//     grid.position.y = -0.055;
//     grid.material.opacity = 0.3;
//     grid.material.transparent = true;
//     scene.add(grid);

//     // LABORATORY LIGHTING
//     scene.add(new THREE.HemisphereLight(0xffffff, 0x040a1c, 1.6));
//     const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
//     keyLight.position.set(6, 15, 6);
//     scene.add(keyLight);

//     // ==========================================
//     // RECREATING THE EXACT REFERENCE IMAGE STRUCTURE:
//     // 1. Translucent Outer Cell Wall Capsule
//     // 2. Dual Intracellular DNA / Plasmid Rings (Torrus/Torus Rings inside)
//     // ==========================================
    
//     // Outer Cell Wall Capsule Geometry
//     const cellGeo = new THREE.CapsuleGeometry(0.18, 0.48, 8, 16);
//     const cellMat = new THREE.MeshPhysicalMaterial({
//       color: 0x38bdf8,
//       transmission: 0.85,
//       opacity: 0.75,
//       transparent: true,
//       roughness: 0.1,
//       ior: 1.33,
//     });

//     // Inner Plasmid DNA Ring Geometry (Torus mimicking double helix rings)
//     const dnaRingGeo = new THREE.TorusGeometry(0.09, 0.018, 12, 32);
//     const dnaRingMat = new THREE.MeshStandardMaterial({
//       color: 0x60a5fa,
//       roughness: 0.2,
//       metalness: 0.6,
//       emissive: 0x1d4ed8,
//       emissiveIntensity: 0.6,
//     });

//     const cellMesh = new THREE.InstancedMesh(cellGeo, cellMat, MAX_INSTANCES);
//     cellMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
//     cellMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_INSTANCES * 3), 3);
//     cellMesh.frustumCulled = false;
//     scene.add(cellMesh);

//     // We can also create a matching instanced mesh for the inner dual DNA rings
//     const ringMesh1 = new THREE.InstancedMesh(dnaRingGeo, dnaRingMat, MAX_INSTANCES);
//     const ringMesh2 = new THREE.InstancedMesh(dnaRingGeo, dnaRingMat, MAX_INSTANCES);
//     ringMesh1.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
//     ringMesh2.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
//     ringMesh1.frustumCulled = false;
//     ringMesh2.frustumCulled = false;
//     scene.add(ringMesh1);
//     scene.add(ringMesh2);

//     const dummy = new THREE.Object3D();
//     const dummyRing = new THREE.Object3D();
//     const raycaster = new THREE.Raycaster();
//     const pointer = new THREE.Vector2();
//     const tempColor = new THREE.Color();
//     let animationId;

//     const updateInteraction = (event) => {
//       const rect = renderer.domElement.getBoundingClientRect();
//       pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
//       raycaster.setFromCamera(pointer, camera);
//       const intersections = raycaster.intersectObject(cellMesh);

//       if (intersections.length > 0 && intersections[0].instanceId !== undefined) {
//         const instanceId = intersections[0].instanceId;
//         const cell = cellStateRef.current[instanceId] || null;
//         setHoveredCell(
//           cell
//             ? {
//                 id: cell.id || 1042,
//                 generationBorn: cell.generation_born ?? generationRef.current,
//                 resistanceLevel: typeof cell.r === "number" ? safePct(cell.r) : "82%",
//                 mutationCount: cell.mutation_count ?? 2,
//                 growthRate: cell.growth_rate ?? 0.32,
//                 alive: cell.alive !== false && cell.cls !== 4,
//                 parentId: cell.parent_id ?? "—",
//               }
//             : null
//         );
//       }
//     };

//     startTimeRef.current = performance.now();

//     const animate = () => {
//       animationId = requestAnimationFrame(animate);
//       const time = performance.now() * 0.001;
//       const liveCells = cellStateRef.current;

//       controls.autoRotate = true;
//       controls.update();

//       const visibleCount = Math.min(liveCells.length, MAX_INSTANCES);

//       for (let i = 0; i < visibleCount; i++) {
//         const cell = liveCells[i];
//         const isCellAlive = cell.alive !== false && cell.cls !== 4;
//         const isResistant = cell.cls >= 2;

//         const xNorm = (cell.x / Math.max(1, gridSize - 1)) * 2 - 1;
//         const yNorm = (cell.y / Math.max(1, gridSize - 1)) * 2 - 1;
//         const px = xNorm * 4.3;
//         const pz = yNorm * 4.3;

//         // Cellular micro-collision jiggle & fluid suspension drift
//         const driftX = isCellAlive ? Math.sin(time * 3.5 + i * 1.1) * 0.03 : 0;
//         const driftZ = isCellAlive ? Math.cos(time * 3.0 + i * 0.9) * 0.03 : 0;
//         const pulse = isCellAlive ? (1.0 + Math.sin(time * 5.0 + i * 0.7) * 0.1) : 0.3;

//         // Position outer translucent cell capsule
//         dummy.position.set(px + driftX, isCellAlive ? 0.05 : -0.05, pz + driftZ);
//         dummy.scale.set(pulse, pulse, pulse);
//         const angle = Math.atan2(pz, px) + Math.sin(i) * 0.3;
//         dummy.rotation.set(0.2 * Math.sin(time + i), angle, 0.1 * Math.cos(time));
//         dummy.updateMatrix();
//         cellMesh.setMatrixAt(i, dummy.matrix);

//         // Position upper and lower intracellular plasmid DNA rings inside the cell capsule (matching reference image)
//         dummyRing.position.set(px + driftX, (isCellAlive ? 0.05 : -0.05) + 0.14, pz + driftZ);
//         dummyRing.scale.set(pulse * 0.85, pulse * 0.85, pulse * 0.85);
//         dummyRing.rotation.set(Math.PI / 2 + Math.sin(time * 2 + i) * 0.2, angle, 0);
//         dummyRing.updateMatrix();
//         ringMesh1.setMatrixAt(i, dummyRing.matrix);

//         dummyRing.position.set(px + driftX, (isCellAlive ? 0.05 : -0.05) - 0.14, pz + driftZ);
//         dummyRing.rotation.set(Math.PI / 2 - Math.cos(time * 2 + i) * 0.2, angle, 0);
//         dummyRing.updateMatrix();
//         ringMesh2.setMatrixAt(i, dummyRing.matrix);

//         // Jury color-coding for cell wall & resistance state
//         if (isCellAlive) {
//           tempColor.copy(CLASS_COLORS[cell.cls] ?? CLASS_COLORS[0]);
//         } else {
//           tempColor.copy(CLASS_COLORS[4]); // Lysed debris
//         }
//         cellMesh.setColorAt(i, tempColor);
//       }

//       for (let i = visibleCount; i < MAX_INSTANCES; i++) {
//         dummy.position.set(0, -999, 0);
//         dummy.scale.setScalar(0);
//         dummy.updateMatrix();
//         cellMesh.setMatrixAt(i, dummy.matrix);
//         ringMesh1.setMatrixAt(i, dummy.matrix);
//         ringMesh2.setMatrixAt(i, dummy.matrix);
//       }

//       cellMesh.count = visibleCount;
//       ringMesh1.count = visibleCount;
//       ringMesh2.count = visibleCount;

//       cellMesh.instanceMatrix.needsUpdate = true;
//       cellMesh.instanceColor.needsUpdate = true;
//       ringMesh1.instanceMatrix.needsUpdate = true;
//       ringMesh2.instanceMatrix.needsUpdate = true;
//       composer.render();
//     };
//     animate();

//     const onResize = () => {
//       const w = mount.clientWidth;
//       const h = mount.clientHeight;
//       camera.aspect = w / h;
//       camera.updateProjectionMatrix();
//       renderer.setSize(w, h);
//       composer.setSize(w, h);
//     };

//     renderer.domElement.addEventListener("pointermove", updateInteraction);
//     renderer.domElement.addEventListener("click", updateInteraction);
//     window.addEventListener("resize", onResize);

//     sceneRef.current = { scene, camera, renderer, controls, cellMesh, ringMesh1, ringMesh2, dummy, heatCanvas, heatTexture };

//     return () => {
//       cancelAnimationFrame(animationId);
//       window.removeEventListener("resize", onResize);
//       renderer.dispose();
//       mount.innerHTML = "";
//     };
//   }, [gridSize]);

//   useEffect(() => {
//     const { heatCanvas, heatTexture } = sceneRef.current;
//     if (!heatCanvas || !heatTexture) return;

//     if (antibioticField.length) {
//       const ctx = heatCanvas.getContext("2d");
//       const size = antibioticField.length;
//       heatCanvas.width = size;
//       heatCanvas.height = size;
//       const imgData = ctx.createImageData(size, size);

//       for (let y = 0; y < size; y++) {
//         for (let x = 0; x < size; x++) {
//           const v = antibioticField[y][x];
//           const idx = (y * size + x) * 4;
//           const warmth = Math.max(0, Math.min(1, v));

//           if (warmth < 0.05) {
//             imgData.data[idx] = 0;
//             imgData.data[idx + 1] = 0;
//             imgData.data[idx + 2] = 0;
//             imgData.data[idx + 3] = 0;
//           } else {
//             // High-visibility glowing chemical antibiotic diffusion gradient
//             imgData.data[idx] = Math.round(240 + warmth * 15);
//             imgData.data[idx + 1] = Math.round(90 + warmth * 40);
//             imgData.data[idx + 2] = 20;
//             imgData.data[idx + 3] = Math.round(warmth * 230);
//           }
//         }
//       }

//       ctx.putImageData(imgData, 0, 0);
//       heatTexture.needsUpdate = true;
//     }
//   }, [antibioticField]);

//   useEffect(() => {
//     const state = (previewCells || []).map((cell, index) => ({
//       ...cell,
//       x: typeof cell.x === "number" ? cell.x : index,
//       y: typeof cell.y === "number" ? cell.y : index,
//     }));
//     cellStateRef.current = state;
//   }, [previewCells]);

//   const activeTooltip = hoveredCell || {
//     id: 1042,
//     generationBorn: generation,
//     resistanceLevel: "82%",
//     mutationCount: 2,
//     growthRate: 0.32,
//     alive: true,
//     parentId: 89,
//   };

//   return (
//     <div className="relative w-full h-full min-h-[560px] flex flex-col justify-between select-none bg-[#020617]">
//       <div ref={mountRef} className="w-full h-full min-h-[520px]" />

//       {/* Top Header Status for Jury */}
//       <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-3 pointer-events-none">
//         <div className="rounded-xl border border-cyan-500/40 bg-[#060b19]/95 px-4 py-2 text-xs font-data text-white/90 backdrop-blur-md shadow-lg flex items-center gap-2.5">
//           <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
//           <div>
//             <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">{currentStage.stageName}</div>
//             <div className="text-xs text-white/90 font-medium">{currentStage.status}</div>
//           </div>
//         </div>
//         <div className="rounded-full border border-sky-500/40 bg-[#060b19]/95 px-3.5 py-1.5 text-xs font-data text-sky-300 backdrop-blur-md shadow-lg">
//           Generation {generation}
//         </div>
//       </div>

//       {/* Floating Detailed Cell Telemetry Card */}
//       <div className="absolute top-20 right-3 w-[230px] rounded-xl border border-cyan-500/50 bg-[#060b19]/95 p-3.5 text-[11px] font-data text-white/90 backdrop-blur-md shadow-2xl z-20 pointer-events-none">
//         <div className="mb-2 border-b border-white/10 pb-1.5 flex justify-between items-center">
//           <span className="text-[10px] tracking-widest text-cyan-400 uppercase font-bold">Intracellular Telemetry</span>
//           <span className="text-[9px] text-amber-400 font-bold">#{activeTooltip.id}</span>
//         </div>
//         <div className="space-y-1 text-[10.5px]">
//           <div className="truncate"><span className="text-white/50">Strain:</span> {SPECIES_LABELS[species] || species}</div>
//           <div><span className="text-white/50">Resistance:</span> <span className="text-amber-400 font-bold">{activeTooltip.resistanceLevel}</span></div>
//           <div><span className="text-white/50">Plasmid Rings:</span> <span className="text-sky-300 font-bold">Dual Helix Active</span></div>
//           <div><span className="text-white/50">Mutations:</span> <span className="text-red-400 font-bold">{activeTooltip.mutationCount} shifts</span></div>
//           <div><span className="text-white/50">Growth Rate:</span> {activeTooltip.growthRate} / gen</div>
//           <div><span className="text-white/50">Status:</span> <span className={activeTooltip.alive ? "text-emerald-400 font-bold" : "text-slate-400"}>{activeTooltip.alive ? "🟢 Viable Host Cell" : "⚪ Lysed Debris"}</span></div>
//         </div>
//       </div>

//       {/* Bottom Timeline Stages Bar */}
//       <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-[#040814]/95 p-2 backdrop-blur-md shadow-lg">
//         <div className="grid grid-cols-7 gap-1.5">
//           {TIMELINE_STAGES.map((s) => {
//             const isActive = currentStage.index === s.id;
//             return (
//               <div
//                 key={s.id}
//                 className={`rounded-lg px-2 py-1.5 text-center transition-all ${
//                   isActive
//                     ? "bg-cyan-500/25 border border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(56,189,248,0.35)]"
//                     : "bg-[#0a1124]/60 text-white/50 border border-transparent"
//                 }`}
//               >
//                 <div className="text-[9px] uppercase font-bold truncate text-cyan-300">{s.label}</div>
//                 <div className="text-[8px] text-white/60 truncate">{s.desc}</div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// function safePct(val) {
//   const p = Math.round((val ?? 0) * 100);
//   return `${p}%`;
// }


// import { useEffect, useMemo, useRef, useState } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

// const CLASS_COLORS = {
//   0: new THREE.Color("#10B981"), // Emerald Green -> Susceptible (Vulnerable)
//   1: new THREE.Color("#FBBF24"), // Amber -> Mutating / Adapting
//   2: new THREE.Color("#F97316"), // Vibrant Orange -> Resistant Strain
//   3: new THREE.Color("#EF4444"), // Crimson Red -> Superbug Warrior
//   4: new THREE.Color("#334155"), // Dark Gray -> Dead / Lysed Debris
// };

// const SPECIES_LABELS = {
//   ecoli: "Escherichia coli (E. coli)",
//   mrsa: "MRSA (Methicillin-resistant S. aureus)",
//   pseudomonas: "Pseudomonas aeruginosa",
// };

// const TIMELINE_STAGES = [
//   { id: 0, label: "Inoculation", range: "Gen 0" },
//   { id: 1, label: "Adaptation", range: "Gen 1–2" },
//   { id: 2, label: "Colony War", range: "Gen 3–5" },
//   { id: 3, label: "Drug Wave", range: "Gen 6–10" },
//   { id: 4, label: "Mutation", range: "Gen 11–20" },
//   { id: 5, label: "Evolution", range: "Gen 21–40" },
//   { id: 6, label: "Domination", range: "Gen 40+" },
// ];

// const MAX_INSTANCES = 3500;

// function getStageInfo(gen) {
//   if (gen === 0) return { index: 0, status: "Inoculating culture — seeding initial micro-colonies...", stageName: "Phase 1 — Inoculation" };
//   if (gen <= 2) return { index: 1, status: "Rapid binary division — colonies expanding for territory...", stageName: "Phase 2 — Proliferation" };
//   if (gen <= 5) return { index: 2, status: "Colony crowding — resource competition active...", stageName: "Phase 3 — Competition" };
//   if (gen <= 10) return { index: 3, status: "⚠️ ANTIBIOTIC WAVE DEPLOYED — Susceptible cells under attack!", stageName: "Phase 4 — Chemical Assault" };
//   if (gen <= 20) return { index: 4, status: "🧬 Genomic mutation triggered — resistant strains fighting back!", stageName: "Phase 5 — Resistance Warfare" };
//   if (gen <= 40) return { index: 5, status: "Selective pressure sweep — survivors counter-attacking...", stageName: "Phase 6 — Evolutionary Counter" };
//   return { index: 6, status: "Superbug dominance achieved — complete resistance evolution.", stageName: "Phase 7 — Strain Domination" };
// }

// export default function PetriDish3D({
//   cells = [],
//   antibioticField = [],
//   gridSize = 40,
//   generation = 0,
//   species = "ecoli",
// }) {
//   const mountRef = useRef(null);
//   const sceneRef = useRef({});
//   const cellStateRef = useRef([]);
//   const generationRef = useRef(generation);
//   const startTimeRef = useRef(0);
//   const [hoveredCell, setHoveredCell] = useState(null);
//   const [mutationNotice, setMutationNotice] = useState(null);

//   const currentStage = getStageInfo(generation);

//   const previewCells = useMemo(() => {
//     if (cells?.length) return cells;

//     const preview = [];
//     const base = Math.max(18, Math.min(48, Math.round(gridSize / 2)));
//     for (let i = 0; i < 90; i++) {
//       const offsetX = (i % 10) - 4.5;
//       const offsetY = Math.floor(i / 10) - 4.5;
//       const cls = i % 4;
//       preview.push({
//         id: i + 1,
//         x: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetX * 1.8))),
//         y: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetY * 1.8))),
//         r: cls === 0 ? 0.05 : cls === 1 ? 0.35 : cls === 2 ? 0.68 : 0.92,
//         cls,
//         alive: true,
//         generation_born: 0,
//         mutation_count: cls > 1 ? 1 : 0,
//         growth_rate: 0.35,
//         parent_id: null,
//       });
//     }
//     return preview;
//   }, [cells, gridSize]);

//   useEffect(() => {
//     generationRef.current = generation;
//     const mutants = (cells || []).filter((c) => (c.mutation_count || 0) > 0);
//     if (mutants.length > 0 && generation > 0) {
//       setMutationNotice(`⚡ Resistance Shield Activated: ${mutants.length} mutant strains defending against drug wave!`);
//       const timer = setTimeout(() => setMutationNotice(null), 3500);
//       return () => clearTimeout(timer);
//     }
//   }, [generation, cells]);

//   useEffect(() => {
//     const mount = mountRef.current;
//     if (!mount) return;

//     const width = mount.clientWidth;
//     const height = mount.clientHeight;

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x010409);
//     scene.fog = new THREE.FogExp2(0x020611, 0.025);

//     const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
//     camera.position.set(0, 11.5, 13.5);
//     camera.lookAt(0, 0, 0);

//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
//     renderer.setSize(width, height);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     renderer.outputColorSpace = THREE.SRGBColorSpace;
//     renderer.shadowMap.enabled = true;
//     renderer.toneMapping = THREE.ACESFilmicToneMapping;
//     renderer.toneMappingExposure = 1.9;
//     mount.appendChild(renderer.domElement);

//     const composer = new EffectComposer(renderer);
//     const renderPass = new RenderPass(scene, camera);
//     const bloomPass = new UnrealBloomPass(
//       new THREE.Vector2(width, height),
//       1.3, // High fluorescence for bioluminescent bacteria look
//       0.7, 
//       0.1
//     );
//     composer.addPass(renderPass);
//     composer.addPass(bloomPass);

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.enablePan = true;
//     controls.autoRotate = true;
//     controls.autoRotateSpeed = 0.45;
//     controls.minDistance = 5;
//     controls.maxDistance = 22;
//     controls.target.set(0, 0.2, 0);

//     // GLASS PETRI DISH RIM & AGAR BASE
//     const dishRim = new THREE.Mesh(
//       new THREE.RingGeometry(5.4, 5.7, 64),
//       new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.92, transparent: true, opacity: 0.7, roughness: 0.05, side: THREE.DoubleSide })
//     );
//     dishRim.rotation.x = -Math.PI / 2;
//     dishRim.position.y = -0.21;
//     scene.add(dishRim);

//     const culturePlate = new THREE.Mesh(
//       new THREE.PlaneGeometry(11.0, 11.0),
//       new THREE.MeshStandardMaterial({ color: 0x030b18, metalness: 0.25, roughness: 0.6 })
//     );
//     culturePlate.rotation.x = -Math.PI / 2;
//     culturePlate.position.y = -0.26;
//     scene.add(culturePlate);

//     // ANTIBIOTIC WAVE HEATMAP
//     const heatCanvas = document.createElement("canvas");
//     heatCanvas.width = 64;
//     heatCanvas.height = 64;
//     const heatTexture = new THREE.CanvasTexture(heatCanvas);
//     const heatPlane = new THREE.Mesh(
//       new THREE.PlaneGeometry(11.0, 11.0),
//       new THREE.MeshBasicMaterial({ map: heatTexture, transparent: true, opacity: 0.92, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
//     );
//     heatPlane.rotation.x = -Math.PI / 2;
//     heatPlane.position.y = -0.245;
//     scene.add(heatPlane);

//     // GRID & LIGHTS
//     const grid = new THREE.GridHelper(11.0, Math.max(20, gridSize), 0x0284c7, 0x0f172a);
//     grid.position.y = -0.25;
//     grid.material.opacity = 0.5;
//     grid.material.transparent = true;
//     scene.add(grid);

//     scene.add(new THREE.HemisphereLight(0xffffff, 0x040e1f, 1.5));
//     const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
//     keyLight.position.set(7, 14, 7);
//     scene.add(keyLight);

//     // REALISTIC BACILLI / COCCI BACTERIA GEOMETRY (Capsule Rods)
//     const bacteriaGeo = new THREE.CapsuleGeometry(0.075, 0.2, 10, 16);
//     const bacteriaMat = new THREE.MeshStandardMaterial({
//       color: 0xffffff,
//       roughness: 0.2,
//       metalness: 0.2,
//       transparent: true,
//       opacity: 0.98,
//     });

//     const instancedMesh = new THREE.InstancedMesh(bacteriaGeo, bacteriaMat, MAX_INSTANCES);
//     instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
//     instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_INSTANCES * 3), 3);
//     instancedMesh.frustumCulled = false;
//     scene.add(instancedMesh);

//     const dummy = new THREE.Object3D();
//     const raycaster = new THREE.Raycaster();
//     const pointer = new THREE.Vector2();
//     const tempColor = new THREE.Color();
//     let animationId;

//     const updateInteraction = (event) => {
//       const rect = renderer.domElement.getBoundingClientRect();
//       pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
//       pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
//       raycaster.setFromCamera(pointer, camera);
//       const intersections = raycaster.intersectObject(instancedMesh);

//       if (intersections.length > 0 && intersections[0].instanceId !== undefined) {
//         const instanceId = intersections[0].instanceId;
//         const cell = cellStateRef.current[instanceId] || null;
//         setHoveredCell(
//           cell
//             ? {
//                 id: cell.id,
//                 generationBorn: cell.generation_born,
//                 resistanceLevel: typeof cell.r === "number" ? safePct(cell.r) : "0%",
//                 mutationCount: cell.mutation_count || 0,
//                 growthRate: cell.growth_rate ?? 0.35,
//                 alive: cell.alive !== false && cell.cls !== 4,
//                 parentId: cell.parent_id ?? "—",
//               }
//             : null
//         );
//       } else {
//         setHoveredCell(null);
//       }
//     };

//     startTimeRef.current = performance.now();

//     const animate = () => {
//       animationId = requestAnimationFrame(animate);
//       const time = performance.now() * 0.001;
//       const elapsed = performance.now() - startTimeRef.current;
//       const liveCells = cellStateRef.current;
//       const generationValue = generationRef.current || 0;

//       const revealProgress = Math.min(1, elapsed / 1400);
//       const visibleCount = Math.min(
//         liveCells.length,
//         Math.max(30, Math.floor(liveCells.length * (generationValue === 0 ? revealProgress : 1.0)))
//       );

//       controls.autoRotate = generationValue > 0;
//       controls.update();

//       for (let i = 0; i < visibleCount; i++) {
//         const cell = liveCells[i];
//         const isCellAlive = cell.alive !== false && cell.cls !== 4;
//         const isResistant = cell.cls >= 2;

//         const xNorm = (cell.x / Math.max(1, gridSize - 1)) * 2 - 1;
//         const yNorm = (cell.y / Math.max(1, gridSize - 1)) * 2 - 1;
//         const px = xNorm * 5.1;
//         const pz = yNorm * 5.1;

//         // Active bacteria fighting jitter: Resistant cells vibrate aggressively, dead cells sink
//         const jitterIntensity = isResistant ? 0.05 : 0.02;
//         const jitterX = isCellAlive ? Math.sin(time * 6.0 + i * 1.5) * jitterIntensity : 0;
//         const jitterZ = isCellAlive ? Math.cos(time * 7.0 + i * 1.2) * jitterIntensity : 0;
        
//         // Pulsing life force or dying shrink
//         const pulse = isCellAlive ? (1.0 + Math.sin(time * 5.5 + i * 0.8) * (isResistant ? 0.18 : 0.08)) : 0.55;

//         dummy.position.set(px + jitterX, isCellAlive ? 0.05 : -0.06, pz + jitterZ);
//         dummy.scale.set(pulse, pulse, pulse);
        
//         // Dynamic organic tilt representing active movement
//         dummy.rotation.set(Math.sin(time * 2 + i) * 0.4, time * 0.8 + i, Math.cos(time * 1.5 + i) * 0.4);
//         dummy.updateMatrix();
//         instancedMesh.setMatrixAt(i, dummy.matrix);

//         // Color mapping with glowing warning states for resistant fighters
//         if (isCellAlive) {
//           tempColor.copy(CLASS_COLORS[cell.cls] ?? CLASS_COLORS[0]);
//         } else {
//           tempColor.copy(CLASS_COLORS[4]); // Dead Lysed Debris
//         }
//         instancedMesh.setColorAt(i, tempColor);
//       }

//       for (let i = visibleCount; i < MAX_INSTANCES; i++) {
//         dummy.position.set(0, -999, 0);
//         dummy.scale.setScalar(0);
//         dummy.updateMatrix();
//         instancedMesh.setMatrixAt(i, dummy.matrix);
//       }

//       instancedMesh.count = visibleCount;
//       instancedMesh.instanceMatrix.needsUpdate = true;
//       instancedMesh.instanceColor.needsUpdate = true;
//       composer.render();
//     };
//     animate();

//     const onResize = () => {
//       const w = mount.clientWidth;
//       const h = mount.clientHeight;
//       camera.aspect = w / h;
//       camera.updateProjectionMatrix();
//       renderer.setSize(w, h);
//       composer.setSize(w, h);
//     };

//     renderer.domElement.addEventListener("pointermove", updateInteraction);
//     renderer.domElement.addEventListener("click", updateInteraction);
//     window.addEventListener("resize", onResize);

//     sceneRef.current = { scene, camera, renderer, controls, instancedMesh, dummy, heatCanvas, heatTexture };

//     return () => {
//       cancelAnimationFrame(animationId);
//       window.removeEventListener("resize", onResize);
//       renderer.dispose();
//       mount.innerHTML = "";
//     };
//   }, [gridSize]);

//   useEffect(() => {
//     const { heatCanvas, heatTexture } = sceneRef.current;
//     if (!heatCanvas || !heatTexture) return;

//     if (antibioticField.length) {
//       const ctx = heatCanvas.getContext("2d");
//       const size = antibioticField.length;
//       heatCanvas.width = size;
//       heatCanvas.height = size;
//       const imgData = ctx.createImageData(size, size);

//       for (let y = 0; y < size; y++) {
//         for (let x = 0; x < size; x++) {
//           const v = antibioticField[y][x];
//           const idx = (y * size + x) * 4;
//           const warmth = Math.max(0, Math.min(1, v));

//           if (warmth < 0.08) {
//             imgData.data[idx] = 0;
//             imgData.data[idx + 1] = 0;
//             imgData.data[idx + 2] = 0;
//             imgData.data[idx + 3] = 0;
//           } else {
//             // Intense electric cyan & violet chemical warfare wave representing the antibiotic
//             imgData.data[idx] = Math.round(90 + warmth * 165);
//             imgData.data[idx + 1] = Math.round(180 + warmth * 75);
//             imgData.data[idx + 2] = 255;
//             imgData.data[idx + 3] = Math.round(warmth * 235);
//           }
//         }
//       }

//       ctx.putImageData(imgData, 0, 0);
//       heatTexture.needsUpdate = true;
//     }
//   }, [antibioticField]);

//   useEffect(() => {
//     const state = (previewCells || []).map((cell, index) => ({
//       ...cell,
//       x: typeof cell.x === "number" ? cell.x : index,
//       y: typeof cell.y === "number" ? cell.y : index,
//     }));
//     cellStateRef.current = state;
//   }, [previewCells]);

//   return (
//     <div className="relative w-full h-full min-h-[500px] flex flex-col justify-between">
//       <div ref={mountRef} className="w-full h-full min-h-[460px]" />

//       <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between gap-3">
//         <div className="rounded-xl border border-cyan-400/40 bg-navy-deep/85 px-4 py-2 text-xs font-data text-medical-white/90 backdrop-blur-md shadow-glass flex items-center gap-2.5">
//           <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
//           <div>
//             <div className="text-[10px] text-cyan-soft uppercase tracking-wider font-bold">{currentStage.stageName}</div>
//             <div className="text-xs text-medical-white font-medium">{currentStage.status}</div>
//           </div>
//         </div>
//         <div className="rounded-full border border-purple-400/40 bg-navy-deep/85 px-3.5 py-1.5 text-xs font-data text-purple-300 backdrop-blur-md shadow-glass">
//           Generation {generation}
//         </div>
//       </div>

//       {mutationNotice && (
//         <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 rounded-xl border border-gold-400/60 bg-gold-500/20 px-4 py-2 text-xs font-data text-gold-300 backdrop-blur-md shadow-glass animate-bounce">
//           {mutationNotice}
//         </div>
//       )}

//       <div className="pointer-events-none absolute top-16 right-3 rounded-xl border border-cyan-400/30 bg-navy-deep/85 px-3.5 py-2.5 text-[10px] font-data text-medical-white/90 backdrop-blur-md shadow-glass">
//         <div className="mb-1.5 text-[9px] tracking-[0.24em] text-cyan-soft uppercase font-bold">Colony Battle Status</div>
//         <div className="space-y-1.5">
//           <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />Susceptible (Vulnerable)</div>
//           <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24] shadow-[0_0_8px_#FBBF24]" />Adapting Strain</div>
//           <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#F97316] shadow-[0_0_8px_#F97316]" />Resistant Warrior</div>
//           <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />Superbug Dominant</div>
//           <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#334155] opacity-60" />Lysed Debris</div>
//         </div>
//       </div>

//       <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-navy-deep/85 p-2 backdrop-blur-md shadow-glass">
//         <div className="grid grid-cols-7 gap-1">
//           {TIMELINE_STAGES.map((s) => {
//             const isActive = currentStage.index === s.id;
//             return (
//               <div
//                 key={s.id}
//                 className={`rounded-lg px-2 py-1.5 text-center transition-all ${
//                   isActive
//                     ? "bg-gradient-to-r from-cyan-500/30 to-purple-600/30 border border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]"
//                     : "bg-charcoal/40 text-medical-white/50 border border-transparent"
//                 }`}
//               >
//                 <div className="text-[9px] uppercase font-data truncate">{s.label}</div>
//                 <div className="text-[8px] font-data text-cyan-soft/80">{s.range}</div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {hoveredCell && (
//         <div className="pointer-events-none absolute bottom-16 right-3 w-[240px] rounded-xl border border-gold-500/50 bg-navy-deep/90 p-3.5 text-[11px] font-data text-medical-white/90 backdrop-blur-md shadow-glass z-20">
//           <div className="mb-2 border-b border-white/10 pb-1.5 flex justify-between items-center">
//             <span className="text-[10px] tracking-[0.24em] text-cyan-soft uppercase font-bold">Cell Combat Stats</span>
//             <span className="text-[9px] text-gold-400 font-bold">#CELL-{hoveredCell.id}</span>
//           </div>
//           <div className="space-y-1 text-[10.5px]">
//             <div className="truncate"><span className="text-medical-white/60">Organism:</span> {SPECIES_LABELS[species] || species}</div>
//             <div><span className="text-medical-white/60">Current Gen:</span> Gen {generation}</div>
//             <div><span className="text-medical-white/60">Resistance Level:</span> <span className="text-cyan-soft font-bold">{hoveredCell.resistanceLevel}</span></div>
//             <div><span className="text-medical-white/60">Mutations:</span> <span className="text-purple-300 font-bold">{hoveredCell.mutationCount} events</span></div>
//             <div><span className="text-medical-white/60">Growth Rate:</span> {hoveredCell.growthRate} / gen</div>
//             <div><span className="text-medical-white/60">Parent Cell:</span> {hoveredCell.parentId}</div>
//             <div><span className="text-medical-white/60">Gen Born:</span> Born Gen {hoveredCell.generationBorn}</div>
//             <div><span className="text-medical-white/60">Status:</span> <span className={hoveredCell.alive ? "text-emerald-400 font-bold" : "text-gray-400"}>{hoveredCell.alive ? "🟢 Active Fighter" : "🔴 Lysed / Dead"}</span></div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function safePct(val) {
//   const p = Math.round((val ?? 0) * 100);
//   return `${p}%`;
// }

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const CLASS_COLORS = {
  0: new THREE.Color("#34D399"), // Emerald Green -> Susceptible
  1: new THREE.Color("#FFD54A"), // Bright Yellow -> Intermediate
  2: new THREE.Color("#FF8C32"), // Bright Orange -> Resistant
  3: new THREE.Color("#FF3B3B"), // Bright Red -> Highly Resistant Superbug
  4: new THREE.Color("#334155"), // Dark Gray -> Dead Cell (Lysis)
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

const MAX_INSTANCES = 3500;

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
    for (let i = 0; i < 90; i++) {
      const offsetX = (i % 10) - 4.5;
      const offsetY = Math.floor(i / 10) - 4.5;
      const cls = i % 4;
      preview.push({
        id: i + 1,
        x: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetX * 1.8))),
        y: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetY * 1.8))),
        r: cls === 0 ? 0.05 : cls === 1 ? 0.35 : cls === 2 ? 0.68 : 0.92,
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

  useEffect(() => {
    generationRef.current = generation;
    const mutants = (cells || []).filter((c) => (c.mutation_count || 0) > 0);
    if (mutants.length > 0 && generation > 0) {
      setMutationNotice(`🧬 Genomic Mutation Event: ${mutants.length} resistant variants active in Gen ${generation}`);
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
    scene.background = new THREE.Color(0x01050e);
    scene.fog = new THREE.FogExp2(0x030814, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 12.0, 14.0);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.1,  // Enhanced fluorescence bloom for microscope realism
      0.75, 
      0.15 
    );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.minDistance = 6;
    controls.maxDistance = 24;
    controls.target.set(0, 0.3, 0);

    // PETRI DISH GLASS RIM & BASE
    const dishRim = new THREE.Mesh(
      new THREE.RingGeometry(5.3, 5.6, 64),
      new THREE.MeshPhysicalMaterial({ color: 0x00ffff, transmission: 0.9, transparent: true, opacity: 0.6, roughness: 0.1, side: THREE.DoubleSide })
    );
    dishRim.rotation.x = -Math.PI / 2;
    dishRim.position.y = -0.22;
    scene.add(dishRim);

    const culturePlate = new THREE.Mesh(
      new THREE.PlaneGeometry(11.0, 11.0),
      new THREE.MeshStandardMaterial({ color: 0x050e1f, metalness: 0.2, roughness: 0.65 })
    );
    culturePlate.rotation.x = -Math.PI / 2;
    culturePlate.position.y = -0.26;
    scene.add(culturePlate);

    // ANTIBIOTIC HEATMAP TEXTURE PLANE
    const heatCanvas = document.createElement("canvas");
    heatCanvas.width = 64;
    heatCanvas.height = 64;
    const heatTexture = new THREE.CanvasTexture(heatCanvas);
    const heatPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(11.0, 11.0),
      new THREE.MeshBasicMaterial({ map: heatTexture, transparent: true, opacity: 0.9, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
    );
    heatPlane.rotation.x = -Math.PI / 2;
    heatPlane.position.y = -0.245;
    scene.add(heatPlane);

    // GRID LABELS & LIGHTS
    const grid = new THREE.GridHelper(11.0, Math.max(20, gridSize), 0x00e5ff, 0x1e3a8a);
    grid.position.y = -0.25;
    grid.material.opacity = 0.6;
    grid.material.transparent = true;
    scene.add(grid);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x07111f, 1.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(8, 14, 8);
    scene.add(keyLight);

    // MICRO-ORGANISM GEOMETRY (Capsule / Rod shape for realistic bacteria look)
    const bacteriaGeo = new THREE.CapsuleGeometry(0.08, 0.22, 8, 16);
    const bacteriaMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.15,
      transparent: true,
      opacity: 0.96,
    });

    const instancedMesh = new THREE.InstancedMesh(bacteriaGeo, bacteriaMat, MAX_INSTANCES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_INSTANCES * 3), 3);
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
                resistanceLevel: typeof cell.r === "number" ? safePct(cell.r) : "0%",
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

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      const elapsed = performance.now() - startTimeRef.current;
      const liveCells = cellStateRef.current;
      const generationValue = generationRef.current || 0;

      const revealProgress = Math.min(1, elapsed / 1500);
      const visibleCount = Math.min(
        liveCells.length,
        Math.max(30, Math.floor(liveCells.length * (generationValue === 0 ? revealProgress : 1.0)))
      );

      controls.autoRotate = generationValue > 0;
      controls.update();

      for (let i = 0; i < visibleCount; i++) {
        const cell = liveCells[i];
        const isCellAlive = cell.alive !== false && cell.cls !== 4;

        const xNorm = (cell.x / Math.max(1, gridSize - 1)) * 2 - 1;
        const yNorm = (cell.y / Math.max(1, gridSize - 1)) * 2 - 1;
        const px = xNorm * 5.2;
        const pz = yNorm * 5.2;

        // Organic microscopic wiggle / Brownian motion
        const jitterX = Math.sin(time * 3.5 + i) * 0.03;
        const jitterZ = Math.cos(time * 4.0 + i) * 0.03;
        const pulse = isCellAlive ? (1.0 + Math.sin(time * 5.0 + i * 0.5) * 0.12) : 0.7;

        dummy.position.set(px + jitterX, isCellAlive ? 0.04 : -0.05, pz + jitterZ);
        dummy.scale.set(pulse, pulse, pulse);
        
        // Tilt rods organically based on ID
        dummy.rotation.set(Math.sin(i) * 0.3, time * 0.5 + i, Math.cos(i) * 0.3);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        // Map Class Colors (Susceptible Green -> Resistant Red/Orange)
        if (isCellAlive) {
          tempColor.copy(CLASS_COLORS[cell.cls] ?? CLASS_COLORS[0]);
        } else {
          tempColor.copy(CLASS_COLORS[4]); // Dead Lysed Cell
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

    sceneRef.current = { scene, camera, renderer, controls, instancedMesh, dummy, heatCanvas, heatTexture };

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mount.innerHTML = "";
    };
  }, [gridSize]);

  useEffect(() => {
    const { heatCanvas, heatTexture } = sceneRef.current;
    if (!heatCanvas || !heatTexture) return;

    if (antibioticField.length) {
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

          if (warmth < 0.1) {
            imgData.data[idx] = 0;
            imgData.data[idx + 1] = 0;
            imgData.data[idx + 2] = 0;
            imgData.data[idx + 3] = 0;
          } else {
            // Glowing vibrant electric blue/purple waves for antibiotic concentration
            imgData.data[idx] = Math.round(50 + warmth * 150);
            imgData.data[idx + 1] = Math.round(200 + warmth * 55);
            imgData.data[idx + 2] = 255;
            imgData.data[idx + 3] = Math.round(warmth * 220);
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

      {mutationNotice && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 rounded-xl border border-gold-400/60 bg-gold-500/20 px-4 py-2 text-xs font-data text-gold-300 backdrop-blur-md shadow-glass animate-bounce">
          {mutationNotice}
        </div>
      )}

      <div className="pointer-events-none absolute top-16 right-3 rounded-xl border border-cyan-400/30 bg-navy-deep/85 px-3.5 py-2.5 text-[10px] font-data text-medical-white/90 backdrop-blur-md shadow-glass">
        <div className="mb-1.5 text-[9px] tracking-[0.24em] text-cyan-soft uppercase font-bold">Colony Phenotype</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#34D399] shadow-[0_0_8px_#34D399]" />Susceptible (Viable)</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FFD54A] shadow-[0_0_8px_#FFD54A]" />Intermediate</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FF8C32] shadow-[0_0_8px_#FF8C32]" />Resistant Variant</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#FF3B3B] shadow-[0_0_8px_#FF3B3B]" />Highly Resistant Superbug</div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#334155] opacity-60" />Dead (Lysis)</div>
        </div>
      </div>

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