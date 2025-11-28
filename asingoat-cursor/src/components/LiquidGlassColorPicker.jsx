import { useState, useRef, useEffect, useCallback } from 'react';

export default function LiquidGlassColorPicker({ color, onChange, onClose }) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingSaturation, setIsDraggingSaturation] = useState(false);
  const [isDraggingPicker, setIsDraggingPicker] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [position, setPosition] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const pickerRef = useRef(null);
  const hueRef = useRef(null);
  const saturationRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleHueTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHue(true);
    const touch = e.touches[0];
    if (touch) {
      updateHue({ clientX: touch.clientX, clientY: touch.clientY });
    }
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

  const handleSaturationTouchStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSaturation(true);
    const touch = e.touches[0];
    if (touch) {
      updateSaturation({ clientX: touch.clientX, clientY: touch.clientY });
    }
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

  // Handle picker container dragging
  const handlePickerMouseDown = useCallback((e) => {
    // Don't start dragging if clicking on color controls
    if (e.target.closest('[data-color-control]')) {
      return;
    }
    setIsDraggingPicker(true);
    const currentX = position?.x ?? window.innerWidth / 2;
    const currentY = position?.y ?? window.innerHeight / 2;
    dragStartPos.current = {
      x: e.clientX - currentX,
      y: e.clientY - currentY
    };
  }, [position]);

  const handlePickerTouchStart = useCallback((e) => {
    // Don't start dragging if touching color controls
    if (e.target.closest('[data-color-control]')) {
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    setIsDraggingPicker(true);
    const currentX = position?.x ?? window.innerWidth / 2;
    const currentY = position?.y ?? window.innerHeight / 2;
    dragStartPos.current = {
      x: touch.clientX - currentX,
      y: touch.clientY - currentY
    };
  }, [position]);

  // Mouse move/up handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      e.preventDefault();
      if (isDraggingPicker) {
        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;
        setPosition({ x: newX, y: newY });
      } else if (isDraggingHue) {
        updateHue(e);
      } else if (isDraggingSaturation) {
        updateSaturation(e);
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      
      if (isDraggingPicker) {
        const newX = touch.clientX - dragStartPos.current.x;
        const newY = touch.clientY - dragStartPos.current.y;
        setPosition({ x: newX, y: newY });
      } else if (isDraggingHue) {
        updateHue({ clientX: touch.clientX, clientY: touch.clientY });
      } else if (isDraggingSaturation) {
        updateSaturation({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingHue(false);
      setIsDraggingSaturation(false);
      setIsDraggingPicker(false);
    };

    const handleTouchEnd = () => {
      setIsDraggingHue(false);
      setIsDraggingSaturation(false);
      setIsDraggingPicker(false);
    };

    if (isDraggingHue || isDraggingSaturation || isDraggingPicker) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingHue, isDraggingSaturation, isDraggingPicker, updateHue, updateSaturation]);

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
        onMouseDown={handlePickerMouseDown}
        onTouchStart={handlePickerTouchStart}
        style={{
          position: 'fixed',
          top: position ? `${position.y}px` : (isMobile ? '50%' : '50%'),
          left: position ? `${position.x}px` : (isMobile ? '50%' : '50%'),
          transform: 'translate(-50%, -50%)',
          width: isMobile ? 'min(90vw, 280px)' : '260px',
          padding: isMobile ? 'var(--space-300)' : 'var(--space-400)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
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
          fontFamily: 'inherit',
          cursor: isDraggingPicker ? 'grabbing' : 'grab'
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
          data-color-control
          onMouseDown={handleSaturationMouseDown}
          onTouchStart={handleSaturationTouchStart}
          style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? '140px' : '160px',
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
          data-color-control
          onMouseDown={handleHueMouseDown}
          onTouchStart={handleHueTouchStart}
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
