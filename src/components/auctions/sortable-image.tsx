"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { GripVertical, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getProxiedImageUrl, IMAGE_CROP_CONFIG } from "@/lib/image-utils"
import { useTranslations } from "next-intl"

interface SortableImageProps {
  id: string
  url: string
  index: number
  onDelete?: (url: string) => void
}

export function SortableImage({ id, url, index, onDelete }: SortableImageProps) {
  const t = useTranslations("auctions")
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const imageInfo = getProxiedImageUrl(url)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
        isDragging
          ? "opacity-50 shadow-2xl scale-105"
          : index === 0
            ? "border-primary ring-2 ring-primary/20"
            : "border-muted hover:border-muted-foreground/50"
      }`}
    >
      <Image
        src={imageInfo.url}
        alt={`Photo ${index + 1}`}
        fill
        className="object-cover"
        style={{
          objectPosition: IMAGE_CROP_CONFIG.objectPosition,
          transform: `scale(1.${IMAGE_CROP_CONFIG.cropBottomPercent.toString().padStart(2, '0')})`,
          transformOrigin: 'top center'
        }}
        sizes="(max-width: 768px) 50vw, 25vw"
        unoptimized={imageInfo.unoptimized}
      />

      {/* Position badge */}
      <Badge
        variant={index === 0 ? "default" : "secondary"}
        className="absolute top-2 left-2 text-xs font-bold"
      >
        {index === 0 ? t("mainPhoto") : index + 1}
      </Badge>

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-md cursor-grab active:cursor-grabbing hover:bg-background transition-colors"
        aria-label={`Drag to reorder photo ${index + 1}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Delete button */}
      {onDelete && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute bottom-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(url)
          }}
          aria-label={`Delete photo ${index + 1}`}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
