"use client";

import { useEffect, useRef, useState } from "react";
import swipeleft from "../../../../public/swipeleft.json";
import {
  PiArrowFatLineLeftFill,
  PiArrowFatLineRightFill,
} from "react-icons/pi";
// Declare lottie global type
declare global {
  interface Window {
    lottie: {
      loadAnimation: (params: {
        container: HTMLElement;
        renderer: "svg" | "canvas" | "html";
        loop: boolean;
        autoplay: boolean;
        animationData: unknown;
      }) => {
        destroy: () => void;
        play: () => void;
        pause: () => void;
        stop: () => void;
      };
    };
  }
}

const animationData = swipeleft; // <-- PASTE YOUR JSON OBJECT HERE

const LottieModal = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<ReturnType<
    typeof window.lottie.loadAnimation
  > | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  useEffect(() => {
    const loadLottieScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if lottie is already loaded
        if (window.lottie) {
          resolve();
          return;
        }

        // Create script element
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Lottie script"));
        document.head.appendChild(script);
      });
    };

    const initAnimation = async () => {
      if (!animationData) {
        console.log(
          "No animation data provided. Please replace the animationData variable with your Lottie JSON."
        );
        return;
      }

      try {
        // Load Lottie script from CDN
        await loadLottieScript();

        if (containerRef.current && window.lottie) {
          // Clear previous animation
          if (animationRef.current) {
            animationRef.current.destroy();
          }

          // Clear container
          containerRef.current.innerHTML = "";

          // Load the Lottie animation with loop enabled
          animationRef.current = window.lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: true,
            autoplay: true,
            animationData: animationData,
          });

          console.log("Animation loaded successfully and playing on loop!");
        }
      } catch (error) {
        console.error("Error loading animation:", error);
      }
    };

    initAnimation();

    // Cleanup function
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left) / width;
    const y = (clientY - top) / height;
    setRotateY((x - 0.5) * 30);
    setRotateX((0.5 - y) * 30);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        className="relative overflow-y-hidden"
        style={{
          padding: "10px",
          maxWidth: "90%",
          maxHeight: "80%",
        }}
      >
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-[180px] h-40 md:w-[220px] md:h-[130px] mx-auto mt-[350px] md:mt-[450px] flex items-center justify-center rounded-2xl overflow-hidden cursor-pointer"
          style={{
            border: "none",
          }}
        ></div>
        <div className="text-lg  text-center text-white">
          <p className="text-white">
            <PiArrowFatLineLeftFill className="inline text-white text-2xl" /> or{" "}
            <PiArrowFatLineRightFill className="inline text-white text-2xl" />{" "}
            to enjoy a 360° view!
          </p>{" "}
        </div>
      </div>
    </div>
  );
};

export default LottieModal;
