/**
 * Converts OKLCH color values to RGBA
 * @param l Lightness (0-1)
 * @param c Chroma (0-0.4, approximately)
 * @param h Hue (0-360 degrees)
 * @param a Alpha (0-1, optional, defaults to 1)
 * @returns RGBA object with r, g, b values (0-255) and a value (0-1)
 */
export function oklchToRgba(
  l: number,
  c: number,
  h: number,
  a: number = 1,
): { r: number; g: number; b: number; a: number } {
  // Step 1: OKLCH to OKLab
  const { L, a: aLab, b } = oklchToOklab(l, c, h)

  // Step 2: OKLab to XYZ (Linear RGB)
  const { x, y, z } = oklabToXyz(L, aLab, b)

  // Step 3: XYZ to sRGB
  const { r, g, b: bRgb } = xyzToSrgb(x, y, z)

  return {
    r: Math.round(clamp(r, 0, 1) * 255),
    g: Math.round(clamp(g, 0, 1) * 255),
    b: Math.round(clamp(bRgb, 0, 1) * 255),
    a: clamp(a, 0, 1),
  }
}

/**
 * Converts OKLCH to RGBA string format
 * @param l Lightness (0-1)
 * @param c Chroma (0-0.4, approximately)
 * @param h Hue (0-360 degrees)
 * @param a Alpha (0-1, optional, defaults to 1)
 * @returns RGBA string in format "rgba(r, g, b, a)"
 */
export function oklchToRgbaString(
  l: number,
  c: number,
  h: number,
  a: number = 1,
): string {
  const { r, g, b, a: alpha } = oklchToRgba(l, c, h, a)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Parses OKLCH CSS string and converts to RGBA
 * @param oklchString OKLCH string in format "oklch(l c h)" or "oklch(l c h / a)"
 * @returns RGBA object or null if invalid format
 */
export function parseOklchToRgba(
  oklchString: string,
): { r: number; g: number; b: number; a: number } | null {
  // Remove "oklch(" and ")" and split by spaces and /
  const match = oklchString.match(/oklch\(([^)]+)\)/)
  if (!match) return null

  const values = match[1]
    .split(/\s+|\//)
    .map((v) => v.trim())
    .filter(Boolean)
  if (values.length < 3) return null

  const l = parseFloat(values[0])
  const c = parseFloat(values[1])
  const h = parseFloat(values[2])
  const a = values[3] ? parseFloat(values[3]) : 1

  if (isNaN(l) || isNaN(c) || isNaN(h)) return null

  return oklchToRgba(l, c, h, a)
}

// Helper functions for color space conversions

function oklchToOklab(
  l: number,
  c: number,
  h: number,
): { L: number; a: number; b: number } {
  const hRad = (h * Math.PI) / 180
  return {
    L: l,
    a: c * Math.cos(hRad),
    b: c * Math.sin(hRad),
  }
}

function oklabToXyz(
  L: number,
  a: number,
  b: number,
): { x: number; y: number; z: number } {
  const l = L + 0.3963377774 * a + 0.2158037573 * b
  const m = L - 0.1055613458 * a - 0.0638541728 * b
  const s = L - 0.0894841775 * a - 1.291485548 * b

  const l3 = l * l * l
  const m3 = m * m * m
  const s3 = s * s * s

  return {
    x: 1.2268798733 * l3 - 0.5578149965 * m3 + 0.2813910456 * s3,
    y: -0.0405757452 * l3 + 1.1122868293 * m3 - 0.0717110741 * s3,
    z: -0.0763812845 * l3 - 0.4214819784 * m3 + 0.9421031212 * s3,
  }
}

function xyzToSrgb(
  x: number,
  y: number,
  z: number,
): { r: number; g: number; b: number } {
  // XYZ to Linear RGB transformation matrix (sRGB/D65)
  let r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z
  let g = -0.969266 * x + 1.8760108 * y + 0.041556 * z
  let b = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z

  // Apply gamma correction (Linear RGB to sRGB)
  r = linearToGamma(r)
  g = linearToGamma(g)
  b = linearToGamma(b)

  return { r, g, b }
}

function linearToGamma(c: number): number {
  if (c <= 0.0031308) {
    return 12.92 * c
  } else {
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
