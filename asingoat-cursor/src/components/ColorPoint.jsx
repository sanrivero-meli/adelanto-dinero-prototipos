import { useState, useRef, useEffect } from 'react';
import LiquidGlassColorPicker from './LiquidGlassColorPicker';

export default function ColorPoint({ point, isSelected, index, onDrag, onColorChange, onRemove, onColorPickerToggle, activeColorPickerIndex, canvasWidth, canvasHeight, displayWidth, displayHeight }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pointRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  
  // Determine if color picker should be open based on parent state
  const showColorPicker = activeColorPickerIndex === index;

  // Scale point position to display dimensions
  const scaleX = displayWidth / canvasWidth;
  const scaleY = displayHeight / canvasHeight;
  const displayX = point.x * scaleX;
  const displayY = point.y * scaleY;

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (!pointRef.current) return;
      
      // Check if mouse has moved significantly (more than 5px) to consider it a drag
      const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        hasDraggedRef.current = true;
      }
      
      const container = pointRef.current.parentElement;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Scale back to canvas dimensions using actual container size
      const containerWidth = rect.width;
      const containerHeight = rect.height;
      const scaledX = (x / containerWidth) * canvasWidth;
      const scaledY = (y / containerHeight) * canvasHeight;
      
      // Clamp to canvas bounds
      const clampedX = Math.max(0, Math.min(canvasWidth, scaledX));
      const clampedY = Math.max(0, Math.min(canvasHeight, scaledY));
      
      onDrag(clampedX, clampedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Reset drag flag after a short delay to allow click handler to check it
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag, canvasWidth, canvasHeight, displayWidth, displayHeight]);

  const handleMouseDown = (e) => {
    // Don't start dragging if color picker is open
    if (showColorPicker) {
      return;
    }
    e.stopPropagation();
    // Reset drag tracking
    hasDraggedRef.current = false;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  const handleColorChange = (newColor) => {
    onColorChange(newColor);
  };

  const handleColorClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Only open if we're not currently dragging
    if (!isDragging && onColorPickerToggle) {
      onColorPickerToggle(true);
    }
  };

  const handleCloseColorPicker = () => {
    if (onColorPickerToggle) {
      onColorPickerToggle(false);
    }
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const colorHex = rgbToHex(point.r, point.g, point.b);

  // Calculate complementary border colors
  const borderColor = `rgba(${point.r}, ${point.g}, ${point.b}, 0.7)`;
  const borderColorLight = `rgba(${Math.min(255, point.r + 60)}, ${Math.min(255, point.g + 60)}, ${Math.min(255, point.b + 60)}, 0.9)`;
  const borderColorDark = `rgba(${Math.max(0, point.r - 30)}, ${Math.max(0, point.g - 30)}, ${Math.max(0, point.b - 30)}, 0.5)`;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(200%) translateY(200%) rotate(45deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.08);
          }
        }

        @keyframes borderGlow {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
      <div
        ref={pointRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          left: `${displayX}px`,
          top: `${displayY}px`,
          transform: `translate(-50%, -50%) ${isHovered && !isDragging ? 'scale(1.15)' : 'scale(1)'}`,
          width: 'var(--space-600)',
          height: 'var(--space-600)',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 10,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.4)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
          willChange: isDragging ? 'transform' : 'auto',
          borderRadius: 'var(--border-radius-full)',
          padding: '2px',
          background: `linear-gradient(135deg, ${borderColorLight}, ${borderColor}, ${borderColorDark}, ${borderColor})`,
          backgroundSize: '200% 200%',
          animation: isHovered ? 'borderGlow 2s ease-in-out infinite' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        {/* Inner container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 'inherit',
            overflow: 'hidden',
            backdropFilter: 'blur(30px) saturate(200%)',
            WebkitBackdropFilter: 'blur(30px) saturate(200%)',
          }}
        >
          {/* Base color layer with transparency */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: colorHex,
              opacity: 0.85,
              borderRadius: 'inherit',
            }}
          />

          {/* Glass reflection layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, 
                rgba(255, 255, 255, 0.5) 0%, 
                rgba(255, 255, 255, 0.15) 25%,
                transparent 45%,
                rgba(0, 0, 0, 0.15) 70%,
                rgba(0, 0, 0, 0.25) 100%
              )`,
              borderRadius: 'inherit',
              mixBlendMode: 'overlay',
              pointerEvents: 'none'
            }}
          />

          {/* Animated shimmer effect */}
          <div
            style={{
              position: 'absolute',
              inset: '-100%',
              background: `linear-gradient(45deg, 
                transparent 25%, 
                rgba(255, 255, 255, 0.6) 45%,
                rgba(255, 255, 255, 0.8) 50%,
                rgba(255, 255, 255, 0.6) 55%,
                transparent 75%
              )`,
              borderRadius: 'inherit',
              animation: 'shimmer 4s ease-in-out infinite',
              pointerEvents: 'none',
              opacity: isHovered ? 0.09 : 0.05
            }}
          />

          {/* Pulsing inner glow */}
          <div
            style={{
              position: 'absolute',
              inset: '15%',
              background: `radial-gradient(circle, 
                rgba(255, 255, 255, 0.4) 0%, 
                rgba(255, 255, 255, 0.1) 40%,
                transparent 70%
              )`,
              borderRadius: 'inherit',
              animation: 'pulse 2.5s ease-in-out infinite',
              pointerEvents: 'none',
              mixBlendMode: 'screen'
            }}
          />

          {/* Color-adaptive inner border glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              boxShadow: `
                inset 0 0 15px ${borderColorLight}40,
                inset 0 0 30px ${borderColor}30,
                0 0 25px ${borderColor}60,
                0 0 50px ${borderColor}40
              `,
              pointerEvents: 'none',
              transition: 'all 0.3s ease'
            }}
          />

          {/* Clickable area for color picker */}
          <div
            data-color-area
            onClick={(e) => {
              // Only open color picker if we didn't drag
              if (!hasDraggedRef.current && !isDragging) {
                handleColorClick(e);
              }
            }}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 1,
              pointerEvents: 'auto'
            }}
          />
        </div>
      </div>

      {/* Custom liquid glass color picker */}
      {showColorPicker && (
        <LiquidGlassColorPicker
          color={colorHex}
          onChange={handleColorChange}
          onClose={handleCloseColorPicker}
        />
      )}
    </>
  );
}
