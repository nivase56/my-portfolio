"use client";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three-stdlib";
import "three-stdlib";

declare module "three-stdlib" {
  interface OrbitControls {
    rotateLeft: (angle: number) => void;
    rotateUp: (angle: number) => void;
  }
}

const GLBModelViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const sceneRef = useRef(new THREE.Scene());
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const clockRef = useRef(new THREE.Clock());
  const controlsRef = useRef<OrbitControls>(null);
  const frameIdRef = useRef<number>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // ✅ Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // ✅ Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 1, 5);
    cameraRef.current = camera;

    // ✅ Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;

    const currentPolar = controls.getPolarAngle();
    controls.minPolarAngle = currentPolar;
    controls.maxPolarAngle = currentPolar;
    controlsRef.current = controls;

    // ✅ Scroll (only left-right rotation)
    const handleScroll = (e: WheelEvent) => {
      if (!controlsRef.current) return;
      const factor = 0.002;
      controlsRef.current.rotateLeft(e.deltaY * factor);
      controlsRef.current.update();
    };
    window.addEventListener("wheel", handleScroll, { passive: true });

    // ✅ Lighting (3-point setup)
    sceneRef.current.add(new THREE.AmbientLight(0xffffff, 0.4));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.mapSize.set(1024, 1024);
    sceneRef.current.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-5, 5, 2);
    sceneRef.current.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 8, -5);
    sceneRef.current.add(rimLight);

    // ✅ Loader (reused)
    const loader = new GLTFLoader();

    // Background
    loader.load("/glb/background.glb", (gltf) => {
      const bg = gltf.scene;
      bg.scale.set(1.7, 1.7, 1.7);
      bg.position.set(-1, -2, -3);
      sceneRef.current.add(bg);
    });

    // Character Models
    ["/glb/sleeping.glb", "/glb/typing.glb", "/glb/banging.glb"].forEach(
      (path, index) => {
        loader.load(path, (gltf) => {
          const model = gltf.scene;
          model.scale.set(1.5, 1.5, 1.5);
          model.position.set(index * 2 - 1.5, -0.5, 0);
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          sceneRef.current.add(model);

          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
            mixersRef.current.push(mixer);
          }
        });
      }
    );

    // ✅ Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      mixersRef.current.forEach((m) => m.update(delta));
      controlsRef.current?.update();
      renderer.render(sceneRef.current, camera);
    };
    animate();

    // ✅ Resize
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // ✅ Cleanup
    return () => {
      cancelAnimationFrame(frameIdRef.current!);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", handleScroll);
      controlsRef.current?.dispose();
      if (rendererRef.current) {
        mountRef.current?.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100vh", background: "black" }}
    />
  );
};

export default GLBModelViewer;
