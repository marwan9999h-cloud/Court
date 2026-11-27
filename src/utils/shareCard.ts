/**
 * THE COURT - Share Verdict Card
 * Generates a 1080x1920 (story format) verdict card as a PNG.
 * Spoiler-free: shows the score and fairness, never the correct verdict.
 */

export interface CourtShareCardData {
  fileCode: string;
  caseTitle: string;
  stars: number; // 0..10, halves allowed
  verdictCorrect: boolean;
  fairnessLabel: string; // e.g. "حكم عادل"
  rankTitle: string; // career rank, e.g. "قاضٍ متدرب"
}

const W = 1080;
const H = 1920;
const GOLD = '#d4af37';
const GOLD_LIGHT = '#f3d166';
const BG = '#0b0b0c';

async function ensureFontsLoaded(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load('700 100px Amiri'),
      document.fonts.load('800 64px Cairo'),
      document.fonts.load('600 44px Cairo'),
      document.fonts.load('900 88px Cinzel'),
      document.fonts.load('700 34px Cairo'),
    ]);
    await document.fonts.ready;
  } catch {
    // Fall back to system fonts.
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fillRatio: number,
): void {
  const spikes = 5;
  const outer = r;
  const inner = r * 0.45;
  const path = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;
    ctx.moveTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    for (let i = 0; i < spikes; i++) {
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * inner, cy + Math.sin(rot) * inner);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * outer, cy + Math.sin(rot) * outer);
    }
    ctx.closePath();
  };
  // base (empty) star
  path(ctx);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,175,55,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // filled portion
  if (fillRatio > 0) {
    ctx.save();
    path(ctx);
    ctx.clip();
    ctx.fillStyle = GOLD;
    const w = outer * 2 * Math.max(0, Math.min(1, fillRatio));
    ctx.fillRect(cx - outer, cy - outer, w, outer * 2);
    ctx.restore();
  }
}

function drawScales(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
  ctx.save();
  ctx.strokeStyle = GOLD;
  ctx.fillStyle = GOLD;
  ctx.lineWidth = s * 0.07;
  ctx.lineCap = 'round';
  // center post
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.7);
  ctx.lineTo(cx, cy + s * 0.55);
  ctx.stroke();
  // beam
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s * 0.45);
  ctx.lineTo(cx + s, cy - s * 0.45);
  ctx.stroke();
  // top knob
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.78, s * 0.09, 0, Math.PI * 2);
  ctx.fill();
  // base
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.4, cy + s * 0.7);
  ctx.lineTo(cx + s * 0.4, cy + s * 0.7);
  ctx.stroke();
  // pans
  for (const dir of [-1, 1]) {
    const px = cx + dir * s;
    ctx.beginPath();
    ctx.moveTo(px, cy - s * 0.45);
    ctx.lineTo(px - s * 0.28, cy + s * 0.12);
    ctx.moveTo(px, cy - s * 0.45);
    ctx.lineTo(px + s * 0.28, cy + s * 0.12);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, cy + s * 0.12, s * 0.3, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  for (const l of lines) {
    ctx.fillText(l, cx, y);
    y += lineHeight;
  }
  return y;
}

export async function generateCourtShareCard(
  data: CourtShareCardData,
): Promise<Blob> {
  await ensureFontsLoaded();

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D not supported');

  // ---- Background: charcoal with a warm golden glow from the top
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, -100, 60, W / 2, -100, 950);
  glow.addColorStop(0, 'rgba(212,175,55,0.30)');
  glow.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.78);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  // Double gold frame
  ctx.strokeStyle = 'rgba(212,175,55,0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.strokeStyle = 'rgba(212,175,55,0.25)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(62, 62, W - 124, H - 124);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // ---- Header
  ctx.fillStyle = 'rgba(250,247,240,0.55)';
  ctx.font = '600 30px Cairo, sans-serif';
  ctx.direction = 'rtl';
  ctx.fillText('المحكمة الجنائية العليا — منصة القضاء', W / 2, 140);

  ctx.direction = 'ltr';
  ctx.fillStyle = GOLD;
  ctx.font = '900 88px Cinzel, serif';
  ctx.fillText('THE COURT', W / 2, 248);

  drawScales(ctx, W / 2, 420, 95);

  // ---- Case block
  ctx.fillStyle = 'rgba(212,175,55,0.06)';
  ctx.fillRect(110, 560, W - 220, 250);
  ctx.strokeStyle = 'rgba(212,175,55,0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(110, 560, W - 220, 250);

  ctx.fillStyle = GOLD;
  ctx.font = '600 32px Cairo, sans-serif';
  ctx.direction = 'ltr';
  ctx.fillText(data.fileCode, W / 2, 610);

  ctx.fillStyle = '#faf7f0';
  ctx.font = '700 72px Amiri, serif';
  ctx.direction = 'rtl';
  drawWrapped(ctx, data.caseTitle, W / 2, 690, W - 320, 88);

  // ---- Stars row
  const starR = 40;
  const gap = 17;
  const totalW = 10 * starR * 2 + 9 * gap;
  let sx = W / 2 - totalW / 2 + starR;
  for (let i = 0; i < 10; i++) {
    const fill = Math.max(0, Math.min(1, data.stars - i));
    drawStar(ctx, sx, 920, starR, fill);
    sx += starR * 2 + gap;
  }

  ctx.fillStyle = '#faf7f0';
  ctx.font = '800 76px Cairo, sans-serif';
  ctx.direction = 'ltr';
  ctx.fillText(`${data.stars} / 10`, W / 2, 1040);

  // ---- Verdict + fairness stamps
  const verdictText = data.verdictCorrect ? 'حكم صحيح' : 'حكم خاطئ';
  const verdictColor = data.verdictCorrect ? '#10b981' : '#f43f5e';
  ctx.save();
  ctx.translate(W / 2, 1190);
  ctx.rotate(-0.045);
  ctx.font = '800 84px Cairo, sans-serif';
  const vw = ctx.measureText(verdictText).width + 90;
  ctx.strokeStyle = verdictColor;
  ctx.lineWidth = 7;
  ctx.strokeRect(-vw / 2, -80, vw, 160);
  ctx.strokeRect(-vw / 2 + 12, -80 + 12, vw - 24, 160 - 24);
  ctx.fillStyle = verdictColor;
  ctx.direction = 'rtl';
  ctx.fillText(verdictText, 0, 4);
  ctx.restore();

  ctx.fillStyle = data.fairnessLabel.includes('جائر') ? '#f59e0b' : GOLD_LIGHT;
  ctx.font = '700 54px Amiri, serif';
  ctx.direction = 'rtl';
  ctx.fillText(data.fairnessLabel, W / 2, 1330);

  // ---- Rank strip
  ctx.fillStyle = 'rgba(212,175,55,0.08)';
  ctx.fillRect(110, 1420, W - 220, 110);
  ctx.strokeStyle = 'rgba(212,175,55,0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(110, 1420, W - 220, 110);
  ctx.fillStyle = GOLD;
  ctx.font = '700 44px Cairo, sans-serif';
  ctx.fillText(`الرتبة: ${data.rankTitle}`, W / 2, 1476);

  // ---- Challenge + URL footer
  ctx.fillStyle = '#faf7f0';
  ctx.font = '700 58px Amiri, serif';
  ctx.fillText('إنت القاضي.. هتحكم بالعدل ولا لأ؟', W / 2, 1660);

  ctx.fillStyle = GOLD;
  ctx.font = '700 40px Cairo, sans-serif';
  ctx.direction = 'ltr';
  ctx.fillText('court-game.vercel.app', W / 2, 1740);

  ctx.fillStyle = 'rgba(250,247,240,0.4)';
  ctx.font = '600 26px Cairo, sans-serif';
  ctx.fillText('FIRST-PERSON COURTROOM TRIAL EXPERIENCE', W / 2, 1800);

  ctx.direction = 'rtl';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode share card'));
    }, 'image/png');
  });
}

/** Share via the native sheet when possible, else download the PNG. */
export async function shareCourtVerdict(data: CourtShareCardData): Promise<'shared' | 'downloaded'> {
  const blob = await generateCourtShareCard(data);
  const file = new File([blob], 'court-verdict.png', { type: 'image/png' });

  const nav = navigator as Navigator & {
    canShare?: (d: { files: File[] }) => boolean;
    share?: (d: { files: File[]; title?: string; text?: string }) => Promise<void>;
  };

  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    await nav.share({
      files: [file],
      title: 'THE COURT | المحكمة',
      text: 'حكمي في لعبة المحكمة — court-game.vercel.app',
    });
    return 'shared';
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'court-verdict.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}
