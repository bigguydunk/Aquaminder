"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TimePickerOnly({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [time, setTime] = React.useState<{ hour: number; minute: number }>({
    hour: new Date().getHours(),
    minute: new Date().getMinutes(),
  })

  function handleTimeChange(type: "hour" | "minute", value: number) {
    setTime((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-center">
          <span className="mb-1 font-medium">Hour</span>
          <ScrollArea className="h-12 w-16 overflow-y-auto rounded border">
            <div className="flex flex-col items-center justify-center">
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <Button
                  key={hour}
                  size="icon"
                  variant={time.hour === hour ? "default" : "ghost"}
                  className="w-10 h-10 my-1"
                  onClick={() => handleTimeChange("hour", hour)}
                >
                  {hour.toString().padStart(2, "0")}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <div className="flex flex-col items-center">
          <span className="mb-1 font-medium">Minute</span>
          <ScrollArea className="h-12 w-16 overflow-y-auto rounded border">
            <div className="flex flex-col items-center justify-center">
              {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                <Button
                  key={minute}
                  size="icon"
                  variant={time.minute === minute ? "default" : "ghost"}
                  className="w-10 h-10 my-1"
                  onClick={() => handleTimeChange("minute", minute)}
                >
                  {minute.toString().padStart(2, "0")}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      <div className="mt-4 text-center font-semibold">
        Selected Time: {time.hour.toString().padStart(2, "0")}
        :{time.minute.toString().padStart(2, "0")}
      </div>
    </div>
  )
}