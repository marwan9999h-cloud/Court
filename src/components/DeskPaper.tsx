import React, { useState, useRef, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useCourtFonts } from './courtFonts';
import { useTapHandler } from './pointerGesture';

export type DeskPaperTheme = 'evidence' | 'characters' | 'notes' | 'verdict';

interface DeskPaperProps {
  position: [number, number, number];
  rotationY?: number;
  theme: DeskPaperTheme;
  title: string;
  subtitle?: string;
  lines: string[];
  hoverLabel: string;
  onSelect: () => void;
  onHover: (label: string | null) => void;
}

const THEMES: Record<DeskPaperTheme, { bg: string; accent: string; ink: string }> = {
  evidence: { bg: '#f6efe0', accent: '#7c2d12', ink: '#120d07' },
  characters: { bg: '#eef2f5', accent: '#1e3a5f', ink: '#0c131a' },
  notes: { bg: '#fbf3cf', accent: '#a16207', ink: '#171104' },
  verdict: { bg: '#f8e9e7', accent: '#9b1c1c', ink: '#1c0808' },
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const out: string[] = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

function makeTexture(p: { theme: DeskPaperTheme; title: string; subtitle?: string; lines: string[] }) {
  const th = THEMES[p.theme];
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Paper base + subtle inner border
  ctx.fillStyle = th.bg;
  ctx.fillRect(0, 0, 768, 1024);
  ctx.strokeStyle = th.accent;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 728, 984);
  ctx.globalAlpha = 1;

  // Header & footer bands
  ctx.fillStyle = th.accent;
  ctx.fillRect(0, 0, 768, 190);
  ctx.fillRect(0, 998, 768, 26);

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  // Scales emblem + title in elegant Amiri calligraphy
  ctx.fillStyle = '#f3d98b';
  ctx.font = '44px serif';
  ctx.fillText('⚖', 384, 58);
  ctx.fillStyle = '#fff7e0';
  ctx.font = '700 92px "Amiri", "Cairo", serif';
  ctx.fillText(p.title, 384, 150);

  let y = 292;
  if (p.subtitle) {
    ctx.fillStyle = th.accent;
    ctx.font = '700 50px "Cairo", "Amiri", sans-serif';
    ctx.fillText(p.subtitle, 384, y);
    y += 26;
    ctx.fillRect(120, y, 528, 4);
    y += 66;
  }

  // Body lines
  ctx.textAlign = 'right';
  ctx.fillStyle = th.ink;
  ctx.font = '700 54px "Cairo", "Amiri", sans-serif';
  for (const line of p.lines) {
    for (const l of wrap(ctx, line, 600)) {
      if (y > 905) break;
      ctx.fillText(l, 688, y);
      y += 72;
    }
    y += 14;
  }

  // Footer court line
  ctx.textAlign = 'center';
  ctx.fillStyle = th.accent;
  ctx.font = '700 30px "Amiri", "Cairo", serif';
  ctx.fillText('محكمة العدل العليا — دائرة الجنايات الكبرى', 384, 982);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
}

export function DeskPaper({ position, rotationY = 0, theme, title, subtitle, lines, hoverLabel, onSelect, onHover }: DeskPaperProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const fontsReady = useCourtFonts();
  const tapHandlers = useTapHandler(onSelect);
  const key = title + '|' + subtitle + '|' + lines.join('|');
  const texture = useMemo(() => makeTexture({ theme, title, subtitle, lines }), [key, theme, fontsReady]);
  const w = 0.315;
  const h = 0.42;

  useFrame((_, d) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1] + (hovered ? 0.03 : 0), Math.min(1, d * 12));
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      userData={{ interactiveTarget: true }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setHovered(true); onHover(hoverLabel); }}
      onPointerOut={() => { setHovered(false); onHover(null); }}
      {...tapHandlers}
    >
      <mesh position={[0, 0.004, 0]} castShadow receiveShadow>
        <boxGeometry args={[w + 0.01, 0.008, h + 0.01]} />
        <meshStandardMaterial color="#efe7d6" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.0162, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={texture} roughness={0.85} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={0.1} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
    </group>
  );
}
