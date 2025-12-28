"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SortableImage } from "./sortable-image"
import { parseImages, getProxiedImageUrl } from "@/lib/image-utils"
import { Images, Save, Loader2, ImageIcon } from "lucide-react"

interface ImageReorderProps {
  imagesJson: string | null
  auctionId: string
}

export function ImageReorder({ imagesJson, auctionId }: ImageReorderProps) {
  const t = useTranslations("auctions")
  const initialImages = parseImages(imagesJson)
  const [images, setImages] = useState(initialImages)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        const newItems = arrayMove(items, oldIndex, newIndex)
        setHasChanges(true)
        return newItems
      })
    }

    setActiveId(null)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSaveMessage(null)

    try {
      const response = await fetch(`/api/admin/auctions/${auctionId}/images`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images }),
      })

      if (!response.ok) {
        throw new Error("Failed to save")
      }

      setHasChanges(false)
      setSaveMessage(t("orderSaved"))
      setTimeout(() => setSaveMessage(null), 3000)
    } catch {
      setSaveMessage("Error saving order")
    } finally {
      setSaving(false)
    }
  }

  const activeImage = activeId ? getProxiedImageUrl(activeId) : null

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            {t("photoManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p>{t("noImages")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Images className="h-5 w-5" />
          {t("photoManagement")}
        </CardTitle>
        <CardDescription>{t("dragToReorder")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <SortableImage key={url} id={url} url={url} index={index} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeImage && (
              <div className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-primary shadow-2xl">
                <Image
                  src={activeImage.url}
                  alt="Dragging"
                  fill
                  className="object-cover"
                  unoptimized={activeImage.unoptimized}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("saveOrder")}
              </>
            )}
          </Button>

          {saveMessage && (
            <span className="text-sm text-green-600 dark:text-green-400">
              {saveMessage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
