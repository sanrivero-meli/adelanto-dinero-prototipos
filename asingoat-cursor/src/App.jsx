import { useState, useRef, useEffect } from 'react';
import GradientMeshCanvas from './components/GradientMeshCanvas';
import ColorPoint from './components/ColorPoint';
import ControlsPanel from './components/ControlsPanel';
import { calculateColorAtPoint, hexToRgb } from './utils/gradientMesh';

const DEFAULT_WIDTH = 3840;
const DEFAULT_HEIGHT = 2160;

function App() {
  const [points, setPoints] = useState([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);
  const [activeColorPickerIndex, setActiveColorPickerIndex] = useState(null);
  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_HEIGHT);
  const [displayWidth, setDisplayWidth] = useState(window.innerWidth);
  const [displayHeight, setDisplayHeight] = useState(window.innerHeight);
  const [instructionOpacity, setInstructionOpacity] = useState(1);
  const containerRef = useRef(null);

  // Update display dimensions on resize - fullscreen
  useEffect(() => {
    const updateDisplaySize = () => {
      setDisplayWidth(window.innerWidth);
      setDisplayHeight(window.innerHeight);
    };

    updateDisplaySize();
    window.addEventListener('resize', updateDisplaySize);
    return () => window.removeEventListener('resize', updateDisplaySize);
  }, []);

  // Fade out instruction when first point is added
  useEffect(() => {
    if (points.length > 0) {
      // Trigger fade-out when first point is added
      setInstructionOpacity(0);
    } else if (points.length === 0) {
      // Fade back in when all points are removed
      setInstructionOpacity(1);
    }
  }, [points.length]);

  // Handle Delete key to remove selected point
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPointIndex !== null) {
        e.preventDefault();
        handleRemovePoint(selectedPointIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPointIndex]);

  const handleCanvasClick = (x, y) => {
    // If color picker is open, close it and don't create new point
    if (activeColorPickerIndex !== null) {
      setActiveColorPickerIndex(null);
      return;
    }

    // Generate random color for new point
    const colors = [
      { r: 255, g: 100, b: 150 },
      { r: 100, g: 200, b: 255 },
      { r: 150, g: 255, b: 100 },
      { r: 255, g: 200, b: 100 },
      { r: 200, g: 100, b: 255 },
      { r: 100, g: 255, b: 200 }
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newPoint = {
      id: Date.now(),
      x,
      y,
      ...randomColor
    };
    
    setPoints([...points, newPoint]);
    setSelectedPointIndex(points.length);
  };

  const handlePointDrag = (index, x, y) => {
    const updatedPoints = [...points];
    updatedPoints[index] = { ...updatedPoints[index], x, y };
    setPoints(updatedPoints);
  };

  const handlePointColorChange = (index, r, g, b) => {
    const updatedPoints = [...points];
    updatedPoints[index] = { ...updatedPoints[index], r, g, b };
    setPoints(updatedPoints);
  };

  const handleAddPoint = () => {
    const colors = [
      { r: 255, g: 100, b: 150 },
      { r: 100, g: 200, b: 255 },
      { r: 150, g: 255, b: 100 },
      { r: 255, g: 200, b: 100 },
      { r: 200, g: 100, b: 255 },
      { r: 100, g: 255, b: 200 }
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newPoint = {
      id: Date.now(),
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      ...randomColor
    };
    
    setPoints([...points, newPoint]);
    setSelectedPointIndex(points.length);
  };

  const handleRemovePoint = (index) => {
    const updatedPoints = points.filter((_, i) => i !== index);
    setPoints(updatedPoints);
    if (selectedPointIndex === index) {
      setSelectedPointIndex(null);
    } else if (selectedPointIndex > index) {
      setSelectedPointIndex(selectedPointIndex - 1);
    }
    // Close color picker if it was open for this point
    if (activeColorPickerIndex === index) {
      setActiveColorPickerIndex(null);
    } else if (activeColorPickerIndex > index) {
      setActiveColorPickerIndex(activeColorPickerIndex - 1);
    }
  };

  const handleSelectPoint = (index) => {
    setSelectedPointIndex(index === selectedPointIndex ? null : index);
  };

  const handleResolutionChange = (width, height) => {
    // Scale existing points proportionally
    const scaleX = width / canvasWidth;
    const scaleY = height / canvasHeight;
    
    const scaledPoints = points.map(point => ({
      ...point,
      x: point.x * scaleX,
      y: point.y * scaleY
    }));
    
    setPoints(scaledPoints);
    setCanvasWidth(width);
    setCanvasHeight(height);
  };

  const handleExport = (exportWidth, exportHeight, onComplete) => {
    // Create a temporary canvas for export
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');

    // Scale points to export dimensions
    const scaledPoints = points.map(point => ({
      x: (point.x / canvasWidth) * exportWidth,
      y: (point.y / canvasHeight) * exportHeight,
      r: point.r,
      g: point.g,
      b: point.b
    }));

    // Render gradient mesh at export resolution
    const imageData = ctx.createImageData(exportWidth, exportHeight);
    const data = imageData.data;

    for (let y = 0; y < exportHeight; y++) {
      for (let x = 0; x < exportWidth; x++) {
        const color = calculateColorAtPoint(x, y, scaledPoints);
        const index = (y * exportWidth + x) * 4;
        
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gradient-mesh-${exportWidth}x${exportHeight}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete();
      }
    }, 'image/png');
  };

  return (
    <div className="container">
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}
      >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10
        }}
      >
        <GradientMeshCanvas
          points={points}
          width={canvasWidth}
          height={canvasHeight}
          onCanvasClick={handleCanvasClick}
        />
        {points.map((point, index) => (
          <ColorPoint
            key={point.id}
            point={point}
            index={index}
            isSelected={selectedPointIndex === index}
            activeColorPickerIndex={activeColorPickerIndex}
            onDrag={(x, y) => handlePointDrag(index, x, y)}
            onColorChange={(color) => {
              const rgb = hexToRgb(color);
              handlePointColorChange(index, rgb.r, rgb.g, rgb.b);
            }}
            onRemove={() => handleRemovePoint(index)}
            onColorPickerToggle={(isOpen) => {
              setActiveColorPickerIndex(isOpen ? index : null);
              // Select the point when opening color picker
              if (isOpen) {
                setSelectedPointIndex(index);
              }
            }}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
          />
        ))}
      </div>

      <ControlsPanel
        points={points}
        onExport={handleExport}
        instructionOpacity={instructionOpacity}
      />
      </div>
    </div>
  );
}

export default App;

