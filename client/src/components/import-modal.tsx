import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageLoad: (imageData: string) => void;
}

export default function ImportModal({ open, onOpenChange, onImageLoad }: ImportModalProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImportFromUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create a new image element to load the URL
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        // Create a canvas to convert the image to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          toast({
            title: "Error",
            description: "Failed to process image",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const dataURL = canvas.toDataURL('image/png');
        
        if ((window as any).loadImageToCanvas) {
          (window as any).loadImageToCanvas(dataURL);
        }
        
        toast({
          title: "Success",
          description: "Image imported successfully",
        });
        
        setUrl("");
        onOpenChange(false);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to load image from URL. Please check the URL and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      };
      
      img.src = url;
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import image",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const items = await navigator.clipboard.read();
      
      for (const item of items) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          const blob = await item.getType('image/png') || await item.getType('image/jpeg');
          const reader = new FileReader();
          
          reader.onload = (e) => {
            const imageData = e.target?.result as string;
            if (imageData && (window as any).loadImageToCanvas) {
              (window as any).loadImageToCanvas(imageData);
            }
            
            toast({
              title: "Success",
              description: "Image pasted successfully",
            });
            
            onOpenChange(false);
          };
          
          reader.readAsDataURL(blob);
          return;
        }
      }
      
      toast({
        title: "Error",
        description: "No image found in clipboard",
        variant: "destructive",
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access clipboard. Please try copying an image first.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-import">
        <DialogHeader>
          <DialogTitle>Import Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              data-testid="input-image-url"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-import"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleImportFromUrl}
              disabled={isLoading || !url.trim()}
              data-testid="button-import-url"
            >
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handlePasteFromClipboard}
            data-testid="button-paste-clipboard"
          >
            Paste from Clipboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
