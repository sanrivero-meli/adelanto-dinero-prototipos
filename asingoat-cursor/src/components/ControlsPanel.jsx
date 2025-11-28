import { useState, useEffect, useRef } from 'react';

const EXPORT_WIDTH = 3840;
const EXPORT_HEIGHT = 2160;

export default function ControlsPanel({ onExport, points = [], instructionOpacity = 1, draggedPointIndex, draggedPointPosition, onDeletePoint }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const buttonRef = useRef(null);
  const wasOverTrashRef = useRef(false);
  const draggedIndexRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleExport = () => {
    // Don't export if we're currently dragging (deletion is handled in useEffect)
    if (draggedPointIndex !== null) {
      return;
    }
    
    onExport(EXPORT_WIDTH, EXPORT_HEIGHT, () => {
      // Trigger bounce animation when export completes
      setIsBouncing(true);
    });
  };

  // Reset bounce state after animation completes
  useEffect(() => {
    if (isBouncing) {
      const timer = setTimeout(() => setIsBouncing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isBouncing]);

  // Track when drag starts
  useEffect(() => {
    if (draggedPointIndex !== null) {
      draggedIndexRef.current = draggedPointIndex;
    }
  }, [draggedPointIndex]);

  // Check if dragged point is over the button
  useEffect(() => {
    if (draggedPointIndex !== null && buttonRef.current) {
      const checkOverlap = () => {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const isOver = (
          draggedPointPosition.x >= buttonRect.left &&
          draggedPointPosition.x <= buttonRect.right &&
          draggedPointPosition.y >= buttonRect.top &&
          draggedPointPosition.y <= buttonRect.bottom
        );
        setIsOverTrash(isOver);
        wasOverTrashRef.current = isOver;
      };
      
      checkOverlap();
      // Check on every frame while dragging
      const interval = setInterval(checkOverlap, 16);
      return () => {
        clearInterval(interval);
        // When drag ends (cleanup runs), check if we were over trash and delete if so
        if (wasOverTrashRef.current && draggedIndexRef.current !== null && onDeletePoint) {
          const indexToDelete = draggedIndexRef.current;
          setTimeout(() => {
            onDeletePoint(indexToDelete);
            // Haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }
          }, 0);
        }
        setIsOverTrash(false);
        wasOverTrashRef.current = false;
        draggedIndexRef.current = null;
      };
    } else {
      setIsOverTrash(false);
    }
  }, [draggedPointIndex, draggedPointPosition, onDeletePoint]);

  const hasPoints = points && points.length > 0;
  
  // Calculate morph progress: 1 = instruction, 0 = button
  const morphProgress = instructionOpacity;
  
  // Don't render anything if no points and instruction is fully hidden
  if (!hasPoints && instructionOpacity === 0) {
    return null;
  }
  
  // Show instruction when opacity > 0, even if no points yet
  const isVisible = instructionOpacity > 0 || hasPoints;

  // Calculate transform based on state - always maintain translateX(-50%) for centering
  // When bouncing, let the animation handle the transform
  const baseTransform = isBouncing 
    ? undefined 
    : (isHovered || isActive 
      ? 'translateX(-50%) translateY(-2px)' 
      : 'translateX(-50%)');
  
  // Apply scale when dragging over trash
  const transform = showTrashIcon && isOverTrash && baseTransform
    ? baseTransform.replace('translateX(-50%)', 'translateX(-50%) scale(1.1)')
    : (showTrashIcon && isOverTrash 
      ? 'translateX(-50%) scale(1.1)' 
      : baseTransform);

  // Morph between instruction and button styles
  // Instruction: padding increased by 30% again (27px 67.6px), bg rgba(0,0,0,0.15), border rgba(255,255,255,0.08)
  // Button: padding var(--space-600), bg rgba(0,0,0,0.4), border rgba(255,255,255,0.15)
  const padding = morphProgress > 0
    ? `calc(var(--space-400) * 1.69) calc(var(--space-1000) * 1.69)`
    : 'var(--space-600)';
  
  const backgroundColor = morphProgress > 0
    ? `rgba(0, 0, 0, ${0.15 + (1 - morphProgress) * 0.25})`
    : (isHovered || isActive
      ? 'rgba(0, 0, 0, 0.5)'
      : 'rgba(0, 0, 0, 0.4)');

  const borderOpacity = morphProgress > 0
    ? 0.08 + (1 - morphProgress) * 0.07
    : 0.15;
  
  const boxShadow = morphProgress > 0
    ? `0 4px 16px rgba(0, 0, 0, ${0.2 + (1 - morphProgress) * 0.2}), 0 0 0 1px rgba(255, 255, 255, ${0.03 + (1 - morphProgress) * 0.02})`
    : (isHovered || isActive
      ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)');
  
  // Text opacity: 1 when instruction, 0 when button
  const textOpacity = morphProgress;
  // Icon opacity: 0 when instruction, 1 when button
  const iconOpacity = hasPoints ? (1 - morphProgress) : 0;
  
  // Determine if we should show trash icon (when dragging) or export icon
  const isDragging = draggedPointIndex !== null;
  const showTrashIcon = isDragging && isMobile;
  
  // Adjust background color when dragging over trash
  const finalBackgroundColor = showTrashIcon && isOverTrash
    ? 'rgba(239, 68, 68, 0.6)' // Red when over trash
    : backgroundColor;

  return (
    <>
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          25% {
            transform: translateX(-50%) translateY(-8px);
          }
          50% {
            transform: translateX(-50%) translateY(-4px);
          }
          75% {
            transform: translateX(-50%) translateY(-6px);
          }
        }
        @keyframes bounceHover {
          0%, 100% {
            transform: translateX(-50%) translateY(-2px);
          }
          25% {
            transform: translateX(-50%) translateY(-10px);
          }
          50% {
            transform: translateX(-50%) translateY(-6px);
          }
          75% {
            transform: translateX(-50%) translateY(-8px);
          }
        }
      `}</style>
      <div
        ref={buttonRef}
        onClick={hasPoints ? handleExport : undefined}
        onTouchEnd={hasPoints ? (e) => {
          e.preventDefault();
          setIsActive(false);
          handleExport();
        } : undefined}
        style={{
          position: 'fixed',
          bottom: isMobile ? 'var(--space-400)' : 'var(--space-600)',
          left: '50%',
          transform: transform,
          padding: padding,
          borderRadius: 'var(--border-radius-300)',
          border: `1px solid rgba(255, 255, 255, ${borderOpacity})`,
          backgroundColor: finalBackgroundColor,
          color: 'var(--gray-100)',
          cursor: hasPoints ? 'pointer' : 'default',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          transition: isBouncing ? 'none' : (showTrashIcon && isOverTrash ? 'all 0.2s ease' : 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'),
          animation: isBouncing 
            ? (isHovered || isActive ? 'bounceHover 0.6s ease' : 'bounce 0.6s ease')
            : 'none',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: boxShadow,
          fontFamily: 'inherit',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          outline: 'none',
          pointerEvents: hasPoints ? 'auto' : 'none',
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          minWidth: isMobile ? '120px' : 'auto',
          minHeight: isMobile ? '44px' : 'auto'
        }}
        onMouseEnter={hasPoints ? () => setIsHovered(true) : undefined}
        onMouseLeave={hasPoints ? () => {
          setIsHovered(false);
          setIsActive(false);
        } : undefined}
        onMouseDown={hasPoints ? () => setIsActive(true) : undefined}
        onMouseUp={hasPoints ? () => setIsActive(false) : undefined}
        onTouchStart={hasPoints ? () => setIsActive(true) : undefined}
      >
        {/* Instruction text */}
        <span
          style={{
            position: 'absolute',
            fontSize: 'calc(var(--size-600) * 0.75)',
            lineHeight: 'calc(var(--line-height-600) * 0.75)',
            fontWeight: 300,
            opacity: textOpacity,
            transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Tap anywhere
        </span>
        
        {/* Export icon */}
        <svg
          viewBox="0 0 8.995833 11.244792375"
          fill="var(--gray-100)"
          style={{
            width: 'var(--size-900)',
            height: 'var(--size-900)',
            opacity: showTrashIcon ? 0 : iconOpacity,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <path d="m 4.4754387,0.79473222 a 0.2645934,0.2645934 0 0 0 -0.162253,0.07389 L 2.7919267,2.3588792 a 0.26456694,0.26456694 0 0 0 -0.0057,0.373079 0.26456694,0.26456694 0 0 0 0.374629,0.0057 l 1.072737,-1.050518 v 4.440796 a 0.26456694,0.26456694 0 0 0 0.263532,0.264051 0.26456694,0.26456694 0 0 0 0.265601,-0.264051 v -4.438727 l 1.072218,1.048449 a 0.26456694,0.26456694 0 0 0 0.373081,-0.0057 0.26456694,0.26456694 0 0 0 -0.0041,-0.373079 L 4.6826657,0.86862222 a 0.2645934,0.2645934 0 0 0 -0.207209,-0.07389 z M 1.8762767,4.0129382 c -0.46895,0 -0.85364,0.384651 -0.85364,0.853641 v 2.480313 c 0,0.46899 0.38469,0.855191 0.85364,0.855191 h 5.24173 c 0.468949,0 0.85519,-0.386201 0.85519,-0.855191 v -2.480313 c 0,-0.46899 -0.386241,-0.853641 -0.85519,-0.853641 h -1.283046 a 0.26456694,0.26456694 0 0 0 -0.264048,0.263533 0.26456694,0.26456694 0 0 0 0.264048,0.266117 h 1.283046 c 0.184694,0 0.326057,0.13872 0.326057,0.323991 v 2.480313 c 0,0.185274 -0.141363,0.326058 -0.326057,0.326058 h -5.24173 c -0.184691,0 -0.324507,-0.140784 -0.324507,-0.326058 v -2.480313 c 0,-0.185271 0.139816,-0.323991 0.324507,-0.323991 h 1.285112 a 0.26456694,0.26456694 0 0 0 0.263535,-0.266117 0.26456694,0.26456694 0 0 0 -0.263535,-0.263533 z" />
        </svg>
        
        {/* Trash icon (shown when dragging on mobile) */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--gray-100)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            width: 'var(--size-900)',
            height: 'var(--size-900)',
            opacity: showTrashIcon ? iconOpacity : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </div>
    </>
  );
}
