"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import {
  SiReact,
  SiTypescript,
  SiNextdotjs,
  SiPython,
  SiNodedotjs,
  SiDotnet,
  SiDocker,
  SiPostgresql,
} from "react-icons/si";

interface Tile {
  id: string;
  name: string;
  icon: ReactNode;
  bgDark: string;
  bgLight: string;
}

const TILES: Tile[] = [
  { id: "react", name: "React", icon: <SiReact size={16} />, bgDark: "rgba(97,218,251,0.12)", bgLight: "rgba(97,218,251,0.15)" },
  { id: "ts", name: "TypeScript", icon: <SiTypescript size={14} />, bgDark: "rgba(49,120,198,0.14)", bgLight: "rgba(49,120,198,0.12)" },
  { id: "next", name: "Next.js", icon: <SiNextdotjs size={15} />, bgDark: "rgba(255,255,255,0.10)", bgLight: "rgba(0,0,0,0.08)" },
  { id: "python", name: "Python", icon: <SiPython size={15} />, bgDark: "rgba(255,212,59,0.11)", bgLight: "rgba(55,118,171,0.10)" },
  { id: "node", name: "Node.js", icon: <SiNodedotjs size={15} />, bgDark: "rgba(104,159,56,0.13)", bgLight: "rgba(104,159,56,0.12)" },
  { id: "dotnet", name: ".NET", icon: <SiDotnet size={15} />, bgDark: "rgba(81,43,212,0.13)", bgLight: "rgba(81,43,212,0.10)" },
  { id: "docker", name: "Docker", icon: <SiDocker size={15} />, bgDark: "rgba(29,136,209,0.12)", bgLight: "rgba(29,136,209,0.10)" },
  { id: "sql", name: "PostgreSQL", icon: <SiPostgresql size={14} />, bgDark: "rgba(51,103,145,0.14)", bgLight: "rgba(51,103,145,0.12)" },
];

type Grid = (Tile | null)[];

function initGrid(): Grid {
  const shuffled = [...TILES].sort(() => Math.random() - 0.5);
  return [...shuffled, null];
}

function getAdjacentToGap(grid: Grid): number[] {
  const gapIdx = grid.indexOf(null);
  const row = Math.floor(gapIdx / 3);
  const col = gapIdx % 3;
  const adj: number[] = [];
  if (row > 0) adj.push(gapIdx - 3);
  if (row < 2) adj.push(gapIdx + 3);
  if (col > 0) adj.push(gapIdx - 1);
  if (col < 2) adj.push(gapIdx + 1);
  return adj;
}

export function StackCell() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [grid, setGrid] = useState<Grid>(initGrid);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const gap = 3;
      setCellSize({
        w: (rect.width - gap * 2) / 3,
        h: (rect.height - gap * 2) / 3,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleTileClick = (idx: number) => {
    const adjacent = getAdjacentToGap(grid);
    if (!adjacent.includes(idx)) return;

    const gapIdx = grid.indexOf(null);
    const newGrid = [...grid];
    newGrid[gapIdx] = newGrid[idx];
    newGrid[idx] = null;
    setGrid(newGrid);
  };

  const gap = 3;

  return (
    <div className="relative flex flex-col h-full p-2 sm:p-3">
      <div ref={containerRef} className="relative flex-1">
        {cellSize.w > 0 &&
          grid.map((tile, idx) => {
            const row = Math.floor(idx / 3);
            const col = idx % 3;
            const x = col * (cellSize.w + gap);
            const y = row * (cellSize.h + gap);

            if (!tile) return null;

            return (
              <motion.button
                key={tile.id}
                animate={{ x, y, scale: 1 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.6 }}
                onClick={() => handleTileClick(idx)}
                className="absolute top-0 left-0 flex flex-col items-center justify-center rounded-[4px] cursor-pointer select-none"
                style={{
                  width: cellSize.w,
                  height: cellSize.h,
                  backgroundColor: isDark ? tile.bgDark : tile.bgLight,
                }}
              >
                <span
                  style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)" }}
                >
                  {tile.icon}
                </span>
                <span
                  className="mt-1 text-[7px] sm:text-[8px] font-medium tracking-wide leading-none"
                  style={{ color: isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)" }}
                >
                  {tile.name}
                </span>
              </motion.button>
            );
          })}
      </div>
    </div>
  );
}
