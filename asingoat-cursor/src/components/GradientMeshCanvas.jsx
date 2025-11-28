import { useEffect, useRef } from 'react';
import { calculateColorAtPoint } from '../utils/gradientMesh';

export default function GradientMeshCanvas({ points, width, height, onCanvasClick }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    if (!container) return;

    const updateCanvas = () => {
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Render gradient mesh
      renderGradientMesh(ctx, canvas.width, canvas.height, points);
    };

    updateCanvas();
    
    const handleResize = () => {
      updateCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [points, width, height]);

  const renderGradientMesh = (ctx, canvasWidth, canvasHeight, colorPoints) => {
    if (colorPoints.length === 0) {
      // Default dark background if no points
      ctx.fillStyle = '#1f1f1f';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      return;
    }

    // Scale points to canvas dimensions
    const scaledPoints = colorPoints.map(point => ({
      x: (point.x / width) * canvasWidth,
      y: (point.y / height) * canvasHeight,
      r: point.r,
      g: point.g,
      b: point.b
    }));

    // Render pixel by pixel (optimized with imageData)
    const imageData = ctx.createImageData(canvasWidth, canvasHeight);
    const data = imageData.data;

    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const color = calculateColorAtPoint(x, y, scaledPoints);
        const index = (y * canvasWidth + x) * 4;
        
        data[index] = color.r;     // R
        data[index + 1] = color.g; // G
        data[index + 2] = color.b; // B
        data[index + 3] = 255;     // A
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleClick = (e) => {
    if (!onCanvasClick) return;
    
    // Don't add point if clicking on controls
    if (e.target.closest('[data-controls-panel]')) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale coordinates to canvas dimensions (width/height props)
    const scaleX = width / window.innerWidth;
    const scaleY = height / window.innerHeight;
    
    onCanvasClick(x * scaleX, y * scaleY);
  };

  const handleTouchEnd = (e) => {
    if (!onCanvasClick) return;
    
    // Don't add point if touching controls
    if (e.target.closest('[data-controls-panel]')) return;
    
    const touch = e.changedTouches[0];
    if (!touch) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Scale coordinates to canvas dimensions (width/height props)
    const scaleX = width / window.innerWidth;
    const scaleY = height / window.innerHeight;
    
    onCanvasClick(x * scaleX, y * scaleY);
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'crosshair',
        overflow: 'hidden'
      }}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}

