"use client";
import React, { JSX, useEffect, useState } from "react";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiJavascript,
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiGraphql,
  SiApollographql,
  SiRedux,
  SiTailwindcss,
  SiSass,
  SiWebpack,
  SiVite,
  SiStorybook,
  SiReactquery,
  SiPrisma,
  SiMongodb,
  SiDocker,
  SiAmazon,
  SiFirebase,
  SiNuxtdotjs,
  SiThreedotjs,
  SiD3Dotjs,
  SiChartdotjs,
  SiStripe,
  SiSupabase,
} from "react-icons/si";

export type Category = "frontend" | "backend" | "devops";
export type HoneycombGridProps = {
  items?: { label: string; category: Category }[];
  perRow?: number;
  size?: number;
  onSelect?: (value: string, index: number) => void;
};

const CATEGORY_COLORS: Record<Category, string> = {
  frontend: "linear-gradient(135deg, #1f59ab, #1ca9c9)",
  backend: "linear-gradient(135deg, #13aa52, #13aa52)",
  devops: "linear-gradient(135deg, #ff9800, #ff5722)",
};

// Map labels → icons
const ICON_MAP: Record<string, JSX.Element> = {
  React: <SiReact />,
  "Next.js": <SiNextdotjs />,
  TypeScript: <SiTypescript />,
  JavaScript: <SiJavascript />,
  "Node.js": <SiNodedotjs />,
  Express: <SiExpress />,
  NestJS: <SiNestjs />,
  GraphQL: <SiGraphql />,
  Apollo: <SiApollographql />,
  Redux: <SiRedux />,
  TailwindCSS: <SiTailwindcss />,
  Sass: <SiSass />,
  Webpack: <SiWebpack />,
  Vite: <SiVite />,
  Storybook: <SiStorybook />,
  "TanStack Query": <SiReactquery />,
  Prisma: <SiPrisma />,
  MongoDB: <SiMongodb />,
  Docker: <SiDocker />,
  AWS: <SiAmazon />,
  Firebase: <SiFirebase />,
  Nuxt: <SiNuxtdotjs />,
  "Three.js": <SiThreedotjs />,
  "D3.js": <SiD3Dotjs />,
  "Chart.js": <SiChartdotjs />,
  Stripe: <SiStripe />,
  Supabase: <SiSupabase />,
};

const DEFAULT_TECHS: { label: string; category: Category }[] = [
  { label: "React", category: "frontend" },
  { label: "Next.js", category: "frontend" },
  { label: "TypeScript", category: "frontend" },
  { label: "JavaScript", category: "frontend" },
  { label: "Node.js", category: "backend" },
  { label: "Express", category: "backend" },
  { label: "NestJS", category: "backend" },
  { label: "GraphQL", category: "backend" },
  { label: "Apollo", category: "backend" },
  { label: "Redux", category: "frontend" },
  { label: "TailwindCSS", category: "frontend" },
  { label: "Sass", category: "frontend" },
  { label: "Webpack", category: "devops" },
  { label: "Vite", category: "devops" },
  { label: "Storybook", category: "frontend" },
  { label: "TanStack Query", category: "frontend" },
  { label: "Prisma", category: "backend" },
  { label: "MongoDB", category: "backend" },
  { label: "Docker", category: "devops" },
  { label: "AWS", category: "devops" },
  { label: "Firebase", category: "backend" },
  { label: "Supabase", category: "backend" },
  { label: "Stripe", category: "backend" },
  { label: "Three.js", category: "frontend" },
  { label: "D3.js", category: "frontend" },
  { label: "Chart.js", category: "frontend" },
  { label: "Nuxt", category: "frontend" },
];

function chunkHoneycomb<T>(items: T[], perRow: number): T[][] {
  const rows: T[][] = [];
  let i = 0;
  let rowIndex = 0;
  if (perRow < 2) perRow = 2;
  while (i < items.length) {
    const count = rowIndex % 2 === 0 ? perRow : Math.max(1, perRow - 1);
    rows.push(items.slice(i, i + count));
    i += count;
    rowIndex += 1;
  }
  return rows;
}

const HexButton: React.FC<{
  label: string;
  size: number;
  category: Category;
  onClick?: () => void;
}> = ({ label, size, category, onClick }) => {
  const Icon = ICON_MAP[label];
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative select-none outline-none 
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
        shadow-md transition-transform duration-200 ease-out
        hover:scale-105 hover:shadow-xl active:scale-95
      "
      style={{
        width: `${size}px`,
        height: `${size * 0.866}px`,
        clipPath:
          "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
        background: CATEGORY_COLORS[category],
        marginLeft: `-${size * 0.13}px`,
        color: "white",
        textShadow: "0px 1px 3px rgba(0,0,0,0.4)",
      }}
    >
      <div className="h-full w-full flex flex-col items-center justify-center px-1 text-center">
        {Icon && (
          <div className="text-xl sm:text-2xl mb-1 transition-transform duration-200 group-hover:scale-110">
            {Icon}
          </div>
        )}
        <span className="text-[10px] sm:text-xs md:text-sm font-semibold leading-tight">
          {label}
        </span>
      </div>
    </button>
  );
};

const HoneycombGrid: React.FC<HoneycombGridProps> = ({
  items = DEFAULT_TECHS,
  perRow = 6,
  size = 120,
  onSelect,
}) => {
  const [responsiveSize, setResponsiveSize] = useState(size);
  const [responsivePerRow, setResponsivePerRow] = useState(perRow);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setResponsiveSize(80);
        setResponsivePerRow(4);
      } else if (window.innerWidth < 768) {
        setResponsiveSize(100);
        setResponsivePerRow(4);
      } else {
        setResponsiveSize(size);
        setResponsivePerRow(perRow);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size, perRow]);

  const rows = chunkHoneycomb(items, responsivePerRow);
  const hexHeight = responsiveSize * 0.9560254;
  const rowOverlap = hexHeight * 0.25;

  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white my-4">Technical Skills</h2>

      {/* Legends */}
      <div className="flex flex-wrap gap-4 mb-4 sm:mb-6">
        {(["frontend", "backend", "devops"] as Category[]).map((cat) => (
          <div key={cat} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm shadow-sm"
              style={{ background: CATEGORY_COLORS[cat] }}
            />
            <span className="text-xs sm:text-sm capitalize text-white">{cat}</span>
          </div>
        ))}
      </div>

      {/* Honeycomb */}
      <div className="flex flex-col items-start">
        {rows.map((row, rIdx) => {
          const isOdd = rIdx % 2 === 1;
          return (
            <div
              key={rIdx}
              className="flex"
              style={{
                marginTop: rIdx === 0 ? 0 : `-${rowOverlap}px`,
                marginLeft: isOdd ? `${responsiveSize / 2}px` : 0,
              }}
            >
              {row.map((item, i) => {
                const globalIndex =
                  rows.slice(0, rIdx).reduce((acc, arr) => acc + arr.length, 0) +
                  i;
                return (
                  <HexButton
                    key={item.label + i}
                    label={item.label}
                    size={responsiveSize}
                    category={item.category}
                    onClick={
                      onSelect ? () => onSelect(item.label, globalIndex) : undefined
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="text-center mb-4 py-2 md:w-full w-72">
        <p className="text-white/80 text-sm sm:text-base italic">
          💡 To know about my{" "}
          <span className="font-semibold text-white">Projects</span>, please click
          the{" "}
          <span className="text-purple-300 font-medium">
            Table Banger character
          </span>
          .
        </p>
      </div>
    </div>
  );
};

export default HoneycombGrid;
