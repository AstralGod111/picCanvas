import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Drawing, InsertDrawing } from "@shared/schema";
import { apiRequest } from "@/lib/queryclient";

interface DrawingState {
  imageData: string | null;
  history: string[];
  historyIndex: number;
}

export function useDrawing() {
  const [currentTool, setCurrentTool] = useState("brush");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [zoom, setZoom] = useState(1.0);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    imageData: null,
    history: [],
    historyIndex: -1,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const saveDrawingMutation = useMutation({
    mutationFn: async (drawing: InsertDrawing) => {
      const response = await apiRequest("POST", "/api/drawings", drawing);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drawings'] });
      toast({
        title: "Success",
        description: "Drawing saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save drawing",
        variant: "destructive",
      });
    },
  });

  const saveToHistory = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    setDrawingState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(imageData);
      
      // Limit history to 50 items
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    setDrawingState(prev => {
      if (prev.historyIndex <= 0) return prev;
      
      const newIndex = prev.historyIndex - 1;
      const imageData = prev.history[newIndex];
      
      if (imageData) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = imageData;
        }
      }
      
      return {
        ...prev,
        historyIndex: newIndex,
      };
    });
  }, []);

  const redo = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    setDrawingState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      
      const newIndex = prev.historyIndex + 1;
      const imageData = prev.history[newIndex];
      
      if (imageData) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          };
          img.src = imageData;
        }
      }
      
      return {
        ...prev,
        historyIndex: newIndex,
      };
    });
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, [saveToHistory]);

  const saveDrawing = useCallback(async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    const drawingData: InsertDrawing = {
      name: `Drawing_${new Date().toISOString().slice(0, 10)}`,
      imageData,
      originalImage: null,
      metadata: {
        width: canvas.width,
        height: canvas.height,
        format: "png",
        tools_used: [currentTool],
      },
    };

    await saveDrawingMutation.mutateAsync(drawingData);
  }, [currentTool, saveDrawingMutation]);

  const loadDrawing = useCallback((drawing: Drawing | string) => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = typeof drawing === 'string' ? drawing : drawing.imageData;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      saveToHistory();
    };
    img.src = imageData;
  }, [saveToHistory]);

  const resetZoom = useCallback(() => {
    setZoom(1.0);
  }, []);

  const canUndo = drawingState.historyIndex > 0;
  const canRedo = drawingState.historyIndex < drawingState.history.length - 1;

  return {
    currentTool,
    setCurrentTool,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    brushOpacity,
    setBrushOpacity,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    undo,
    redo,
    saveDrawing,
    loadDrawing,
    clearCanvas,
    resetZoom,
    saveToHistory,
  };
}
