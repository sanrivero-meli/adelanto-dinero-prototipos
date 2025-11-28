import { useState, useRef, useEffect } from 'react';
import LiquidGlassColorPicker from './LiquidGlassColorPicker';

export default function ColorPoint({ point, isSelected, index, onDrag, onColorChange, onRemove, onColorPickerToggle, activeColorPickerIndex, onSelect, canvasWidth, canvasHeight, displayWidth, displayHeight, onDragStart, onDragMove, onDragEnd }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [swipeDownProgress, setSwipeDownProgress] = useState(0);
  const pointRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const longPressTimerRef = useRef(null);
  const isMobileRef = useRef(window.innerWidth < 768);
  const swipeDownThreshold = 70; // pixels to swipe down before deleting
  const isSwipeDownRef = useRef(false);
  
  // Determine if color picker should be open based on parent state
  const showColorPicker = activeColorPickerIndex === index;

  // Scale point position to display dimensions
  const scaleX = displayWidth / canvasWidth;
  const scaleY = displayHeight / canvasHeight;
  const displayX = point.x * scaleX;
  const displayY = point.y * scaleY;

  useEffect(() => {
    if (!isDragging) return;

    const updatePosition = (clientX, clientY) => {
      if (!pointRef.current) return;
      
      const container = pointRef.current.parentElement;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
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

    const handleMouseMove = (e) => {
      // Check if mouse has moved significantly (more than 5px) to consider it a drag
      const deltaX = Math.abs(e.clientX - dragStartPosRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartPosRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        hasDraggedRef.current = true;
      }
      
      updatePosition(e.clientX, e.clientY);
      
      // Notify parent of drag position for drag-to-trash
      if (onDragMove) {
        onDragMove(index, e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      if (!touch) return;
      
      // Calculate movement deltas
      const deltaX = touch.clientX - dragStartPosRef.current.x;
      const deltaY = touch.clientY - dragStartPosRef.current.y;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Check if touch has moved significantly (more than 5px) to consider it a drag
      if (absDeltaX > 5 || absDeltaY > 5) {
        hasDraggedRef.current = true;
      }
      
      // Swipe-down detection (mobile only)
      if (isMobileRef.current && absDeltaY > absDeltaX && deltaY > 0) {
        // Swiping down - this is a delete gesture
        isSwipeDownRef.current = true;
        const progress = Math.min(absDeltaY / swipeDownThreshold, 1);
        setSwipeDownProgress(progress);
        
        // Visual feedback: scale down and fade out
        if (pointRef.current) {
          const scale = 1 - (progress * 0.5); // Scale down to 50%
          const opacity = 1 - (progress * 0.7); // Fade to 30% opacity
          pointRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
          pointRef.current.style.opacity = opacity;
        }
        
        // Delete if threshold reached
        if (absDeltaY >= swipeDownThreshold) {
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          onRemove();
          setIsDragging(false);
          setSwipeDownProgress(0);
          return;
        }
      } else if (isMobileRef.current && isSwipeDownRef.current) {
        // Switched from swipe-down to drag - reset swipe state
        isSwipeDownRef.current = false;
        setSwipeDownProgress(0);
        if (pointRef.current) {
          pointRef.current.style.transform = '';
          pointRef.current.style.opacity = '';
        }
      }
      
      // Only update position if not doing swipe-down
      if (!isSwipeDownRef.current) {
        updatePosition(touch.clientX, touch.clientY);
      }
      
      // Notify parent of drag position for drag-to-trash
      if (onDragMove && !isSwipeDownRef.current) {
        onDragMove(index, touch.clientX, touch.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Notify parent that drag ended
      if (onDragEnd) {
        onDragEnd(index);
      }
      
      // Reset drag flag after a short delay to allow click handler to check it
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      // Clear long-press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      setIsLongPressing(false);
      
      // Reset swipe-down state
      if (isSwipeDownRef.current) {
        isSwipeDownRef.current = false;
        setSwipeDownProgress(0);
        if (pointRef.current) {
          pointRef.current.style.transform = '';
          pointRef.current.style.opacity = '';
        }
      }
      
      // Notify parent that drag ended
      if (onDragEnd) {
        onDragEnd(index);
      }
      
      // Reset drag flag after a short delay to allow click handler to check it
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      // Clean up long-press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
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
    
    // Notify parent that drag started
    if (onDragStart) {
      onDragStart(index);
    }
  };

  const handleTouchStart = (e) => {
    // Don't start dragging if color picker is open
    if (showColorPicker) {
      return;
    }
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;
    // Reset drag tracking
    hasDraggedRef.current = false;
    dragStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    setIsDragging(true);
    isSwipeDownRef.current = false;
    setSwipeDownProgress(0);
    
    // Notify parent that drag started
    if (onDragStart) {
      onDragStart(index);
    }
    
    // Start long-press timer for delete (mobile alternative to right-click)
    if (isMobileRef.current) {
      setIsLongPressing(false);
      longPressTimerRef.current = setTimeout(() => {
        // If we haven't dragged significantly, trigger delete
        if (!hasDraggedRef.current) {
          setIsLongPressing(true);
          // Haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
          onRemove();
        }
      }, 500); // 500ms long press
    }
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
    // Only open if we're not currently dragging and not long-pressing
    if (!isDragging && !isLongPressing && onColorPickerToggle) {
      // Select the point first
      if (onSelect) {
        onSelect(index);
      }
      // Toggle color picker (open if closed, close if open)
      onColorPickerToggle(!showColorPicker);
    }
  };
  
  const handlePointSelect = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Just select the point without opening color picker
    if (onSelect && !isDragging && !isLongPressing) {
      onSelect(index);
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
          width: isMobileRef.current ? '54px' : 'var(--space-600)',
          height: isMobileRef.current ? '54px' : 'var(--space-600)',
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
        onTouchStart={handleTouchStart}
        onContextMenu={handleContextMenu}
        onClick={(e) => {
          // On desktop, clicking the point container selects it
          // (the inner div handles color picker toggle)
          if (!isMobileRef.current && onSelect && !isDragging) {
            e.stopPropagation();
            onSelect(index);
          }
        }}
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
              if (!hasDraggedRef.current && !isDragging && !isLongPressing) {
                handleColorClick(e);
              }
            }}
            onTouchEnd={(e) => {
              // Only open color picker if we didn't drag and didn't long-press (for touch)
              if (!hasDraggedRef.current && !isDragging && !isLongPressing) {
                e.preventDefault();
                e.stopPropagation();
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
          
          {/* Long-press visual feedback */}
          {isLongPressing && (
            <div
              style={{
                position: 'absolute',
                inset: '-50%',
                borderRadius: 'var(--border-radius-full)',
                border: '3px solid rgba(255, 0, 0, 0.8)',
                animation: 'pulse 0.3s ease-in-out',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />
          )}
          
          {/* Swipe-down visual feedback */}
          {isMobileRef.current && swipeDownProgress > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + var(--space-200))',
                left: '50%',
                width: '24px',
                height: '24px',
                borderRadius: 'var(--border-radius-full)',
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 20,
                opacity: swipeDownProgress,
                transform: `translateX(-50%) scale(${swipeDownProgress})`,
                transition: 'opacity 0.2s ease, transform 0.2s ease'
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Delete button for mobile when point is selected */}
      {isSelected && isMobileRef.current && !showColorPicker && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();
          }}
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-200))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--border-radius-full)',
            backgroundColor: 'rgba(239, 68, 68, 0.9)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 20,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
            animation: 'pulse 2s ease-in-out infinite'
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (navigator.vibrate) {
              navigator.vibrate(30);
            }
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              pointerEvents: 'none'
            }}
          >
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>
      )}

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
