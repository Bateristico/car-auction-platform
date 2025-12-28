"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getProxiedImageUrl } from "@/lib/image-utils"
import { useTranslations } from "next-intl"

interface SortableImageProps {
  id: string
  url: string
  index: number
}

export function SortableImage({ id, url, index }: SortableImageProps) {
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
      className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
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
    </div>
  )
}
