"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageLightboxProps {
  images: Array<{ url: string; unoptimized?: boolean }>
  initialIndex?: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)

  // Reset index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setZoom(1)
    }
  }, [open, initialIndex])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    setZoom(1)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    setZoom(1)
  }, [images.length])

  const toggleZoom = () => {
    setZoom((prev) => (prev === 1 ? 2 : 1))
  }

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious()
          break
        case "ArrowRight":
          goToNext()
          break
        case "Escape":
          onOpenChange(false)
          break
        case "+":
        case "=":
          setZoom((prev) => Math.min(prev + 0.5, 3))
          break
        case "-":
          setZoom((prev) => Math.max(prev - 0.5, 1))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, goToPrevious, goToNext, onOpenChange])

  if (images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 lightbox-overlay" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center"
          data-testid="image-lightbox"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation - Previous */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Main Image */}
          <div
            className={cn(
              "relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center",
              "transition-transform duration-200"
            )}
            style={{ transform: `scale(${zoom})` }}
          >
            <Image
              src={currentImage.url}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              unoptimized={currentImage.unoptimized}
              priority
            />
          </div>

          {/* Navigation - Next */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
              onClick={goToNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {/* Counter */}
            <span className="text-white text-sm font-mono bg-black/50 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>

            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-black/50 rounded-full px-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setZoom((prev) => Math.max(prev - 0.5, 1))}
                disabled={zoom <= 1}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-white text-sm font-mono w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setZoom((prev) => Math.min(prev + 0.5, 3))}
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[80vw] p-2 bg-black/30 rounded-lg">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={cn(
                    "relative w-16 h-12 rounded overflow-hidden flex-shrink-0 border-2 transition-all",
                    index === currentIndex
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  onClick={() => {
                    setCurrentIndex(index)
                    setZoom(1)
                  }}
                >
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized={image.unoptimized}
                  />
                </button>
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
