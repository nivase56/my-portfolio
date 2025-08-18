"use client";

import React, { useEffect, useRef, Suspense, useMemo, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  OrbitControls,
  useFBX,
  Points,
  PointMaterial,
  Html,
  useProgress,
} from "@react-three/drei";
import {
  AnimationMixer,
  Object3D,
  EquirectangularReflectionMapping,
  Texture,
  MeshStandardMaterial,
  Mesh,
} from "three";
import { RGBELoader } from "three-stdlib";

//
// 🔹 Loader UI
//
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white text-xl font-bold">
        Loading {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

//
// 🔹 Character Component
//
interface CharacterProps {
  path: string;
  position: [number, number, number];
  initialRotation?: [number, number, number];
}

function Character({ path, position, initialRotation = [0, 0, 0] }: CharacterProps) {
  const fbx = useFBX(path);
  const mixer = useRef<AnimationMixer | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!fbx) return;

    mixer.current = new AnimationMixer(fbx);

    if (fbx.animations.length > 0) {
      const action = mixer.current.clipAction(fbx.animations[0]);
      action.play();
    }

    // Position & rotation
    fbx.rotation.set(...initialRotation);
    fbx.position.set(...position);

    // Fix materials only once
    fbx.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => {
            if (m instanceof MeshStandardMaterial) {
              m.needsUpdate = true;
            }
          });
        } else if (child.material instanceof MeshStandardMaterial) {
          child.material.needsUpdate = true;
        }
      }
    });

    // Mark ready so we don’t lag on first frame
    setReady(true);
  }, [fbx, initialRotation, position]);

  useFrame((_, delta) => {
    if (ready && mixer.current) mixer.current.update(delta);
  });

  return <primitive object={fbx} />;
}

//
// 🔹 Particle Background
//
interface ParticleBackgroundProps {
  count: number;
}

function ParticleBackground({ count }: ParticleBackgroundProps) {
  const positions = useMemo(
    () =>
      new Float32Array(
        Array.from({ length: count }, () => [
          (Math.random() - 0.5) * 2000,
          (Math.random() - 0.5) * 2000,
          (Math.random() - 0.5) * 2000,
        ]).flat()
      ),
    [count]
  );

  return (
    <group>
      <Points positions={positions} stride={3}>
        <PointMaterial transparent color="#ffffff" size={2} sizeAttenuation depthWrite={false} />
      </Points>
    </group>
  );
}

//
// 🔹 Scene with Lighting
//
function Scene() {
  const texture: Texture = useLoader(RGBELoader, "/models/nebula_field.hdr");

  useEffect(() => {
    texture.mapping = EquirectangularReflectionMapping;
  }, [texture]);

  const characterPositions: [number, number, number][] = [
    [0, -50, 0],
    [-150, -50, 0],
    [140, -50, 0],
  ];

  return (
    <>
      {/* Environment */}
      <primitive attach="background" object={texture} />
      <primitive attach="environment" object={texture} />

      {/* === Lights (boosted) === */}
      <ambientLight intensity={0.6} color="#88ccff" />
      <directionalLight
        position={[50, 120, 80]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 80, -100]} intensity={1.5} color="#ffffff" />
      <pointLight position={[200, 20, 100]} intensity={1.2} color="#00ccff" />
      <hemisphereLight intensity={0.8} color="#ffffff" groundColor="#333333" />

      {/* Background */}
      <ParticleBackground count={400} />

      {/* Characters */}
      <Character path="/models/typing.fbx" initialRotation={[0, Math.PI, 0]} position={characterPositions[0]} />
      <Character path="/models/Banging Fist.fbx" initialRotation={[0, Math.PI, 0]} position={characterPositions[1]} />
      <Character path="/models/Sleeping Idle.fbx" initialRotation={[0, Math.PI, 0]} position={characterPositions[2]} />

      {/* Controls */}
      <OrbitControls enableDamping dampingFactor={0.05} enableZoom={false} enablePan={false} />
    </>
  );
}

//
// 🔹 Main Canvas
//
export default function HeroScene() {
  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 0, 400], fov: 50 }} shadows>
        <Suspense fallback={<Loader />}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
