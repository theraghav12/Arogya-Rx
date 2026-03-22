'use client';

import React, { useState, useRef, useCallback } from 'react';
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
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    setPosition({ x: 0, y: 0 });
  };

  const handleModalClose = () => {
    resetView();
    onClose();
  };

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Reset position when zoom changes to 1
  React.useEffect(() => {
    if (zoom === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  const isPDF = imageUrl && typeof imageUrl === 'string' && imageUrl.endsWith('.pdf');

  const getCursor = () => {
    if (zoom <= 1) return 'default';
    if (isDragging) return 'grabbing';
    return 'grab';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-full h-full p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 pb-2 border-b flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-lg font-semibold flex-1 min-w-0 overflow-hidden">
              <span className="block truncate" title={title}>
                {title}
              </span>
            </DialogTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isPDF && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="h-8 w-8 p-0"
                    title="Zoom Out"
                  >
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-medium min-w-[45px] text-center px-1">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="h-8 w-8 p-0"
                    title="Zoom In"
                  >
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    className="h-8 w-8 p-0"
                    title="Rotate"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetView}
                    className="h-8 px-2 text-xs"
                    title="Reset View"
                  >
                    Reset
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleModalClose}
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
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
              ref={containerRef}
              className="w-full h-full overflow-hidden flex items-center justify-center p-4 select-none"
              style={{ 
                cursor: getCursor(),
              }}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center justify-center min-w-0 min-h-0">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={title}
                  className="max-w-none transition-transform duration-200 ease-in-out select-none object-contain pointer-events-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    maxHeight: zoom === 1 ? 'calc(90vh - 140px)' : 'none',
                    maxWidth: zoom === 1 ? 'calc(90vw - 32px)' : 'none',
                  }}
                  draggable={false}
                  onDoubleClick={() => {
                    if (zoom === 1) {
                      setZoom(2);
                    } else {
                      resetView();
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {!isPDF && (
          <div className="p-2 border-t bg-muted/20 flex-shrink-0">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span>Double-click to zoom</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Mouse wheel to zoom</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Drag to pan when zoomed</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}