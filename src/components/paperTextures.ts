import * as THREE from 'three';
import { CaseCoverInfo } from '../types';

// Cache generated textures so we don't recreate them every frame
const textureCache = new Map<string, THREE.CanvasTexture>();

export function getCaseFileCoverTexture(coverInfo: CaseCoverInfo, fontsReady: boolean = false): THREE.CanvasTexture {
  const cacheKey = `case_cover_${coverInfo.fileNumber}_${coverInfo.caseTitle}_f${fontsReady ? 1 : 0}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1360;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Dark rich legal cardstock background
    ctx.fillStyle = '#1e1814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain/vignette
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      200,
      canvas.width / 2,
      canvas.height / 2,
      700
    );
    gradient.addColorStop(0, 'rgba(45, 34, 26, 0.6)');
    gradient.addColorStop(1, 'rgba(10, 8, 6, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Dignified Gold Filigree Border
    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.strokeStyle = '#8a6e38';
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);

    // Corner decorative accents
    const corners = [
      [60, 60],
      [canvas.width - 60, 60],
      [60, canvas.height - 60],
      [canvas.width - 60, canvas.height - 60],
    ];
    ctx.fillStyle = '#c5a059';
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Central Inset Label Plaque
    ctx.fillStyle = '#e3d6b4';
    ctx.fillRect(110, 160, canvas.width - 220, canvas.height - 320);

    ctx.strokeStyle = '#2b1b11';
    ctx.lineWidth = 4;
    ctx.strokeRect(120, 170, canvas.width - 240, canvas.height - 340);

    ctx.strokeStyle = '#c5a059';
    ctx.lineWidth = 2;
    ctx.strokeRect(126, 176, canvas.width - 252, canvas.height - 352);

    // 4. Header & Emblem (large, high-contrast so it reads at desk distance on a phone)
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1c140d';
    ctx.font = 'bold 84px serif';
    ctx.fillText('\u2696', canvas.width / 2, 275);

    ctx.font = '800 56px "Cairo", sans-serif';
    ctx.fillStyle = '#2b170a';
    ctx.fillText('THE COURT', canvas.width / 2, 350);

    ctx.font = '800 44px "Cairo", sans-serif';
    ctx.fillStyle = '#7c2d05';
    ctx.fillText(coverInfo.fileNumber.toUpperCase(), canvas.width / 2, 410);

    ctx.strokeStyle = '#7c2d05';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 260, 440);
    ctx.lineTo(canvas.width / 2 + 260, 440);
    ctx.stroke();

    // 5. Case Details in Arabic (large type)
    ctx.fillStyle = '#120b05';
    ctx.font = '700 104px "Amiri", "Cairo", serif';
    ctx.fillText(coverInfo.caseTitle, canvas.width / 2, 600);

    ctx.fillStyle = '#3b1503';
    ctx.font = '700 58px "Cairo", "Amiri", sans-serif';
    ctx.fillText(coverInfo.caseType, canvas.width / 2, 690);

    ctx.font = '700 50px "Cairo", "Amiri", sans-serif';
    ctx.fillStyle = '#1c120a';
    ctx.textAlign = 'center';
    ctx.fillText('محكمة العدل العليا', canvas.width / 2, 790);
    ctx.fillText('تاريخ الجلسة: ' + coverInfo.date, canvas.width / 2, 860);

    // 6. Red Official Stamp
    ctx.save();
    ctx.translate(canvas.width / 2, 1010);
    ctx.rotate((-6 * Math.PI) / 180);
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 8;
    ctx.strokeRect(-300, -62, 600, 124);
    ctx.fillStyle = '#991b1b';
    ctx.font = '800 72px "Cairo", "Amiri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(coverInfo.classification || 'سري للغاية', 0, 24);
    ctx.restore();

    // 7. Footer
    ctx.fillStyle = '#5a2504';
    ctx.font = '800 30px "Cairo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JUDICIAL SYSTEM ARCHIVE', canvas.width / 2, canvas.height - 215);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function getEvidencePaperTexture(count: number): THREE.CanvasTexture {
  const cacheKey = `evidence_cover_${count}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1050;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep warm burgundy cardstock
    ctx.fillStyle = '#261712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Plaque
    ctx.fillStyle = '#f7f1e3';
    ctx.fillRect(80, 90, canvas.width - 160, canvas.height - 180);
    ctx.strokeStyle = '#5a2e16';
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 100, canvas.width - 180, canvas.height - 200);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1c120c';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('THE COURT • EVIDENCE DOSSIER', canvas.width / 2, 170);

    ctx.fillStyle = '#831843';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('الأدلة', canvas.width / 2, 245);

    ctx.fillStyle = '#3f2214';
    ctx.font = '22px sans-serif';
    ctx.fillText('الأحراز والمضبوطات الجنائية', canvas.width / 2, 295);

    ctx.strokeStyle = '#831843';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 120, 325);
    ctx.lineTo(canvas.width / 2 + 120, 325);
    ctx.stroke();

    // Summary text
    ctx.fillStyle = '#1f1610';
    ctx.font = '20px sans-serif';
    ctx.fillText(`إجمالي الأحراز المعتمدة: ${count} أحراز`, canvas.width / 2, 400);
    ctx.fillText('فحص المعمل الجنائي الرقمي والبيولوجي', canvas.width / 2, 445);

    // Red Seal
    ctx.save();
    ctx.translate(canvas.width / 2, 650);
    ctx.rotate((-5 * Math.PI) / 180);
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3;
    ctx.strokeRect(-140, -35, 280, 70);
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('حرز رسمي مقفل', 0, 10);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function getCharactersPaperTexture(count: number): THREE.CanvasTexture {
  const cacheKey = `characters_cover_${count}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1050;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep slate/hunter green-brown cardstock
    ctx.fillStyle = '#18241d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Plaque
    ctx.fillStyle = '#f4f4ee';
    ctx.fillRect(80, 90, canvas.width - 160, canvas.height - 180);
    ctx.strokeStyle = '#143828';
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 100, canvas.width - 180, canvas.height - 200);

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f1a14';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('THE COURT • PERSONS OF INTEREST', canvas.width / 2, 170);

    ctx.fillStyle = '#14532d';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('الشخصيات', canvas.width / 2, 245);

    ctx.fillStyle = '#263a2f';
    ctx.font = '22px sans-serif';
    ctx.fillText('سجل المشتبه بهم والشهود وأطراف الدعوى', canvas.width / 2, 295);

    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 120, 325);
    ctx.lineTo(canvas.width / 2 + 120, 325);
    ctx.stroke();

    // Summary text
    ctx.fillStyle = '#15241c';
    ctx.font = '20px sans-serif';
    ctx.fillText(`إجمالي الأطراف المسجلة: ${count} أطراف`, canvas.width / 2, 400);
    ctx.fillText('إفادات الشهود وأقوال المتهمين الموثقة', canvas.width / 2, 445);

    // Stamp
    ctx.save();
    ctx.translate(canvas.width / 2, 650);
    ctx.rotate((4 * Math.PI) / 180);
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 3;
    ctx.strokeRect(-140, -35, 280, 70);
    ctx.fillStyle = '#166534';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('سجل شخصيات معتمد', 0, 10);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function getNotesPaperTexture(): THREE.CanvasTexture {
  const cacheKey = 'notes_cover_texture';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 950;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Warm vintage legal notepad
    ctx.fillStyle = '#faf6ed';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red left margin line
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 0);
    ctx.lineTo(80, canvas.height);
    ctx.stroke();

    // Horizontal ruling lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    for (let y = 140; y < canvas.height - 40; y += 38) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(canvas.width - 30, y);
      ctx.stroke();
    }

    // Header
    ctx.textAlign = 'center';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('محكمة العدل العليا — مفكرة القاضي', canvas.width / 2, 70);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('ملاحظات القضية', canvas.width / 2, 115);

    // Simulated handwriting notes
    ctx.font = 'italic 18px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'right';
    ctx.fillText('• مراجعة استنساخ بطاقة الدخول الممغنطة..', canvas.width - 50, 205);
    ctx.fillText('• التحقق من وجود فني الصيانة منذر وهبة..', canvas.width - 50, 281);
    ctx.fillText('• مطابقة أقوال المتهم مع تقارير البصمات..', canvas.width - 50, 357);

    // Faint Judicial watermark seal
    ctx.save();
    ctx.translate(canvas.width / 2, 600);
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE COURT', 0, 8);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  textureCache.set(cacheKey, texture);
  return texture;
}

