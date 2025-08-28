
"use client";
import { FaUsers, FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { FiInfo } from "react-icons/fi";
import React, { useState, useRef, useEffect } from "react";
import { GiArcher, GiFactory, GiIdCard } from "react-icons/gi";

const Navbar = () => {
      const [showTooltip, setShowTooltip] = useState(false);
      const tooltipRef = useRef<HTMLDivElement>(null);
    
      // Auto close when clicking outside (for mobile)
      useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (
            tooltipRef.current &&
            !tooltipRef.current.contains(event.target as Node)
          ) {
            setShowTooltip(false);
          }
        }
        if (showTooltip) {
          document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, [showTooltip]);
    
      // Handle hover for desktop
      const handleMouseEnter = () => {
        if (window.innerWidth >= 768) {
          // Only show tooltip on desktop (md breakpoint)
          setShowTooltip(true);
        }
      };
    
      const handleMouseLeave = () => {
        if (window.innerWidth >= 768) {
          // Only hide tooltip on desktop
          setShowTooltip(false);
        }
      };
    
  return (
    <div className="absolute top-2 md:top-4 left-2 md:left-8 flex items-center gap-4 z-[200000]">
        {/* WhatsApp */}
        <a
          href="https://wa.me/917010477407?text=Hello%20Nivas%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20connect."
          target="_blank"
          rel="noopener noreferrer"
          className="relative group p-2 rounded-full bg-green-500 shadow-md hover:shadow-lg
              transform hover:-translate-y-1 transition-all duration-300 ease-out"
          title="Chat on WhatsApp"
        >
          <FaWhatsapp className="w-7 h-7 text-white" />
        </a>

        {/* Gmail */}
        <a
          href="mailto:nivashrajar@gmail.com?subject=Portfolio%20Contact&body=Hello%20Nivas%2C%20I%20saw%20your%20portfolio%20and%20want%20to%20get%20in%20touch."
          className="relative group p-2 rounded-full bg-[#FF0000] shadow-md hover:shadow-lg
              transform hover:-translate-y-1 transition-all duration-300 ease-out"
          title="Send Email"
        >
          <SiGmail className="w-7 h-7 text-white" />
        </a>

        {/* Info Button with Tooltip */}
        <div className="relative" ref={tooltipRef}>
          <button
            onClick={() => setShowTooltip((prev) => !prev)} // Toggle on click (mobile)
            onMouseEnter={handleMouseEnter} // Show on hover (desktop)
            onMouseLeave={handleMouseLeave} // Hide on hover out (desktop)
            className="p-2 rounded-full bg-[#009DD1] shadow-md hover:shadow-lg
              transform hover:-translate-y-1 transition-all duration-300 ease-out flex items-center justify-center"
          >
            <FiInfo className="w-7 h-7 text-white" />
          </button>

          {/* Desktop Tooltip (hover-based) */}
          <div
            className={`absolute top-16 left-1/2 -translate-x-1/2 
            w-[400px] px-6 py-3 text-start
            rounded-2xl bg-transparent backdrop-blur-md border border-white/30 shadow-xl
            text-xl text-white font-medium 
            transition-all duration-300 ease-out transform
            ${
              showTooltip
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2"
            }
            hidden md:block`}
          >
            <p>
              Click on each character <FaUsers className="inline text-3xl" /> to
              explore:
            </p>
            <p className="mt-1">
              • Technical expertise <GiArcher className="inline text-3xl" />
            </p>
            <p>
              • Project experience <GiFactory className="inline text-3xl" />
            </p>
            <p>
              • Professional details <GiIdCard className="inline text-3xl" />
            </p>

            {/* Arrow */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 
              bg-transparent backdrop-blur-md border-t border-l border-white/30 
              rotate-45"
            />
          </div>

          {/* Mobile Tooltip (click-based) */}
          {showTooltip && (
            <div
              className="absolute top-12 left-1/2 w-[280px] -translate-x-1/2 px-4 py-3 
              rounded-xl bg-transparent backdrop-blur-xl shadow-xl border border-white/50 text-md text-black font-bold 
              transform transition-all duration-300 ease-out text-start z-50 md:hidden"
            >
              <p>
                Click on each character <FaUsers className="inline text-3xl" />{" "}
                to explore:
              </p>
              <p className="mt-1">
                • Technical expertise <GiArcher className="inline text-3xl" />
              </p>
              <p>
                • Project experience <GiFactory className="inline text-3xl" />
              </p>
              <p>
                • Professional details <GiIdCard className="inline text-3xl" />
              </p>

            </div>
          )}
        </div>
      </div>
  )
}

export default Navbar
