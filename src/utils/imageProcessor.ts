import { StudioSettings } from '../types';

export interface ProcessedResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  maskCanvas: HTMLCanvasElement;
}

// Helper: load image safely from data URL or blob
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = src;
  });
}

// Compute Euclidean color distance in RGB space
function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  // Weighted distance for human eye perception
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
}

// Generate the foreground mask using edge-floodfill segmentation
export function generateForegroundMask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tolerance: number,
  featherRadius: number
): Uint8ClampedArray {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  // 1. Sample background colors from corners and border perimeter
  const samplePoints = [
    { x: 2, y: 2 },
    { x: width - 3, y: 2 },
    { x: 2, y: height - 3 },
    { x: width - 3, y: height - 3 },
    { x: Math.floor(width / 2), y: 2 },
    { x: 2, y: Math.floor(height / 2) },
    { x: width - 3, y: Math.floor(height / 2) },
    { x: Math.floor(width / 2), y: height - 3 },
  ];

  const bgColors: { r: number; g: number; b: number }[] = [];
  for (const pt of samplePoints) {
    const idx = (pt.y * width + pt.x) * 4;
    bgColors.push({
      r: data[idx],
      g: data[idx + 1],
      b: data[idx + 2],
    });
  }

  // Alpha mask array: 255 = keep (foreground), 0 = remove (background)
  const mask = new Uint8ClampedArray(totalPixels);
  mask.fill(255); // Start by keeping everything

  // Visited array for BFS flood fill from borders
  const visited = new Uint8Array(totalPixels);
  const queue: number[] = [];

  // Initialize BFS queue with border pixels
  for (let x = 0; x < width; x++) {
    queue.push(x); // top row
    queue.push((height - 1) * width + x); // bottom row
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(y * width); // left col
    queue.push(y * width + (width - 1)); // right col
  }

  const effectiveTolerance = Math.max(12, tolerance);

  // Helper: check if a pixel matches any background sample
  function isBgPixel(idx: number): boolean {
    const px = idx * 4;
    const r = data[px];
    const g = data[px + 1];
    const b = data[px + 2];

    for (let i = 0; i < bgColors.length; i++) {
      const d = colorDistance(r, g, b, bgColors[i].r, bgColors[i].g, bgColors[i].b);
      if (d <= effectiveTolerance) {
        return true;
      }
    }
    return false;
  }

  // Process flood fill
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    if (visited[cur]) continue;
    visited[cur] = 1;

    if (isBgPixel(cur)) {
      mask[cur] = 0; // mark as background

      const cx = cur % width;
      const cy = Math.floor(cur / width);

      // Check 4-connected neighbors
      if (cx > 0) {
        const left = cur - 1;
        if (!visited[left]) queue.push(left);
      }
      if (cx < width - 1) {
        const right = cur + 1;
        if (!visited[right]) queue.push(right);
      }
      if (cy > 0) {
        const top = cur - width;
        if (!visited[top]) queue.push(top);
      }
      if (cy < height - 1) {
        const bottom = cur + width;
        if (!visited[bottom]) queue.push(bottom);
      }
    }
  }

  // Feathering: smooth edge transition (anti-aliasing)
  if (featherRadius > 0.5) {
    const feathered = new Uint8ClampedArray(totalPixels);
    feathered.set(mask);
    const radius = Math.min(4, Math.round(featherRadius));

    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        const curIdx = y * width + x;
        // Only feather near boundaries
        let isBoundary = false;
        const curVal = mask[curIdx];
        if (
          mask[curIdx - 1] !== curVal ||
          mask[curIdx + 1] !== curVal ||
          mask[curIdx - width] !== curVal ||
          mask[curIdx + width] !== curVal
        ) {
          isBoundary = true;
        }

        if (isBoundary) {
          let sum = 0;
          let count = 0;
          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              sum += mask[(y + dy) * width + (x + dx)];
              count++;
            }
          }
          feathered[curIdx] = Math.round(sum / count);
        }
      }
    }
    return feathered;
  }

  return mask;
}

// Find bounding box of masked foreground product
export function findProductBounds(
  mask: Uint8ClampedArray,
  width: number,
  height: number
): { x: number; y: number; w: number; h: number } {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] > 30) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) {
    return { x: 0, y: 0, w: width, h: height };
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  };
}

// Apply color adjustments, glare cleanup & sharpness to foreground pixels
function applyProductEnhancements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: StudioSettings
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const bMult = settings.brightness;
  const cMult = settings.contrast;
  const sMult = settings.saturation;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue; // skip transparent

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r = r * bMult;
    g = g * bMult;
    b = b * bMult;

    // Contrast
    r = (r - 128) * cMult + 128;
    g = (g - 128) * cMult + 128;
    b = (b - 128) * cMult + 128;

    // Saturation
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * sMult;
    g = gray + (g - gray) * sMult;
    b = gray + (b - gray) * sMult;

    // Glare cleanup: compress blown-out highlights (> 245) softly towards natural texture
    if (settings.cleanGlare) {
      if (r > 240 && g > 240 && b > 240) {
        const factor = 0.94;
        r = r * factor;
        g = g * factor;
        b = b * factor;
      }
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Unsharp-mask sharpness if requested
  if (settings.sharpness > 0.1) {
    // Canvas convolution for edge crispness
    const sharpData = ctx.getImageData(0, 0, width, height);
    const src = sharpData.data;
    const amount = settings.sharpness * 0.4;
    const output = ctx.createImageData(width, height);
    const dst = output.data;

    // Copy alpha
    for (let i = 0; i < src.length; i += 4) {
      dst[i + 3] = src[i + 3];
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        if (src[idx + 3] === 0) continue;

        for (let c = 0; c < 3; c++) {
          const val =
            src[idx + c] * (1 + 4 * amount) -
            (src[((y - 1) * width + x) * 4 + c] +
              src[((y + 1) * width + x) * 4 + c] +
              src[(y * width + (x - 1)) * 4 + c] +
              src[(y * width + (x + 1)) * 4 + c]) *
              amount;
          dst[idx + c] = Math.min(255, Math.max(0, val));
        }
      }
    }
    ctx.putImageData(output, 0, 0);
  }
}

// Render studio backdrop
function renderBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: StudioSettings
) {
  const type = settings.backgroundType;

  if (type === 'transparent') {
    // Pure transparent, no fill
    return;
  }

  if (type === 'studio_white') {
    // E-commerce standard pure white with faint radial vignette
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.2,
      width / 2,
      height / 2,
      width * 0.85
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (type === 'slate_dark') {
    // Luxury dark slate with overhead spotlight
    const grad = ctx.createRadialGradient(
      width / 2,
      height * 0.35,
      width * 0.1,
      width / 2,
      height * 0.5,
      width * 0.8
    );
    grad.addColorStop(0, '#27272a');
    grad.addColorStop(0.5, '#18181b');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (type === 'aesthetic_sand') {
    // Warm beige aesthetic backdrop with soft light
    const grad = ctx.createRadialGradient(
      width * 0.45,
      height * 0.35,
      width * 0.15,
      width / 2,
      height / 2,
      width * 0.75
    );
    grad.addColorStop(0, '#fffbf5');
    grad.addColorStop(0.6, '#f5efe6');
    grad.addColorStop(1, '#e8dfd1');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (type === 'solid') {
    ctx.fillStyle = settings.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (type === 'gradient') {
    const gConfig = settings.gradient;
    if (gConfig.type === 'radial') {
      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.4,
        width * 0.05,
        width / 2,
        height / 2,
        width * 0.75
      );
      grad.addColorStop(0, gConfig.from);
      grad.addColorStop(1, gConfig.to);
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, gConfig.from);
      grad.addColorStop(1, gConfig.to);
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (type === 'podium') {
    // Clean studio background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

// Render realistic shadows or podium
function renderStudioShadow(
  ctx: CanvasRenderingContext2D,
  fgCanvas: HTMLCanvasElement,
  bounds: { x: number; y: number; w: number; h: number },
  width: number,
  height: number,
  settings: StudioSettings
) {
  const type = settings.shadowType;
  if (type === 'none') return;

  const opacity = settings.shadowOpacity;
  const blur = settings.shadowBlur;
  const offsetY = settings.shadowOffsetY;

  if (type === 'contact') {
    // Realistic soft contact shadow (elliptical gradient underneath the product's base)
    ctx.save();
    const shadowY = bounds.y + bounds.h + offsetY * 0.3;
    const shadowX = bounds.x + bounds.w / 2;
    const rx = bounds.w * 0.45;
    const ry = Math.max(8, bounds.h * 0.08);

    const grad = ctx.createRadialGradient(
      shadowX,
      shadowY,
      2,
      shadowX,
      shadowY,
      rx
    );
    grad.addColorStop(0, `rgba(15, 23, 42, ${opacity * 0.85})`);
    grad.addColorStop(0.4, `rgba(30, 41, 59, ${opacity * 0.45})`);
    grad.addColorStop(0.8, `rgba(51, 65, 85, ${opacity * 0.15})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(shadowX, shadowY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  if (type === 'drop') {
    // Alpha mask projection drop shadow
    ctx.save();
    ctx.shadowColor = `rgba(15, 23, 42, ${opacity})`;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = offsetY;
    // Draw silhouette of product to cast shadow
    ctx.drawImage(fgCanvas, 0, 0);
    ctx.restore();
    return;
  }

  if (type === 'reflection') {
    // High-end glossy studio floor reflection
    ctx.save();
    const reflectCanvas = document.createElement('canvas');
    reflectCanvas.width = width;
    reflectCanvas.height = height;
    const rCtx = reflectCanvas.getContext('2d')!;

    // Flip vertically
    rCtx.translate(0, height);
    rCtx.scale(1, -1);
    rCtx.drawImage(fgCanvas, 0, 0);

    // Fade reflection with gradient mask
    rCtx.globalCompositeOperation = 'destination-in';
    const bottomY = bounds.y + bounds.h;
    const grad = rCtx.createLinearGradient(0, height - bottomY, 0, height - bottomY + bounds.h * 0.4);
    grad.addColorStop(0, `rgba(0, 0, 0, ${opacity * 0.6})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    rCtx.fillStyle = grad;
    rCtx.fillRect(0, 0, width, height);

    ctx.drawImage(reflectCanvas, 0, (bounds.y + bounds.h) * 2 - height + offsetY);
    ctx.restore();
    return;
  }

  if (type === 'pedestal' || settings.backgroundType === 'podium') {
    // 3D luxury cylinder podium
    ctx.save();
    const podiumX = width / 2;
    const podiumY = bounds.y + bounds.h + 20;
    const rx = bounds.w * 0.65;
    const ry = 30;
    const podiumHeight = 70;

    // Floor shadow under podium
    const floorGrad = ctx.createRadialGradient(
      podiumX,
      podiumY + podiumHeight,
      10,
      podiumX,
      podiumY + podiumHeight,
      rx * 1.2
    );
    floorGrad.addColorStop(0, 'rgba(0,0,0,0.5)');
    floorGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.ellipse(podiumX, podiumY + podiumHeight, rx * 1.2, ry * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cylinder Body
    const cylGrad = ctx.createLinearGradient(podiumX - rx, 0, podiumX + rx, 0);
    cylGrad.addColorStop(0, '#334155');
    cylGrad.addColorStop(0.3, '#64748b');
    cylGrad.addColorStop(0.7, '#475569');
    cylGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = cylGrad;
    ctx.fillRect(podiumX - rx, podiumY, rx * 2, podiumHeight);

    // Cylinder Bottom Ellipse
    ctx.beginPath();
    ctx.ellipse(podiumX, podiumY + podiumHeight, rx, ry, 0, 0, Math.PI);
    ctx.fill();

    // Top Platform Ellipse with marble/sheen
    const topGrad = ctx.createRadialGradient(
      podiumX,
      podiumY - 5,
      5,
      podiumX,
      podiumY,
      rx
    );
    topGrad.addColorStop(0, '#f1f5f9');
    topGrad.addColorStop(0.7, '#cbd5e1');
    topGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.ellipse(podiumX, podiumY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle contact shadow of product on podium
    const prodShadow = ctx.createRadialGradient(
      podiumX,
      podiumY,
      5,
      podiumX,
      podiumY,
      bounds.w * 0.4
    );
    prodShadow.addColorStop(0, `rgba(15,23,42,${opacity * 0.9})`);
    prodShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = prodShadow;
    ctx.beginPath();
    ctx.ellipse(podiumX, podiumY, bounds.w * 0.4, ry * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Master Pipeline: Takes input image + settings and outputs composite studio canvas
export async function processProductPhoto(
  imageSource: string | HTMLImageElement,
  settings: StudioSettings,
  manualMaskCanvas?: HTMLCanvasElement
): Promise<ProcessedResult> {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  // 1. Raw image canvas
  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = width;
  rawCanvas.height = height;
  const rawCtx = rawCanvas.getContext('2d')!;
  rawCtx.drawImage(img, 0, 0);

  // 2. Generate or reuse mask
  let maskCanvas: HTMLCanvasElement;
  let mask: Uint8ClampedArray;

  if (manualMaskCanvas && manualMaskCanvas.width === width && manualMaskCanvas.height === height) {
    maskCanvas = manualMaskCanvas;
    const mData = maskCanvas.getContext('2d')!.getImageData(0, 0, width, height).data;
    mask = new Uint8ClampedArray(width * height);
    for (let i = 0; i < mask.length; i++) {
      mask[i] = mData[i * 4 + 3];
    }
  } else {
    maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    mask = generateForegroundMask(
      rawCtx,
      width,
      height,
      settings.tolerance,
      settings.feather
    );
    const maskCtx = maskCanvas.getContext('2d')!;
    const maskImgData = maskCtx.createImageData(width, height);
    for (let i = 0; i < mask.length; i++) {
      const p = i * 4;
      const alpha = mask[i];
      maskImgData.data[p] = 255;
      maskImgData.data[p + 1] = 255;
      maskImgData.data[p + 2] = 255;
      maskImgData.data[p + 3] = alpha;
    }
    maskCtx.putImageData(maskImgData, 0, 0);
  }

  // 3. Cutout Foreground Product
  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = width;
  fgCanvas.height = height;
  const fgCtx = fgCanvas.getContext('2d')!;

  // Draw original image
  fgCtx.drawImage(rawCanvas, 0, 0);
  // Apply mask via destination-in
  fgCtx.globalCompositeOperation = 'destination-in';
  fgCtx.drawImage(maskCanvas, 0, 0);
  fgCtx.globalCompositeOperation = 'source-over';

  // Apply enhancements (brightness, contrast, saturation, sharpness, glare suppression)
  applyProductEnhancements(fgCtx, width, height, settings);

  // 4. Compute bounding box
  const bounds = findProductBounds(mask, width, height);

  // 5. Final Composite Canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d')!;

  // A. Backdrop
  renderBackdrop(outCtx, width, height, settings);

  // B. Shadow / Podium
  renderStudioShadow(outCtx, fgCanvas, bounds, width, height, settings);

  // C. Foreground Cutout Product
  outCtx.drawImage(fgCanvas, 0, 0);

  // Convert to Blob & DataURL
  const dataUrl = outCanvas.toDataURL(
    settings.backgroundType === 'transparent' ? 'image/png' : 'image/jpeg',
    0.95
  );

  return new Promise((resolve) => {
    outCanvas.toBlob(
      (blob) => {
        resolve({
          dataUrl,
          blob: blob || new Blob(),
          width,
          height,
          maskCanvas,
        });
      },
      settings.backgroundType === 'transparent' ? 'image/png' : 'image/jpeg',
      0.95
    );
  });
}
