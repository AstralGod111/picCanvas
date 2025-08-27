import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [fileName, setFileName] = useState("my_drawing");
  const [format, setFormat] = useState("png");
  const { toast } = useToast();

  const handleSave = () => {
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        toast({
          title: "Error",
          description: "No drawing found to save",
          variant: "destructive",
        });
        return;
      }

      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      
      if (format === 'jpg' || format === 'jpeg') {
        link.href = canvas.toDataURL('image/jpeg', 0.9);
      } else if (format === 'webp') {
        link.href = canvas.toDataURL('image/webp', 0.9);
      } else {
        link.href = canvas.toDataURL('image/png');
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Drawing saved successfully",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save drawing",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        toast({
          title: "Error",
          description: "No drawing found to share",
          variant: "destructive",
        });
        return;
      }

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast({
            title: "Error",
            description: "Failed to prepare image for sharing",
            variant: "destructive",
          });
          return;
        }

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${fileName}.${format}`, { 
            type: `image/${format === 'jpg' ? 'jpeg' : format}` 
          });
          
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: fileName,
                text: 'Check out my drawing!'
              });
              
              toast({
                title: "Success",
                description: "Drawing shared successfully",
              });
              
              onOpenChange(false);
            } catch (error) {
              // User cancelled or error occurred
              if ((error as Error).name !== 'AbortError') {
                toast({
                  title: "Error",
                  description: "Failed to share drawing",
                  variant: "destructive",
                });
              }
            }
          } else {
            // Fallback to download
            handleSave();
          }
        } else {
          // Fallback to download
          handleSave();
        }
      }, `image/${format === 'jpg' ? 'jpeg' : format}`, 0.9);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share drawing",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-export">
        <DialogHeader>
          <DialogTitle>Export Drawing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="my_drawing"
              data-testid="input-file-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger data-testid="select-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Recommended)</SelectItem>
                <SelectItem value="jpg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSave}
              className="bg-secondary hover:bg-secondary/90"
              data-testid="button-save"
            >
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={handleShare}
              data-testid="button-share"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-export"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
