"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three-stdlib";
import "three-stdlib";
import DeveloperIntro from "./popup/typingIntro";
import HoneycombGrid from "./popup/sleepingIntro";
import Loader from "./loader/macbookloader";
import ScreenshotGallery from "./popup/bangingIntro";
import LottieModal from "./tour/lottie.modal";

type GLBModelViewerProps = {
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
};
declare module "three-stdlib" {
  interface OrbitControls {
    rotateLeft: (angle: number) => void;
    rotateUp: (angle: number) => void;
  }
}

// A visually appealing loading screen component
const LoadingScreen: React.FC<{ progress: number }> = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      zIndex: 100,
    }}
  >
    <Loader />
  </div>
);

const GLBModelViewer: React.FC<GLBModelViewerProps> = ({
  isLoaded,
  setIsLoaded,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef(new THREE.Scene());
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const clockRef = useRef(new THREE.Clock());
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const modelsRef = useRef<THREE.Group[]>([]);
  const markersRef = useRef<THREE.Group[]>([]);
  const preloadedMarkerRef = useRef<THREE.Group | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // New state for loading management
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (selected !== null) {
      setIsPopupVisible(true);
    }
  }, [selected]);

  const handleClose = () => {
    setIsPopupVisible(false);
    // Small delay to let animation finish before clearing selection
    setTimeout(() => {
      setSelected(null);
    }, 300);
  };

  const getCharacterBounds = (model: THREE.Group) => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    return {
      center: center,
      top: box.max.y,
      size: box.getSize(new THREE.Vector3()),
    };
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Loading Manager Setup ---
    const loadingManager = new THREE.LoadingManager();

    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = Math.round((itemsLoaded / itemsTotal) * 100);
      setLoadingProgress(progress);
    };

    loadingManager.onLoad = () => {
      // Create markers for each character now that all models are loaded
      modelsRef.current.forEach((_, index) => {
        if (preloadedMarkerRef.current) {
          const marker = preloadedMarkerRef.current.clone(true);
          const scale = isMobile ? 3 : 1.5;
          marker.scale.setScalar(scale);
          marker.rotation.y = Math.PI;

          // --- Saturation boost for marker materials ---
          marker.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const mats = Array.isArray(mesh.material)
                  ? mesh.material
                  : [mesh.material];
                mats.forEach((mat) => {
                  if (
                    mat instanceof THREE.MeshStandardMaterial ||
                    mat instanceof THREE.MeshBasicMaterial
                  ) {
                    const hsl = { h: 0, s: 0, l: 0 };
                    mat.color.getHSL(hsl);

                    // Only boost saturation
                    hsl.s = Math.min(1, hsl.s * 0.6);

                    mat.color.setHSL(hsl.h, hsl.s, hsl.l);
                    mat.needsUpdate = true;
                  }
                });
              }
            }
          });

          markersRef.current[index] = marker;
          sceneRef.current.add(marker);
        }
      });

      // Keep loader for extra delay
      setTimeout(() => {
        setIsLoaded(true); // hide loader
        setShowWelcome(true); // show welcome
        setTimeout(() => setShowWelcome(false), 3500); // hide welcome after 4s
      }, 2500);
    };

    // --- Scene, Camera, Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Camera
    const isMobile = window?.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 400;
    const camera = new THREE.PerspectiveCamera(
      isSmallMobile ? 110 : isMobile ? 95 : 75,
      window.innerWidth / window.innerHeight,
      0.5,
      2000
    );
    camera.position.set(
      0,
      isSmallMobile ? 1.6 : isMobile ? 1.4 : 1.2,
      isSmallMobile ? 7 : isMobile ? 6 : 5
    );
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;
    const currentPolar = controls.getPolarAngle();
    controls.minPolarAngle = currentPolar;
    controls.maxPolarAngle = currentPolar;
    controlsRef.current = controls;

    // Scroll handling
    const handleScroll = (e: WheelEvent) => {
      if (!controlsRef.current) return;
      const factor = 0.002;
      controlsRef.current.rotateLeft(e.deltaY * factor);
      controlsRef.current.update();
    };
    window.addEventListener("wheel", handleScroll, { passive: true });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
    sceneRef.current.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(3, 4, 6);
    keyLight.castShadow = true;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.mapSize.set(2048, 2048);
    sceneRef.current.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffe6cc, 0.8);
    fillLight.position.set(-4, 3, 4);
    sceneRef.current.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xe6f3ff, 0.7);
    rimLight.position.set(0, 6, -8);
    sceneRef.current.add(rimLight);
    const faceLight1 = new THREE.PointLight(0xffffff, 0.8, 8);
    faceLight1.position.set(-1.5, 1.5, 2);
    sceneRef.current.add(faceLight1);
    const faceLight2 = new THREE.PointLight(0xffffff, 0.8, 8);
    faceLight2.position.set(0, 1.5, 2);
    sceneRef.current.add(faceLight2);
    const faceLight3 = new THREE.PointLight(0xffffff, 0.8, 8);
    faceLight3.position.set(1.5, 1.5, 2);
    sceneRef.current.add(faceLight3);
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.4);
    sceneRef.current.add(hemisphereLight);

    // Loaders
    const gltfLoader = new GLTFLoader(loadingManager);
    const textureLoader = new THREE.TextureLoader(loadingManager);

    // Background image
    textureLoader.load("/glb/image.jpg", (texture) => {
      const imageAspect = texture.image.width / texture.image.height;
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const plane = new THREE.Mesh(geometry, material);
      const scaleFactor = 12;
      plane.scale.set(scaleFactor * imageAspect, scaleFactor, 1);
      plane.position.set(-1, 3, -13);
      sceneRef.current.add(plane);
    });

    // Background model
    gltfLoader.load("/glb/background.glb", (gltf) => {
      const bg = gltf.scene;
      bg.scale.set(1.7, 1.7, 1.7);
      bg.position.set(-1, -2, -3);
      sceneRef.current.background = new THREE.Color("#e0cb9d");
      sceneRef.current.add(bg);
    });

    // Marker preload
    gltfLoader.load("/glb/marker.glb", (gltf) => {
      preloadedMarkerRef.current = gltf.scene;
    });

    // Character models
    ["/glb/sleeping.glb", "/glb/typing.glb", "/glb/banging.glb"].forEach(
      (path, index) => {
        gltfLoader.load(path, (gltf) => {
          const model = gltf.scene as THREE.Group;
          model.scale.set(1.5, 1.5, 1.5);
          model.position.set(index * 2 - 1.5, -0.5, 0);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.roughness = Math.max(
                  0.1,
                  mesh.material.roughness || 0.5
                );
                mesh.material.metalness = Math.min(
                  0.1,
                  mesh.material.metalness || 0
                );
                mesh.material.envMapIntensity = 1.8;
              }
            }
          });

          sceneRef.current.add(model);
          modelsRef.current[index] = model;

          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
            mixersRef.current.push(mixer);
          }
        });
      }
    );

    // Click handler
    const handleClick = (event: MouseEvent) => {
      if (
        !cameraRef.current ||
        !rendererRef.current ||
        !modelsRef.current.length
      )
        return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      let hitIndex = -1;
      modelsRef.current.forEach((model, index) => {
        const intersects = raycaster.intersectObject(model, true);
        if (intersects.length > 0) hitIndex = index;
      });
      if (hitIndex === -1) {
        markersRef.current.forEach((marker, index) => {
          if (marker) {
            const intersects = raycaster.intersectObject(marker, true);
            if (intersects.length > 0) hitIndex = index;
          }
        });
      }
      if (hitIndex !== -1) setSelected(hitIndex);
    };
    renderer.domElement.addEventListener("click", handleClick);

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      const elapsedTime = clockRef.current.getElapsedTime();
      mixersRef.current.forEach((m) => m.update(delta));

      markersRef.current.forEach((marker, index) => {
        if (marker && modelsRef.current[index]) {
          const characterModel = modelsRef.current[index];
          const bounds = getCharacterBounds(characterModel);
          const bounce = Math.sin(elapsedTime * 3 + index * 0.8) * 0.15;
          marker.position.x = bounds.center.x;
          marker.position.y = bounds.top + 0.5 + bounce;
          marker.position.z = bounds.center.z;
          marker.rotation.z = Math.sin(elapsedTime * 2 + index) * 0.1;
          marker.lookAt(
            cameraRef.current?.position || new THREE.Vector3(0, 0, 5)
          );
        }
      });

      controlsRef.current?.update();
      renderer.render(sceneRef.current, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;

      const isSmallMobile = width <= 400;
      const isMobile = width <= 768;

      if (isSmallMobile) {
        cameraRef.current.fov = 110;
        cameraRef.current.position.set(0, 1.6, 7);
      } else if (isMobile) {
        cameraRef.current.fov = 95;
        cameraRef.current.position.set(0, 1.4, 6);
      } else {
        cameraRef.current.fov = 75;
        cameraRef.current.position.set(0, 1.2, 5);
      }

      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", handleScroll);
      renderer.domElement.removeEventListener("click", handleClick);
      controlsRef.current?.dispose();
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      if (
        rendererRef.current &&
        mountRef.current?.contains(rendererRef.current.domElement)
      ) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Mouse hover effect for cursor pointer (unchanged)
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      let hovering = false;
      modelsRef.current.forEach((model) => {
        if (model) {
          const intersects = raycaster.intersectObject(model, true);
          if (intersects.length > 0) hovering = true;
        }
      });
      if (!hovering) {
        markersRef.current.forEach((marker) => {
          if (marker) {
            const intersects = raycaster.intersectObject(marker, true);
            if (intersects.length > 0) hovering = true;
          }
        });
      }
      if (rendererRef.current) {
        rendererRef.current.domElement.style.cursor = hovering
          ? "pointer"
          : "default";
      }
    };
    if (isLoaded && rendererRef.current) {
      rendererRef.current.domElement.addEventListener(
        "mousemove",
        handleMouseMove
      );
    }
    return () => {
      rendererRef.current?.domElement.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, [isLoaded]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // check once on mount
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [showWelcome, setShowWelcome] = useState(false);

  // when models finish loading

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      {!isLoaded && <LoadingScreen progress={loadingProgress} />}

      {isLoaded && showWelcome && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "2rem",
            fontWeight: "bold",
            zIndex: 200, // above everything
            transition: "opacity 1s ease-in-out",
          }}
        >
          <LottieModal />
        </div>
      )}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "100%",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 1s ease-in",
          background: "white",
        }}
      />

      {/* Popup overlay - always present but conditionally visible */}
      <div
        style={{
          visibility: isPopupVisible ? "visible" : "hidden",

          position: "absolute",

          top: "0",
          left: "0",
          width: "100%",
          height: "100dvh", // use dynamic viewport height
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          boxSizing: "border-box",
        }}
        onClick={handleClose}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.25)", // darker but instant
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "32px",
            padding: "40px",
            maxWidth: isMobile ? "90%" : "100%",
            maxHeight: "90dvh",
            overflowY: "auto",
            overflowX: "hidden",
            boxShadow: isPopupVisible
              ? `0 8px 32px rgba(0, 0, 0, 0.1)`
              : "0 0 0 rgba(0, 0, 0, 0)",
            transform: isPopupVisible
              ? "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)"
              : "perspective(1000px) rotateX(-90deg) rotateY(15deg) scale(0.3) translateZ(-500px)",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            position: "relative",
            willChange: "backdrop-filter, transform",
            filter: "brightness(1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X Button with 3D hover effect */}
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(0,0,0,0.6)",
              border: "none",
              borderRadius: "50%",
              width: isMobile ? "36px" : "36px", // smaller on mobile
              height: isMobile ? "36px" : "36px",
              color: "#fff",
              fontSize: isMobile ? "18px" : "22px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              backdropFilter: "blur(6px)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth >= 768) {
                // hover only for desktop
                e.currentTarget.style.background =
                  "linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.2))";
                e.currentTarget.style.transform = "scale(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (window.innerWidth >= 768) {
                e.currentTarget.style.background = "rgba(0,0,0,0.6)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            ✕
          </button>

          {/* Content containers with staggered 3D entrance animations */}
          <div
            style={{
              display: selected === 0 ? "block" : "none",
              transform:
                isPopupVisible && selected === 0
                  ? "perspective(800px) rotateX(0deg) translateY(0px) scale(1)"
                  : "perspective(800px) rotateX(30deg) translateY(50px) scale(0.9)",
              opacity: isPopupVisible && selected === 0 ? 1 : 0,
              transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s",
            }}
          >
            <HoneycombGrid />
          </div>
          <div
            style={{
              display: selected === 1 ? "block" : "none",
              transform:
                isPopupVisible && selected === 1
                  ? "perspective(800px) rotateY(0deg) translateX(0px) scale(1)"
                  : "perspective(800px) rotateY(-20deg) translateX(-30px) scale(0.95)",
              opacity: isPopupVisible && selected === 1 ? 1 : 0,
              transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s",
            }}
          >
            <DeveloperIntro />
          </div>
          <div
            style={{
              display: selected === 2 ? "block" : "none",
              transform:
                isPopupVisible && selected === 2
                  ? "perspective(800px) rotateZ(0deg) scale(1)"
                  : "perspective(800px) rotateZ(10deg) scale(0.8)",
              opacity: isPopupVisible && selected === 2 ? 1 : 0,
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
              filter:
                isPopupVisible && selected === 2 ? "blur(0px)" : "blur(2px)",
            }}
          >
            <ScreenshotGallery />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GLBModelViewer;
