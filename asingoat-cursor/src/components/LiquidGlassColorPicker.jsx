import { useState, useRef, useEffect, useCallback } from 'react';

export default function LiquidGlassColorPicker({ color, onChange, onClose }) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingSaturation, setIsDraggingSaturation] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pickerRef = useRef(null);
  const hueRef = useRef(null);
  const saturationRef = useRef(null);

  // Convert hex to HSL
  const hexToHsl = useCallback((hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }, []);

  // Convert HSL to hex
  const hslToHex = useCallback((h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("")}`;
  }, []);

  // Initialize from color prop (only once on mount or when color changes externally)
  useEffect(() => {
    if (color && !isInitialized) {
      const hsl = hexToHsl(color);
      setHue(hsl.h);
      setSaturation(hsl.s);
      setLightness(hsl.l);
      setIsInitialized(true);
    }
  }, [color, hexToHsl, isInitialized]);

  // Update color when HSL changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      const newColor = hslToHex(hue, saturation, lightness);
      onChange(newColor);
    }
  }, [hue, saturation, lightness, hslToHex, onChange, isInitialized]);

  // Handle hue slider
  const handleHueMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHue(true);
    updateHue(e);
  }, []);

  const updateHue = useCallback((e) => {
    if (!hueRef.current) return;
    const rect = hueRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newHue = Math.max(0, Math.min(360, (x / rect.width) * 360));
    setHue(newHue);
  }, []);

  // Handle saturation/lightness picker
  const handleSaturationMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSaturation(true);
    updateSaturation(e);
  }, []);

  const updateSaturation = useCallback((e) => {
    if (!saturationRef.current) return;
    const rect = saturationRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newSaturation = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newLightness = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    setSaturation(newSaturation);
    setLightness(newLightness);
  }, []);

  // Mouse move/up handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      e.preventDefault();
      if (isDraggingHue) {
        updateHue(e);
      }
      if (isDraggingSaturation) {
        updateSaturation(e);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHue(false);
      setIsDraggingSaturation(false);
    };

    if (isDraggingHue || isDraggingSaturation) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingHue, isDraggingSaturation, updateHue, updateSaturation]);

  // Close on outside click (using click instead of mousedown to avoid conflicts)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Use a small delay to avoid immediate closing when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const hueGradient = `linear-gradient(to right, 
    hsl(0, 100%, 50%), 
    hsl(60, 100%, 50%), 
    hsl(120, 100%, 50%), 
    hsl(180, 100%, 50%), 
    hsl(240, 100%, 50%), 
    hsl(300, 100%, 50%), 
    hsl(360, 100%, 50%)
  )`;

  const saturationGradient = `linear-gradient(to bottom, 
    transparent, 
    hsl(${hue}, 100%, ${lightness}%)
  ), linear-gradient(to right, 
    white, 
    transparent
  )`;

  return (
    <>
      <style>{`
        @keyframes glassShimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }
      `}</style>
      <div
        ref={pickerRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '260px',
          padding: 'var(--space-400)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderRadius: 'var(--border-radius-500)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `
            0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset,
            0 8px 32px rgba(0, 0, 0, 0.2)
          `,
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-400)',
          fontFamily: 'inherit'
        }}
      >
        {/* Shimmer overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(45deg, 
              transparent 30%, 
              rgba(255, 255, 255, 0.1) 50%, 
              transparent 70%
            )`,
            borderRadius: 'inherit',
            animation: 'glassShimmer 4s ease-in-out infinite',
            pointerEvents: 'none',
            opacity: 0.3
          }}
        />

        {/* Saturation/Lightness picker */}
        <div
          ref={saturationRef}
          onMouseDown={handleSaturationMouseDown}
          style={{
            position: 'relative',
            width: '100%',
            height: '160px',
            borderRadius: 'var(--border-radius-300)',
            background: saturationGradient,
            cursor: 'crosshair',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
            userSelect: 'none'
          }}
        >
          {/* Glass reflection */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.3) 0%, 
                transparent 50%,
                rgba(0, 0, 0, 0.1) 100%
              )`,
              borderRadius: 'inherit',
              pointerEvents: 'none'
            }}
          />
          {/* Handle */}
          <div
            style={{
              position: 'absolute',
              left: `${saturation}%`,
              top: `${100 - lightness}%`,
              transform: 'translate(-50%, -50%)',
              width: '16px',
              height: '16px',
              borderRadius: 'var(--border-radius-full)',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'none',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.3)'
            }}
          />
        </div>

        {/* Hue slider */}
        <div
          ref={hueRef}
          onMouseDown={handleHueMouseDown}
          style={{
            position: 'relative',
            width: '100%',
            height: '20px',
            borderRadius: 'var(--border-radius-full)',
            background: hueGradient,
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            userSelect: 'none'
          }}
        >
          {/* Glass overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.2) 0%, 
                transparent 50%,
                rgba(0, 0, 0, 0.1) 100%
              )`,
              borderRadius: 'inherit',
              pointerEvents: 'none'
            }}
          />
          {/* Handle */}
          <div
            style={{
              position: 'absolute',
              left: `${(hue / 360) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '16px',
              height: '16px',
              borderRadius: 'var(--border-radius-full)',
              border: '2px solid white',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'none',
              backgroundColor: `hsl(${hue}, 100%, 50%)`,
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          />
        </div>

      </div>
    </>
  );
}
