"use client";
import { FaUsers, FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import React, { useState, useRef, useEffect } from "react";
import { GiArcher, GiFactory, GiIdCard } from "react-icons/gi";
import { TbInfoOctagon } from "react-icons/tb";

const Navbar = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastPhase, setToastPhase] = useState("hidden");
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      setShowTooltip(true);
    }
  };
  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      setShowTooltip(false);
    }
  };

  // Toast lifecycle (7s close)
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowToast(true);
      setToastPhase("entering");

      const visibleTimer = setTimeout(() => {
        setToastPhase("visible");

        const exitTimer = setTimeout(() => {
          setToastPhase("exiting");

          const hideTimer = setTimeout(() => {
            setShowToast(false);
            setToastPhase("hidden");
          }, 700);

          return () => clearTimeout(hideTimer);
        }, 5000); // visible for 7s

        return () => clearTimeout(exitTimer);
      }, 800);

      return () => clearTimeout(visibleTimer);
    }, 3500);

    return () => clearTimeout(showTimer);
  }, []);

  const getToastClasses = () => {
    const baseClasses =
      "absolute left-40 top-14 -translate-y-1/2 bg-gradient-to-l from-amber-700 via-yellow-700 to-orange-800 text-white text-[12px] md:text-sm font-semibold px-2 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl shadow-2xl z-[300000] backdrop-blur-sm border border-white/20 transform transition-all duration-700 ease-out w-[200px] md:w-auto max-w-[250px] md:max-w-none";

    switch (toastPhase) {
      case "entering":
        return `${baseClasses} opacity-0 translate-x-0 scale-90 animate-bounce-in`;
      case "visible":
        return `${baseClasses} opacity-100 translate-x-4 scale-100 animate-float`;
      case "exiting":
        return `${baseClasses} opacity-0 translate-x-8 scale-110 animate-zoom-out`;
      default:
        return `${baseClasses} opacity-0 translate-x-0 scale-90`;
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: translateY(-50%) translateX(-15px) scale(0.7)
              rotate(-10deg);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) translateX(8px) scale(1) rotate(0deg);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(-50%) translateX(8px) scale(1);
          }
          50% {
            transform: translateY(-50%) translateX(12px) scale(1.02);
          }
        }
        @keyframes zoom-out {
          0% {
            opacity: 1;
            transform: translateY(-50%) translateX(8px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50%) translateX(30px) scale(0.6);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.8s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-zoom-out {
          animation: zoom-out 0.7s ease-in;
        }
        .toast-glow {
          box-shadow: 0 0 25px 5px rgba(202, 138, 4, 0.4),
            0 0 50px 10px rgba(180, 83, 9, 0.3),
            0 6px 25px rgba(0, 0, 0, 0.3);
        }
      `}</style>

      <div className="absolute top-2 md:top-4 left-0 right-0 flex items-center justify-between z-[200000] w-full px-4 py-2 rounded-xl">
        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/917010477407?text=Hello%20Nivas%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20connect."
            target="_blank"
            rel="noopener noreferrer"
            className="relative group p-2 rounded-full bg-green-500 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-out"
            title="Chat on WhatsApp"
          >
            <FaWhatsapp className="w-7 h-7 text-white" />
          </a>

          <a
            href="mailto:nivashrajar@gmail.com?subject=Portfolio%20Contact&body=Hello%20Nivas%2C%20I%20saw%20your%20portfolio%20and%20want%20to%20get%20in%20touch."
            className="relative group p-2 rounded-full bg-[#FF0000] shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-out"
            title="Send Email"
          >
            <SiGmail className="w-7 h-7 text-white" />
          </a>

          <div ref={tooltipRef}>
            <button
              onClick={() => setShowTooltip((prev) => !prev)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative p-1 rounded-full shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ease-out flex items-center justify-center"
            >
              <TbInfoOctagon className="w-7 h-7 text-white" />
            </button>

            {/* Toast */}
            {showToast && (
              <div className={`${getToastClasses()} toast-glow`}>
                <div className="flex items-center gap-1 md:gap-2">
                  <span className="font-bold text-xs md:text-sm">
                    Click Each Character to explore more!
                  </span>
                  <span className="text-lg md:text-xl animate-bounce">👆</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
