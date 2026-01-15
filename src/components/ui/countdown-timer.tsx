"use client"

import * as React from "react"
import { useEffect, useState, useMemo } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  endDate: Date | string
  className?: string
  /** Threshold in seconds for urgent state (default: 3600 = 1 hour) */
  urgentThreshold?: number
  /** Threshold in seconds for critical state (default: 120 = 2 minutes) */
  criticalThreshold?: number
  /** Show labels like "days", "hours" etc */
  showLabels?: boolean
  /** Compact format: "2d 5h 30m" vs expanded */
  compact?: boolean
  /** Callback when countdown ends */
  onEnd?: () => void
  /** Show sniping protection warning when in critical zone */
  showSnipeWarning?: boolean
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

function calculateTimeLeft(endDate: Date): TimeLeft {
  const total = endDate.getTime() - Date.now()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    total,
  }
}

// Initial state for SSR - will be updated on client mount
const INITIAL_TIME_LEFT: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  total: 1, // Positive to avoid showing "Ended" during SSR
}

export function CountdownTimer({
  endDate,
  className,
  urgentThreshold = 3600, // 1 hour
  criticalThreshold = 120, // 2 minutes
  showLabels = false,
  compact = true,
  onEnd,
  showSnipeWarning = false,
}: CountdownTimerProps) {
  const parsedEndDate = useMemo(
    () => (typeof endDate === "string" ? new Date(endDate) : endDate),
    [endDate]
  )

  // Initialize with static values to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(INITIAL_TIME_LEFT)
  const [hasEnded, setHasEnded] = useState(false)

  // Calculate initial time only after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft(parsedEndDate))
  }, [parsedEndDate])

  useEffect(() => {
    if (!mounted) return

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(parsedEndDate)
      setTimeLeft(newTimeLeft)

      if (newTimeLeft.total <= 0 && !hasEnded) {
        setHasEnded(true)
        onEnd?.()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [parsedEndDate, hasEnded, onEnd, mounted])

  // Determine urgency state
  const totalSeconds = timeLeft.total / 1000
  const isUrgent = totalSeconds > 0 && totalSeconds <= urgentThreshold
  const isCritical = totalSeconds > 0 && totalSeconds <= criticalThreshold
  const isEnded = timeLeft.total <= 0

  // Format the time
  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  const renderTime = () => {
    // Show placeholder during SSR to avoid hydration mismatch
    if (!mounted) {
      return <span className="opacity-50">--:--:--</span>
    }

    if (isEnded) {
      return <span className="countdown-ended">Ended</span>
    }

    if (compact) {
      // Compact format: "2d 5h 30m" or "5h 30m 15s" or "30m 15s"
      const parts: string[] = []

      if (timeLeft.days > 0) {
        parts.push(`${timeLeft.days}d`)
        parts.push(`${timeLeft.hours}h`)
        parts.push(`${timeLeft.minutes}m`)
      } else if (timeLeft.hours > 0) {
        parts.push(`${timeLeft.hours}h`)
        parts.push(`${formatNumber(timeLeft.minutes)}m`)
        parts.push(`${formatNumber(timeLeft.seconds)}s`)
      } else {
        parts.push(`${timeLeft.minutes}m`)
        parts.push(`${formatNumber(timeLeft.seconds)}s`)
      }

      return <span>{parts.join(" ")}</span>
    }

    // Expanded format with colons
    if (timeLeft.days > 0) {
      return (
        <span>
          {timeLeft.days}:{formatNumber(timeLeft.hours)}:
          {formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      )
    }

    return (
      <span>
        {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:
        {formatNumber(timeLeft.seconds)}
      </span>
    )
  }

  const stateClass = isEnded
    ? "countdown-ended"
    : isCritical
      ? "countdown-critical"
      : isUrgent
        ? "countdown-urgent"
        : "countdown-normal"

  return (
    <div className={cn("space-y-1", className)}>
      <div
        className={cn(
          "font-mono-timer tabular-nums tracking-wider",
          stateClass
        )}
        data-testid={
          isCritical
            ? "countdown-urgent"
            : isEnded
              ? "countdown-ended"
              : "countdown"
        }
      >
        {renderTime()}
      </div>
      {showSnipeWarning && isCritical && !isEnded && (
        <p className="text-xs text-warning animate-pulse">
          Sniping protection active
        </p>
      )}
    </div>
  )
}

// Utility hook for countdown logic
export function useCountdown(endDate: Date | string) {
  const parsedEndDate = useMemo(
    () => (typeof endDate === "string" ? new Date(endDate) : endDate),
    [endDate]
  )

  // Initialize with static values to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(INITIAL_TIME_LEFT)

  // Calculate initial time only after mount
  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft(parsedEndDate))
  }, [parsedEndDate])

  useEffect(() => {
    if (!mounted) return

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(parsedEndDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [parsedEndDate, mounted])

  return {
    ...timeLeft,
    mounted,
    isEnded: timeLeft.total <= 0,
    isUrgent: timeLeft.total > 0 && timeLeft.total <= 3600000, // 1 hour
    isCritical: timeLeft.total > 0 && timeLeft.total <= 120000, // 2 minutes
  }
}
