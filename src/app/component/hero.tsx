"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader, OrbitControls } from "three-stdlib";
import "three-stdlib";
import DeveloperIntro from "./popup/typingIntro";
import HoneycombGrid from "./popup/sleepingIntro";
import Loader from "./loader/macbookloader";
import ScreenshotGallery from "./popup/bangingIntro";

declare module "three-stdlib" {
  interface OrbitControls {
    rotateLeft: (angle: number) => void;
    rotateUp: (angle: number) => void;
  }
}

// A visually appealing loading screen component
const LoadingScreen: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      position: "absolute",
      top: "30%",
      left: "8%",
      width: "100%",
      height: "100%",
      zIndex: 100,
    }}
  >
    <div className="bg-white">
      <Loader />
    </div>
  </div>
);

const GLBModelViewer: React.FC = () => {
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
  const [isLoaded, setIsLoaded] = useState(false);

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
          marker.scale.set(1.2, 1.2, 1.2);
          marker.rotation.y = Math.PI;
          markersRef.current[index] = marker;
          sceneRef.current.add(marker);
        }
      });

      // A short delay to allow the 100% to show before fading
      setTimeout(() => {
        setIsLoaded(true);
      }, 3500);
    };

    // --- Scene, Camera, Renderer Setup (largely unchanged) ---
    // Renderer
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
    const isMobile = window?.innerWidth <= 768; // breakpoint

    const camera = isMobile
      ? new THREE.PerspectiveCamera(
          95,
          window.innerWidth / window.innerHeight,
          0.5,
          2000
        )
      : new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          2000
        );
    camera.position.set(0, isMobile ? 1.4 : 1.2, isMobile ? 6 : 5);
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

    // Lighting setup (unchanged)
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

    // --- Asset Loading using the Manager ---
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
      sceneRef.current.background = new THREE.Color("#e0cb9d"); // white
      sceneRef.current.add(bg);
    });

    // Pre-load the marker model once
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
              child.castShadow = true;
              child.receiveShadow = true;
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                      mat.roughness = Math.max(0.1, mat.roughness || 0.5);
                      mat.metalness = Math.min(0.1, mat.metalness || 0);
                      mat.envMapIntensity = 1.8;
                    }
                  });
                } else if (
                  mesh.material instanceof THREE.MeshStandardMaterial
                ) {
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
            }
          });

          sceneRef.current.add(model);
          modelsRef.current[index] = model; // Use index to ensure correct order

          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
            mixersRef.current.push(mixer);
          }
        });
      }
    );

    // --- Event Handlers & Animation Loop (largely unchanged) ---
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
          const outerGlow = marker.children[0] as THREE.Mesh;
          const middleGlow = marker.children[1] as THREE.Mesh;
          if (outerGlow?.material) {
            (outerGlow.material as THREE.MeshBasicMaterial).opacity =
              0.2 + Math.sin(elapsedTime * 4 + index) * 0.2;
            const scale = 1 + Math.sin(elapsedTime * 3 + index * 0.5) * 0.1;
            outerGlow.scale.set(scale, scale, 1);
          }
          if (middleGlow?.material) {
            (middleGlow.material as THREE.MeshBasicMaterial).opacity =
              0.4 + Math.sin(elapsedTime * 5 + index * 0.7) * 0.2;
          }
          marker.children.forEach((child, childIndex) => {
            if (childIndex >= 6) {
              const arrow = child as THREE.Mesh;
              if (arrow.geometry?.type === "ConeGeometry") {
                const baseAngle = ((childIndex - 6) / 6) * Math.PI * 2;
                const animatedAngle = baseAngle + elapsedTime * 0.5;
                arrow.position.x = Math.cos(animatedAngle) * 0.2;
                arrow.position.y = Math.sin(animatedAngle) * 0.2;
                arrow.rotation.z = animatedAngle + Math.PI / 2;
                if (arrow.material) {
                  (arrow.material as THREE.MeshBasicMaterial).opacity =
                    0.6 + Math.sin(elapsedTime * 6 + childIndex) * 0.2;
                }
              }
            }
          });
        }
      });
      controlsRef.current?.update();
      renderer.render(sceneRef.current, camera);
    };
    animate();

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("wheel", handleScroll);
      renderer.domElement.removeEventListener("click", handleClick);
      controlsRef.current?.dispose();
      // Proper scene cleanup
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
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      {!isLoaded && <LoadingScreen progress={loadingProgress} />}

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
          position: "absolute",
          top: isMobile ? "-60px" : "0",
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(circle at center, rgba(0, 0, 0, ${
            isPopupVisible ? "0.6" : "0"
          }), rgba(0, 0, 0, ${isPopupVisible ? "0.2" : "0"}))`,
          zIndex: 10,
          opacity: isPopupVisible ? 1 : 0,
          visibility: isPopupVisible ? "visible" : "hidden",
          transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          pointerEvents: isPopupVisible ? "auto" : "none",
          backdropFilter: isPopupVisible ? "blur(3px)" : "blur(0px)",
        }}
        onClick={handleClose}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "32px",
            padding: "40px",
            maxWidth: "90%",
            maxHeight: "80%",
            overflowY: "auto",
            boxShadow: isPopupVisible
              ? "0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset"
              : "0 0 0 rgba(0, 0, 0, 0)",
            transform: isPopupVisible
              ? "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)"
              : "perspective(1000px) rotateX(-90deg) rotateY(15deg) scale(0.3) translateZ(-500px)",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            position: "relative",
            willChange: "transform",
            transformOrigin: "center center",
            filter: isPopupVisible ? "brightness(1)" : "brightness(0.3)",
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
              width: isMobile  ? "36px" : "44px", // smaller on mobile
              height: isMobile  ? "36px" : "44px",
              color: "#fff",
              fontSize: isMobile  ? "18px" : "22px",
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
