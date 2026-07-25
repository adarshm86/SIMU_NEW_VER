import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const CLASS_COLORS = {
  0: new THREE.Color("#3FA9FF"),
  1: new THREE.Color("#FFD54A"),
  2: new THREE.Color("#FF8C32"),
  3: new THREE.Color("#FF3B3B"),
  4: new THREE.Color("#E5ECF7"),
};

const MAX_INSTANCES = 3000;

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

  const previewCells = useMemo(() => {
    if (cells?.length) return cells;

    const preview = [];
    const base = Math.max(18, Math.min(48, Math.round(gridSize / 2)));
    for (let i = 0; i < 72; i++) {
      const offsetX = (i % 8) - 3.5;
      const offsetY = Math.floor(i / 8) - 4;
      const cls = i % 4;
      preview.push({
        id: i + 1,
        x: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetX * 1.8))),
        y: Math.max(0, Math.min(gridSize - 1, Math.round(base + offsetY * 1.8))),
        r: cls === 0 ? 0.18 : cls === 1 ? 0.45 : cls === 2 ? 0.72 : 0.9,
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

  useEffect(() => {
    generationRef.current = generation;
  }, [generation]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030812);
    scene.fog = new THREE.Fog(0x05111f, 11, 26);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 10.8, 12.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    mount.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.1,
      0.75,
      0.12
    );
    bloomPass.threshold = 0.04;
    bloomPass.strength = 1.45;
    bloomPass.radius = 0.9;
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55;
    controls.minDistance = 8;
    controls.maxDistance = 18;
    controls.target.set(0, 0.6, 0);

    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(12, 0.45, 12),
      new THREE.MeshPhysicalMaterial({
        color: 0x09111f,
        metalness: 0.12,
        roughness: 0.14,
        transmission: 0.92,
        transparent: true,
        opacity: 0.18,
        clearcoat: 1,
        envMapIntensity: 1.6,
      })
    );
    basePlate.position.y = -0.72;
    basePlate.receiveShadow = true;
    scene.add(basePlate);

    const slabGlow = new THREE.Mesh(
      new THREE.CircleGeometry(5.6, 64),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      })
    );
    slabGlow.rotation.x = -Math.PI / 2;
    slabGlow.position.y = -0.68;
    scene.add(slabGlow);

    const glassTop = new THREE.Mesh(
      new THREE.BoxGeometry(10.9, 0.12, 10.9),
      new THREE.MeshPhysicalMaterial({
        color: 0xbfe7ff,
        metalness: 0.05,
        roughness: 0.03,
        transmission: 1,
        transparent: true,
        opacity: 0.18,
        clearcoat: 1,
      })
    );
    glassTop.position.y = -0.46;
    glassTop.receiveShadow = true;
    scene.add(glassTop);

    const grid = new THREE.GridHelper(10.6, Math.max(20, gridSize), 0x69e3ff, 0x2b4c72);
    grid.position.y = -0.39;
    grid.material.opacity = 0.9;
    grid.material.transparent = true;
    scene.add(grid);

    const frame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(10.8, 0.16, 10.8)),
      new THREE.LineBasicMaterial({ color: 0x8fe8ff, transparent: true, opacity: 0.65 })
    );
    frame.position.y = -0.38;
    scene.add(frame);

    const pulseRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.7, 0.04, 12, 120),
      new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        transparent: true,
        opacity: 0.45,
      })
    );
    pulseRing.rotation.x = Math.PI / 2;
    pulseRing.position.y = -0.48;
    scene.add(pulseRing);

    const pulseRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.35, 0.03, 12, 120),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.36,
      })
    );
    pulseRing2.rotation.x = Math.PI / 2;
    pulseRing2.position.y = -0.47;
    scene.add(pulseRing2);

    const culturePlate = new THREE.Mesh(
      new THREE.PlaneGeometry(10.8, 10.8),
      new THREE.MeshStandardMaterial({
        color: 0x11213a,
        metalness: 0.03,
        roughness: 0.82,
        transparent: true,
        opacity: 0.9,
      })
    );
    culturePlate.rotation.x = -Math.PI / 2;
    culturePlate.position.y = -0.49;
    culturePlate.receiveShadow = true;
    scene.add(culturePlate);

    const heatCanvas = document.createElement("canvas");
    heatCanvas.width = 64;
    heatCanvas.height = 64;
    const heatTexture = new THREE.CanvasTexture(heatCanvas);
    const heatGeo = new THREE.PlaneGeometry(10.8, 10.8);
    const heatMat = new THREE.MeshBasicMaterial({
      map: heatTexture,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const heatPlane = new THREE.Mesh(heatGeo, heatMat);
    heatPlane.rotation.x = -Math.PI / 2;
    heatPlane.position.y = -0.48;
    scene.add(heatPlane);

    const particleCount = 140;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 11.5;
      particlePositions[i3 + 1] = -0.2 + Math.random() * 0.4;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 11.5;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x69e3ff,
      size: 0.045,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    const hemiLight = new THREE.HemisphereLight(0x7bd4ff, 0x07111f, 1.45);
    scene.add(hemiLight);

    scene.add(new THREE.AmbientLight(0x64c9ff, 1.15));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(8, 11, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const cyanRim = new THREE.PointLight(0x00e5ff, 1.4, 35);
    cyanRim.position.set(-6, 7, -4);
    scene.add(cyanRim);

    const purpleSide = new THREE.PointLight(0x9c27ff, 1.2, 35);
    purpleSide.position.set(5, 5, 6);
    scene.add(purpleSide);

    const orangeAccent = new THREE.PointLight(0xff8c32, 0.9, 30);
    orangeAccent.position.set(4, 6, -3);
    scene.add(orangeAccent);

    const undersideLight = new THREE.PointLight(0x4fd6ff, 1.8, 24);
    undersideLight.position.set(0, 2.3, 0);
    scene.add(undersideLight);

    const bacteriaGeo = new THREE.SphereGeometry(0.24, 24, 24);
    const bacteriaMat = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: 0.98,
      vertexColors: true,
      shininess: 100,
      specular: 0xffffff,
      emissive: new THREE.Color("#0c1325"),
      emissiveIntensity: 1.9,
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
                resistanceLevel: cell.r,
                mutationCount: cell.mutation_count,
                growthRate: cell.growth_rate,
                alive: cell.alive,
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
      const revealProgress = Math.min(1, elapsed / 2000);
      const visibleCount = Math.min(
        liveCells.length,
        Math.max(64, Math.floor(liveCells.length * (0.45 + revealProgress * 0.55)))
      );
      const gridRadius = 5.25;
      const antibioticTint = new THREE.Color("#9C27FF");
      const diffusionTint = new THREE.Color("#FF4DFF");

      controls.autoRotate = generationValue > 0;
      if (grid.material && grid.material.opacity !== undefined) {
        grid.material.opacity = 0.84 + Math.sin(time * 2.8) * 0.1;
      }
      slabGlow.material.opacity = 0.12 + Math.sin(time * 1.8) * 0.06;
      pulseRing.scale.setScalar(1 + Math.sin(time * 1.5) * 0.04);
      pulseRing2.scale.setScalar(1 + Math.cos(time * 1.9) * 0.05);
      pulseRing.rotation.z = time * 0.2;
      pulseRing2.rotation.z = -time * 0.18;
      particleField.rotation.y = time * 0.1;
      particleField.material.opacity = 0.36 + Math.sin(time * 2.1) * 0.08;
      controls.update();

      for (let i = 0; i < visibleCount; i++) {
        const cell = liveCells[i];
        const xNorm = (cell.x / Math.max(1, gridSize)) * 2 - 1;
        const yNorm = (cell.y / Math.max(1, gridSize)) * 2 - 1;
        const clusterBiasX = Math.sin((cell.y + 1) * 0.34) * 0.55;
        const clusterBiasZ = Math.cos((cell.x + 1) * 0.32) * 0.55;
        const drift = Math.sin(time * 2 + i * 0.16 + generationValue * 0.4) * 0.06;
        const px = (xNorm * gridRadius + clusterBiasX + drift) * 0.88;
        const pz = (yNorm * gridRadius + clusterBiasZ + Math.cos(time * 1.6 + i * 0.2 + generationValue * 0.35) * 0.06) * 0.88;
        const pulse = 1.0 + Math.sin(time * (4.0 + cell.r * 2.4) + i * 0.42 + generationValue * 0.18) * 0.2;
        const resistanceLift = cell.cls === 2 ? 0.09 : cell.cls === 1 ? 0.06 : 0;
        const mutationGlow = Math.min(0.52, (cell.mutation_count || 0) * 0.08);
        const scale = speciesScale * (pulse * 1.2) + mutationGlow;
        const lift = 0.18 + resistanceLift + Math.sin(time * 2.8 + i * 0.3) * 0.04;
        const abField = antibioticField[Math.floor(((cell.y / Math.max(1, gridSize)) * (antibioticField.length || 1)))]?.[
          Math.floor(((cell.x / Math.max(1, gridSize)) * (antibioticField.length || 1)))
        ] ?? 0;
        const diffusionBlend = Math.min(0.55, abField * 0.72);

        dummy.position.set(px, lift, pz);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        tempColor.copy(CLASS_COLORS[cell.cls] || CLASS_COLORS[0]);
        tempColor.lerp(antibioticTint, diffusionBlend * 0.32);
        tempColor.lerp(diffusionTint, Math.min(0.25, mutationGlow * 0.9));
        tempColor.offsetHSL(0, 0, mutationGlow * 0.95);
        tempColor.multiplyScalar(1.26 + Math.max(0, cell.r) * 0.6);
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
          imgData.data[idx] = Math.min(255, 18 + warmth * 235);
          imgData.data[idx + 1] = Math.min(255, 85 + warmth * 130);
          imgData.data[idx + 2] = Math.min(255, 190 + warmth * 60);
          imgData.data[idx + 3] = 255;

          if (warmth > 0.7) {
            imgData.data[idx] = Math.min(255, 255);
            imgData.data[idx + 1] = Math.min(255, 70 + warmth * 85);
            imgData.data[idx + 2] = Math.min(255, 110 + warmth * 80);
          }

          if (warmth < 0.25) {
            imgData.data[idx] = 22;
            imgData.data[idx + 1] = 150 + warmth * 90;
            imgData.data[idx + 2] = 210;
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
    <div className="relative w-full h-full min-h-[420px]">
      <div ref={mountRef} className="w-full h-full min-h-[420px]" />
      <div className="pointer-events-none absolute top-3 left-3 rounded-full border border-white/10 bg-navy-deep/60 px-3 py-1 text-[11px] font-data text-medical-white/70">
        Generation {generation}
      </div>
      <div className="pointer-events-none absolute top-3 right-3 rounded-xl border border-cyan-400/30 bg-navy-deep/70 px-3 py-2 text-[10px] font-data text-medical-white/85 backdrop-blur-md shadow-glass">
        <div className="mb-1 text-[9px] tracking-[0.24em] text-cyan-soft uppercase">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3FA9FF]" />Susceptible</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FFD54A]" />Intermediate</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF8C32]" />Resistant</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FF3B3B]" />Highly Resistant</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#E5ECF7]" />Dead</div>
        </div>
      </div>
      {hoveredCell && (
        <div className="pointer-events-none absolute bottom-3 right-3 w-[220px] rounded-xl border border-gold-500/30 bg-navy-deep/80 p-3 text-[11px] font-data text-medical-white/85 backdrop-blur-md shadow-glass">
          <div className="mb-2 text-[10px] tracking-[0.24em] text-cyan-soft uppercase">Cell Info</div>
          <div className="space-y-1">
            <div>Bacteria ID: {hoveredCell.id}</div>
            <div>Generation Born: {hoveredCell.generationBorn}</div>
            <div>Resistance Level: {hoveredCell.resistanceLevel}</div>
            <div>Mutation Count: {hoveredCell.mutationCount}</div>
            <div>Growth Rate: {hoveredCell.growthRate}</div>
            <div>Alive / Dead: {hoveredCell.alive ? "Alive" : "Dead"}</div>
            <div>Parent Cell ID: {hoveredCell.parentId}</div>
          </div>
        </div>
      )}
    </div>
  );
}
