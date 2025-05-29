"use client";
 
import * as React from "react";
import { TimePickerInput } from "./time-picker-input";
 
interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}
 
export function TimePickerDemo({ date, setDate }: TimePickerDemoProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
 
  return (
    <div className="flex items-end gap-2">
      <TimePickerInput
        picker="hours"
        date={date}
        setDate={setDate}
        ref={hourRef}
        onRightFocus={() => minuteRef.current?.focus()}
        className="w-[64px] h-10 text-2xl border !border-[#26648B] bg-transparent focus:bg-accent focus:text-accent-foreground rounded-md !font-inter"
      />
      <TimePickerInput
        picker="minutes"
        date={date}
        setDate={setDate}
        ref={minuteRef}
        onLeftFocus={() => hourRef.current?.focus()}
        className="w-[64px] h-10 text-2xl border !border-[#26648B] bg-transparent focus:bg-accent focus:text-accent-foreground rounded-md !font-inter"
      />
    </div>
  );
}