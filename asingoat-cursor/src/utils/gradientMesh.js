/**
 * Calculate color at a point using inverse distance weighting
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} points - Array of color points {x, y, r, g, b}
 * @param {number} power - Power factor for distance weighting (default: 2)
 * @returns {Object} RGB color {r, g, b}
 */
export function calculateColorAtPoint(x, y, points, power = 2) {
  if (points.length === 0) {
    return { r: 255, g: 255, b: 255 };
  }

  let totalWeight = 0;
  let r = 0, g = 0, b = 0;

  for (const point of points) {
    const dx = x - point.x;
    const dy = y - point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Avoid division by zero
    const weight = distance < 0.001 ? 1000000 : 1 / Math.pow(distance, power);
    
    totalWeight += weight;
    r += point.r * weight;
    g += point.g * weight;
    b += point.b * weight;
  }

  // Normalize
  if (totalWeight > 0) {
    r = Math.round(r / totalWeight);
    g = Math.round(g / totalWeight);
    b = Math.round(b / totalWeight);
  }

  return { r, g, b };
}

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color string (e.g., "#ff0000")
 * @returns {Object} RGB color {r, g, b}
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

