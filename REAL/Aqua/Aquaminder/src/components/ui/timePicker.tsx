import { Time } from "@internationalized/date";
import React, { useState } from "react";

export default function TimePickerOnly() {
  // State for start and end times
  const [start, setStart] = useState(new Time(8, 0));
  const [end, setEnd] = useState(new Time(17, 0));

  // Generate hour and minute options
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="w-full max-w-xl flex flex-col gap-6">
      <div className="flex flex-row gap-8 items-center">
        <div>
          <label className="block mb-1 font-semibold">Start Time</label>
          <div className="flex flex-row gap-2">
            <select
              className="bg-white text-black rounded p-2"
              value={start.hour}
              onChange={e => setStart(new Time(Number(e.target.value), start.minute))}
            >
              {hours.map(h => (
                <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
              ))}
            </select>
            <span>:</span>
            <select
              className="bg-white text-black rounded p-2"
              value={start.minute}
              onChange={e => setStart(new Time(start.hour, Number(e.target.value)))}
            >
              {minutes.map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
              ))}
            </select>
          </div>
        </div>
        <span className="font-bold text-lg">to</span>
        <div>
          <label className="block mb-1 font-semibold">End Time</label>
          <div className="flex flex-row gap-2">
            <select
              className="bg-white text-black rounded p-2"
              value={end.hour}
              onChange={e => setEnd(new Time(Number(e.target.value), end.minute))}
            >
              {hours.map(h => (
                <option key={h} value={h}>{h.toString().padStart(2, "0")}</option>
              ))}
            </select>
            <span>:</span>
            <select
              className="bg-white text-black rounded p-2"
              value={end.minute}
              onChange={e => setEnd(new Time(end.hour, Number(e.target.value)))}
            >
              {minutes.map(m => (
                <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <span className="text-md font-medium">Selected range: </span>
        <span className="font-mono">{start.toString().slice(0,5)} - {end.toString().slice(0,5)}</span>
      </div>
    </div>
  );
}