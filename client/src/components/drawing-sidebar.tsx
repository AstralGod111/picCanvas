import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Palette, Images, Camera, Link, Clipboard, Paintbrush, Eraser, Pen } from "lucide-react";
import type { Drawing } from "@shared/schema";

interface DrawingSidebarProps {
  currentTool: string;
  onToolChange: (tool: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
  brushOpacity: number;
  onBrushOpacityChange: (opacity: number) => void;
  onImportClick: () => void;
  onCloseSidebar: () => void;
  onLoadDrawing: (drawing: Drawing) => void;
}

const colors = [
  "#000000", "#EF4444", "#3B82F6", "#10B981",
  "#F59E0B", "#8B5CF6", "#EC4899", "#6B7280"
];

const tools = [
  { id: 'brush', name: 'Brush', icon: Paintbrush },
  { id: 'eraser', name: 'Eraser', icon: Eraser },
  { id: 'pen', name: 'Pen', icon: Pen },
  { id: 'highlighter', name: 'Highlighter', icon: Pen },
];

export default function DrawingSidebar({
  currentTool,
  onToolChange,
  brushSize,
  onBrushSizeChange,
  brushColor,
  onBrushColorChange,
  brushOpacity,
  onBrushOpacityChange,
  onImportClick,
  onCloseSidebar,
  onLoadDrawing
}: DrawingSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customColor, setCustomColor] = useState(brushColor);

  const { data: drawings = [] } = useQuery<Drawing[]>({
    queryKey: ['/api/drawings'],
  });

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      if (imageData && (window as any).loadImageToCanvas) {
        (window as any).loadImageToCanvas(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    onBrushColorChange(color);
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileImport}
      />

      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Palette className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">DrawPic</h1>
            <p className="text-xs text-muted-foreground">Image Editor</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onCloseSidebar}
          data-testid="button-close-sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Import Section */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-3 text-foreground">Import Image</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-primary text-primary-foreground rounded-lg flex flex-col items-center space-y-2 h-auto"
            data-testid="button-import-gallery"
          >
            <Images className="h-5 w-5" />
            <span className="text-xs">Gallery</span>
          </Button>
          <Button
            onClick={() => {}}
            className="p-3 bg-secondary text-secondary-foreground rounded-lg flex flex-col items-center space-y-2 h-auto"
            data-testid="button-import-camera"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">Camera</span>
          </Button>
          <Button
            onClick={onImportClick}
            variant="secondary"
            className="p-3 rounded-lg flex flex-col items-center space-y-2 h-auto"
            data-testid="button-import-url"
          >
            <Link className="h-5 w-5" />
            <span className="text-xs">URL</span>
          </Button>
          <Button
            onClick={() => {}}
            variant="secondary"
            className="p-3 rounded-lg flex flex-col items-center space-y-2 h-auto"
            data-testid="button-import-paste"
          >
            <Clipboard className="h-5 w-5" />
            <span className="text-xs">Paste</span>
          </Button>
        </div>
      </div>

      {/* Drawing Tools */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-3 text-foreground">Drawing Tools</h3>
        <div className="space-y-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentTool === tool.id;
            return (
              <Button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                data-testid={`button-tool-${tool.id}`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {tool.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Brush Settings */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-3 text-foreground">Brush Settings</h3>
        
        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-2">Size</label>
          <div className="flex items-center space-x-3">
            <Slider
              value={[brushSize]}
              onValueChange={(value) => onBrushSizeChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="flex-1"
              data-testid="slider-brush-size"
            />
            <div
              className="rounded-full bg-foreground flex-shrink-0"
              style={{ 
                width: Math.max(8, Math.min(brushSize, 20)), 
                height: Math.max(8, Math.min(brushSize, 20)) 
              }}
              data-testid="indicator-brush-size"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-muted-foreground mb-2">Opacity</label>
          <Slider
            value={[brushOpacity * 100]}
            onValueChange={(value) => onBrushOpacityChange(value[0] / 100)}
            max={100}
            min={10}
            step={10}
            className="w-full"
            data-testid="slider-brush-opacity"
          />
        </div>
      </div>

      {/* Color Palette */}
      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-3 text-foreground">Colors</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onBrushColorChange(color)}
              className={`w-8 h-8 rounded-lg border-2 transition-all ${
                brushColor === color ? 'border-foreground' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              data-testid={`button-color-${color.replace('#', '')}`}
            />
          ))}
        </div>
        <input
          type="color"
          value={customColor}
          onChange={(e) => handleCustomColorChange(e.target.value)}
          className="w-full h-10 rounded-lg border border-border"
          data-testid="input-custom-color"
        />
      </div>

      {/* Recent History */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="font-medium mb-3 text-foreground">Recent Edits</h3>
        <div className="space-y-2">
          {drawings.map((drawing) => (
            <div
              key={drawing.id}
              onClick={() => onLoadDrawing(drawing)}
              className="p-3 bg-muted rounded-lg flex items-center space-x-3 hover:bg-muted/80 cursor-pointer transition-colors"
              data-testid={`item-recent-${drawing.id}`}
            >
              <div className="w-12 h-12 bg-background rounded object-cover flex items-center justify-center">
                <Images className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{drawing.name}</p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(drawing.updatedAt.toString())}</p>
              </div>
            </div>
          ))}
          
          {drawings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No recent drawings</p>
          )}
        </div>
      </div>
    </>
  );
}
