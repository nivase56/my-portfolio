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
    renderer.toneMappingExposure = 1.2; // Slightly brighter exposure
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
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

    // ✅ Enhanced Lighting Setup for Better Face Illumination
    
    // Ambient light - slightly warmer and brighter for better face visibility
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
    sceneRef.current.add(ambientLight);

    // Key Light - Main directional light positioned to illuminate faces
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(3, 4, 6);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.mapSize.set(2048, 2048); // Higher resolution shadows
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    sceneRef.current.add(keyLight);

    // Fill Light - Softer light from the opposite side to reduce harsh shadows
    const fillLight = new THREE.DirectionalLight(0xffe6cc, 0.8);
    fillLight.position.set(-4, 3, 4);
    sceneRef.current.add(fillLight);

    // Rim Light - Back light to create separation and depth
    const rimLight = new THREE.DirectionalLight(0xe6f3ff, 0.7);
    rimLight.position.set(0, 6, -8);
    sceneRef.current.add(rimLight);

    // ✅ Face-specific lighting - Point lights positioned for character faces
    const faceLight1 = new THREE.PointLight(0xffffff, 0.8, 8);
    faceLight1.position.set(-1.5, 1.5, 2); // For left character
    sceneRef.current.add(faceLight1);

    const faceLight2 = new THREE.PointLight(0xffffff, 0.8, 8);
    faceLight2.position.set(0, 1.5, 2); // For middle character
    sceneRef.current.add(faceLight2);

    const faceLight3 = new THREE.PointLight(0xffffff, 0.8, 8);
    faceLight3.position.set(1.5, 1.5, 2); // For right character
    sceneRef.current.add(faceLight3);

    // ✅ Hemisphere light for natural outdoor-like lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.4);
    sceneRef.current.add(hemisphereLight);

    // ✅ Loader
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load("/glb/image.jpg", (texture) => {
      const imageAspect = texture.image.width / texture.image.height;
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(geometry, material);

      const scaleFactor = 12;
      plane.scale.set(scaleFactor * imageAspect, scaleFactor, 1);
      plane.position.set(-1, 3, -15);

      sceneRef.current.add(plane);
    });

    // Background
    loader.load("/glb/background.glb", (gltf) => {
      const bg = gltf.scene;
      bg.scale.set(1.7, 1.7, 1.7);
      bg.position.set(-1, -2, -3);
      sceneRef.current.add(bg);
    });

    // Character Models with enhanced material processing
    ["/glb/sleeping.glb", "/glb/typing.glb", "/glb/banging.glb"].forEach(
      (path, index) => {
        loader.load(path, (gltf) => {
          const model = gltf.scene;
          model.scale.set(1.5, 1.5, 1.5);
          model.position.set(index * 2 - 1.5, -0.5, 0);
          
          // Enhanced material processing for better face lighting
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Enhance materials for better light interaction
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(mat => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                      mat.roughness = Math.max(10, mat.roughness || 0.5);
                      mat.metalness = Math.min(0.1, mat.metalness || 0);
                      mat.envMapIntensity = 1.8;
                    }
                  });
                } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
                  mesh.material.roughness = Math.max(10, mesh.material.roughness || 0.5);
                  mesh.material.metalness = Math.min(0.1, mesh.material.metalness || 0);
                  mesh.material.envMapIntensity = 1.8;
                }
              }
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
      style={{
        width: "100%",
        height: "100vh",
        background: "white",
        position: "relative",
      }}
    >
      {/* ✅ Overlay Text */}
      {/* <div className="title">Im Nivase</div> */}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');

        .title {
          position: absolute;
          top: 12%;
          left: 35%;
          font-family: 'Orbitron', sans-serif;
          font-size: 5rem;
          font-weight: 900;
          letter-spacing: 8px;
          text-transform: uppercase;
          color: #ffffff;
        }
      `}</style>
    </div>
  );
};

export default GLBModelViewer;