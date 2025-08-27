import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Image, Plus } from "lucide-react";
import { getCanvasPosition, setupCanvas } from "@/lib/canvas-utils";

interface DrawingCanvasProps {
  tool: string;
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  zoom: number;
  onImportImage: () => void;
}

export default function DrawingCanvas({
  tool,
  brushSize,
  brushColor,
  brushOpacity,
  zoom,
  onImportImage
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [hasImage, setHasImage] = useState(false);

  const setupCanvasContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = brushOpacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    return ctx;
  }, [brushColor, brushSize, brushOpacity, tool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setupCanvas(canvas);
    setupCanvasContext();
  }, [setupCanvasContext]);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasPosition(e, canvas);
    setIsDrawing(true);
    setLastPoint(point);

    const ctx = setupCanvasContext();
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [setupCanvasContext]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPosition(e, canvas);
    
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    
    setLastPoint(point);
  }, [isDrawing]);

  const stopDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(false);
    ctx.closePath();
    setLastPoint(null);
  }, [isDrawing]);

  const handleImageLoad = useCallback((imageData: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate scaling to fit image within canvas
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;
      
      // Draw image
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      setHasImage(true);
    };
    img.src = imageData;
  }, []);

  // Expose handleImageLoad to parent component
  useEffect(() => {
    (window as any).loadImageToCanvas = handleImageLoad;
  }, [handleImageLoad]);

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden canvas-container">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair bg-white"
        style={{
          touchAction: 'none',
          transform: `scale(${zoom})`,
          transformOrigin: 'center'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        data-testid="canvas-drawing"
      />

      {/* Canvas Placeholder */}
      {!hasImage && (
        <div className="absolute inset-0 flex items-center justify-center bg-white" data-testid="canvas-placeholder">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Ready to Create</h3>
            <p className="text-muted-foreground mb-4 max-w-xs">Import an image to start drawing, or begin with a blank canvas</p>
            <Button onClick={onImportImage} data-testid="button-import-image">
              <Plus className="h-4 w-4 mr-2" />
              Import Image
            </Button>
          </div>
        </div>
      )}

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
        <Button
          size="icon"
          variant="secondary"
          className="floating-btn w-12 h-12 rounded-full shadow-lg"
          onClick={() => {}}
          data-testid="button-zoom-in-floating"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="floating-btn w-12 h-12 rounded-full shadow-lg"
          onClick={() => {}}
          data-testid="button-zoom-out-floating"
        >
          <span className="text-lg font-medium">−</span>
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="floating-btn w-12 h-12 rounded-full shadow-lg"
          onClick={() => {}}
          data-testid="button-home-floating"
        >
          <span className="text-xs">⌂</span>
        </Button>
      </div>
    </div>
  );
}
