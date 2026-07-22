import { useEffect, useRef } from "react";
import * as THREE from "three";

// Cell classification colors: 0=susceptible, 1=intermediate, 2=resistant
const CLASS_COLORS = {
  0: new THREE.Color("#6FD8E8"), // soft cyan - susceptible
  1: new THREE.Color("#D4AF37"), // gold - intermediate
  2: new THREE.Color("#E14F4F"), // alert red - resistant
};

export default function PetriDish3D({ cells = [], antibioticField = [], gridSize = 40 }) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});

  // --- one-time scene setup ---
  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 13, 13);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Petri dish base (circular, NOT rectangular)
    const dishGeo = new THREE.CylinderGeometry(6, 6.3, 0.4, 64);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0x0f1626,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.y = -0.3;
    scene.add(dish);

    // Glass rim
    const rimGeo = new THREE.TorusGeometry(6.15, 0.08, 16, 100);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x3a2a08,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.08;
    scene.add(rim);

    // Antibiotic heatmap plane (texture updated per-frame from field data)
    const heatCanvas = document.createElement("canvas");
    heatCanvas.width = 64;
    heatCanvas.height = 64;
    const heatTexture = new THREE.CanvasTexture(heatCanvas);
    const heatGeo = new THREE.CircleGeometry(5.9, 64);
    const heatMat = new THREE.MeshBasicMaterial({
      map: heatTexture,
      transparent: true,
      opacity: 0.55,
    });
    const heatPlane = new THREE.Mesh(heatGeo, heatMat);
    heatPlane.rotation.x = -Math.PI / 2;
    heatPlane.position.y = -0.05;
    scene.add(heatPlane);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const point = new THREE.PointLight(0xd4af37, 1.1, 40);
    point.position.set(6, 10, 4);
    scene.add(point);
    const rim2 = new THREE.PointLight(0x6fd8e8, 0.6, 40);
    rim2.position.set(-6, 6, -4);
    scene.add(rim2);

    // Instanced mesh for bacteria (up to a generous cap)
    const MAX_INSTANCES = 3000;
    const bacteriaGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const bacteriaMat = new THREE.MeshStandardMaterial({
      vertexColors: false,
      roughness: 0.4,
      metalness: 0.1,
      emissive: 0x111111,
    });
    const instancedMesh = new THREE.InstancedMesh(bacteriaGeo, bacteriaMat, MAX_INSTANCES);
    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(MAX_INSTANCES * 3),
      3
    );
    scene.add(instancedMesh);

    let animationId;
    let autoRotate = true;
    const dummy = new THREE.Object3D();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (autoRotate) {
        scene.rotation.y += 0.0018;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse rotation + zoom
    let isDragging = false;
    let prevX = 0;
    const onDown = (e) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX;
    };
    const onUp = () => (isDragging = false);
    const onMove = (e) => {
      if (!isDragging) return;
      const delta = e.clientX - prevX;
      scene.rotation.y += delta * 0.005;
      prevX = e.clientX;
    };
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + e.deltaY * 0.01, 6, 22);
      camera.position.y = camera.position.z;
      camera.lookAt(0, 0, 0);
    };

    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      instancedMesh,
      dummy,
      heatCanvas,
      heatTexture,
      mount,
    };

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      renderer.domElement.removeEventListener("mousedown", onDown);
      renderer.domElement.removeEventListener("wheel", onWheel);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // --- update instances whenever cells/field change ---
  useEffect(() => {
    const { instancedMesh, dummy, heatCanvas, heatTexture } = sceneRef.current;
    if (!instancedMesh) return;

    const radius = 5.7;
    const count = Math.min(cells.length, instancedMesh.count);

    for (let i = 0; i < count; i++) {
      const cell = cells[i];
      const nx = (cell.x / gridSize) * 2 - 1;
      const ny = (cell.y / gridSize) * 2 - 1;
      const px = nx * radius;
      const pz = ny * radius;
      const dist = Math.sqrt(nx * nx + ny * ny);
      if (dist > 1) continue;

      dummy.position.set(px, 0.02 + (cell.cls === 2 ? 0.05 : 0), pz);
      const scale = cell.cls === 2 ? 1.4 : cell.cls === 1 ? 1.1 : 0.9;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      instancedMesh.setColorAt(i, CLASS_COLORS[cell.cls] || CLASS_COLORS[0]);
    }
    // hide unused instances far away
    for (let i = count; i < instancedMesh.count; i++) {
      dummy.position.set(0, -999, 0);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

    // paint the antibiotic heatmap texture
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
          // navy -> gold -> red heat ramp
          imgData.data[idx] = Math.min(255, 40 + v * 215);
          imgData.data[idx + 1] = Math.min(255, 60 + v * 120 * (1 - v));
          imgData.data[idx + 2] = Math.max(20, 120 - v * 100);
          imgData.data[idx + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      heatTexture.needsUpdate = true;
    }
  }, [cells, antibioticField, gridSize]);

  return <div ref={mountRef} className="w-full h-full min-h-[420px]" />;
}
