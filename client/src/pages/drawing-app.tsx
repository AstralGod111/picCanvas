import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import DrawingSidebar from "@/components/drawing-sidebar";
import DrawingCanvas from "@/components/drawing-canvas";
import ImportModal from "@/components/import-modal";
import ExportModal from "@/components/export-modal";
import { Button } from "@/components/ui/button";
import { useDrawing } from "@/hooks/use-drawing";
import { Menu, Undo, Redo, ZoomIn, ZoomOut, Maximize, Save, Share } from "lucide-react";

export default function DrawingApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const {
    currentTool,
    setCurrentTool,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    brushOpacity,
    setBrushOpacity,
    canUndo,
    canRedo,
    undo,
    redo,
    saveDrawing,
    loadDrawing,
    clearCanvas,
    zoom,
    setZoom,
    resetZoom
  } = useDrawing();

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
  };

  const handleSave = async () => {
    await saveDrawing();
  };

  const handleExport = () => {
    setExportModalOpen(true);
  };

  return (
    <div className="flex h-screen relative bg-background">
      {/* Sidebar */}
      <div
        className={`sidebar-transition bg-surface shadow-lg z-20 flex flex-col w-80 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0 absolute h-full`}
      >
        <DrawingSidebar
          currentTool={currentTool}
          onToolChange={handleToolChange}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          brushColor={brushColor}
          onBrushColorChange={setBrushColor}
          brushOpacity={brushOpacity}
          onBrushOpacityChange={setBrushOpacity}
          onImportClick={() => setImportModalOpen(true)}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLoadDrawing={loadDrawing}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-gray-100 relative">
        {/* Top Action Bar */}
        <div className="bg-surface shadow-sm p-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-open-sidebar"
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              disabled={!canUndo}
              onClick={undo}
              data-testid="button-undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              disabled={!canRedo}
              onClick={redo}
              data-testid="button-redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            
            <div className="h-6 w-px bg-border"></div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(zoom * 1.2)}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(zoom * 0.8)}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={resetZoom}
              data-testid="button-reset-zoom"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              className="bg-secondary hover:bg-secondary/90"
              data-testid="button-save"
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            
            <Button
              onClick={handleExport}
              data-testid="button-share"
            >
              <Share className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 relative overflow-hidden">
          <DrawingCanvas
            tool={currentTool}
            brushSize={brushSize}
            brushColor={brushColor}
            brushOpacity={brushOpacity}
            zoom={zoom}
            onImportImage={() => setImportModalOpen(true)}
          />

          {/* Drawing Info Overlay */}
          <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm" data-testid="info-overlay">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-muted-foreground">
                Tool: <span className="text-foreground font-medium" data-testid="text-current-tool">{currentTool}</span>
              </span>
              <span className="text-muted-foreground">
                Size: <span className="text-foreground font-medium" data-testid="text-brush-size">{brushSize}px</span>
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-muted-foreground">Color:</span>
                <div
                  className="w-4 h-4 rounded border border-border"
                  style={{ backgroundColor: brushColor }}
                  data-testid="indicator-current-color"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImageLoad={loadDrawing}
      />
      
      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />
    </div>
  );
}
