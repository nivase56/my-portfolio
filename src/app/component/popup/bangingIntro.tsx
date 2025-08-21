"use client";
import React, { useState } from "react";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";
import Image from "next/image";

const ScreenshotGallery: React.FC = () => {
  const [isMobileView, setIsMobileView] = useState(false);

  // Mobile mapping
  const mobileLinks: Record<number, string> = {
    1: "https://1hairstop.in/",
    2: "https://1hairstop.in/",
    3: "https://1hairstop.in/",
    4: "https://1hairstop.in/",
    5: "https://1hairstop.in/",
    6: "https://airbrill.in/",
    7: "https://airbrill.in/",
    8: "https://airbrill.in/",
    9: "https://airbrill.in/",
    10: "https://dev.fasttrackcabs.in",
    11: "https://dev.fasttrackcabs.in",
    12: "https://dev.fasttrackcabs.in",
    13: "https://dev.fasttrackcabs.in",
    14: "https://rotopolymer.com/",
    15: "https://rotopolymer.com/",
    16: "https://rotopolymer.com/",
    17: "https://ssb-static-site.vercel.app",
    18: "https://ssb-static-site.vercel.app",
    19: "https://ssb-static-site.vercel.app",
    20: "https://ssb-static-site.vercel.app",
  };

  // Desktop mapping
  const desktopLinks: Record<number, string> = {
    1: "https://airbrill.in/",
    2: "https://airbrill.in/",
    3: "https://airbrill.in/",
    4: "https://airbrill.in/",
    5: "https://ssb-static-site.vercel.app",
    6: "https://ssb-static-site.vercel.app",
    7: "https://ssb-static-site.vercel.app",
    8: "https://ssb-static-site.vercel.app",
    9: "https://dev.fasttrackcabs.in",
    10: "https://1hairstop.in/",
    11: "https://1hairstop.in/",
    12: "https://1hairstop.in/",
    13: "https://1hairstop.in/",
    14: "https://dev.fasttrackcabs.in",
    15: "https://dev.fasttrackcabs.in",
    16: "https://rotopolymer.com/",
    17: "https://rotopolymer.com/",
    18: "https://rotopolymer.com/",
    19: "https://rotopolymer.com/",
    20: "https://dev.fasttrackcabs.in",
  };

  const images = Array.from({ length: 20 }, (_, i) => {
    const id = i + 1;
    const url = isMobileView
      ? `/images/mobile/${id}.avif`
      : `/images/desktop/${id}.avif`;
    const link = isMobileView ? mobileLinks[id] : desktopLinks[id];
    return { id, src: url, href: link };
  });

  return (
    <div className="w-full  py-4">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold text-white">Project Showcase</h2>

        {/* Device Toggle */}
        <div className="flex bg-gray-500 rounded-full p-1 shadow-md">
          <button
            onClick={() => setIsMobileView(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              !isMobileView
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Monitor size={20} />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => setIsMobileView(true)}
            className={`flex items-center gap-2 px-4  rounded-full transition ${
              isMobileView
                ? "bg-orange-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Smartphone size={18} />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </div>

      <div className="text-center mb-4 py-2 md:w-full w-72">
        <p className="text-white/80 text-sm sm:text-base italic">
          💡 To know about my{" "}
          <span className="font-semibold text-white">Resume</span>, please click
          the{" "}
          <span className="text-purple-300 font-medium">Typing character</span>.
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-4">
        {images.map((img, index) => (
          <a
            key={index}
            href={img.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex justify-center opacity-0 translate-y-5 animate-fadeInUp"
            style={{ animationDelay: `${index * 0.04}s` }}
          >
            <div className="overflow-hidden rounded-xl shadow-md flex  items-center justify-center group-hover:scale-[1.03] transition">
              <Image
                height={460}
                width={320}
                src={img.src}
                alt={`Screenshot ${img.id}`}
                loading="lazy"
                className={`object-contain `}
              />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex gap-1 flex-col items-center justify-center text-sm sm:text-base font-medium transition">
              <span
                className={`text-white font-bold underline rounded-2xl bg-black/65 h-10 flex items-center justify-center ${
                  isMobileView ? "w-36" : "w-full"
                }`}
              >
                {new URL(img.href).hostname}
                <ExternalLink size={16} className=" text-white" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default ScreenshotGallery;
