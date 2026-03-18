'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, ZoomIn, ZoomOut, RotateCw, Download, X } from 'lucide-react';

interface PrescriptionViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function PrescriptionViewerModal({
  isOpen,
  onClose,
  imageUrl,
  title,
}: PrescriptionViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `prescription-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleModalClose = () => {
    resetView();
    onClose();
  };

  const isPDF = imageUrl && typeof imageUrl === 'string' && imageUrl.endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isPDF && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetView}
                  >
                    Reset
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleModalClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          {isPDF ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center space-y-4">
                <FileText className="h-24 w-24 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">PDF Document</h3>
                  <p className="text-muted-foreground mb-4">
                    Click below to open the PDF in a new tab for better viewing
                  </p>
                  <Button 
                    onClick={() => window.open(imageUrl, '_blank')}
                    size="lg"
                  >
                    Open PDF in New Tab
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center min-h-full p-4"
              style={{ 
                cursor: zoom > 1 ? 'grab' : 'default',
              }}
            >
              <img
                src={imageUrl}
                alt={title}
                className="max-w-none transition-transform duration-200 ease-in-out select-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  maxHeight: zoom === 1 ? 'calc(95vh - 120px)' : 'none',
                  maxWidth: zoom === 1 ? 'calc(95vw - 32px)' : 'none',
                }}
                draggable={false}
                onDoubleClick={() => {
                  if (zoom === 1) {
                    setZoom(2);
                  } else {
                    setZoom(1);
                  }
                }}
              />
            </div>
          )}
        </div>

        {!isPDF && (
          <div className="p-3 border-t bg-muted/20">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>Double-click to zoom</span>
              <span>•</span>
              <span>Use zoom controls to adjust size</span>
              <span>•</span>
              <span>Rotate to change orientation</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}