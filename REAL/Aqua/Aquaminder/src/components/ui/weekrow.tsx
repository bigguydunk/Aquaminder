import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekRow() {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const [currentWeek, setCurrentWeek] = useState(0);
  const [slidingX, setSlidingX] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleCardClick = (index: number) => {
    setSelectedDay(index);
    const cardEl = cardRefs.current[index];
    if (cardEl) {
      setSlidingX(cardEl.offsetLeft);
    }
  };

  useEffect(() => {
    const initialCard = cardRefs.current[today.getDay()];
    if (initialCard) {
      setSlidingX(initialCard.offsetLeft);
    }
  }, []);

  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(today.getDate() - today.getDay() + index + currentWeek * 7);
    return date.getDate();
  });

  return (
    <div className="relative">
      <div className="w-full h-[1px] bg-black mb-4"></div>
      <div className="relative flex items-center">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentWeek((prev) => prev - 1)}
          className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-transparent text-black w-8 h-8 rounded-full z-20 sm:w-10 sm:h-10"
        >
          &lt;
        </button>

        {/* Week Days */}
        <div className="grid grid-cols-7 gap-2 w-full sm:gap-4 relative">
          {/* Sliding background */}
          <div
            className="absolute top-0 left-0 h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-lg transition-transform duration-300 z-0"
            style={{ transform: `translateX(${slidingX}px)` }}
          ></div>

          {days.map((day, index) => (
            <div
              key={day}
              className="relative"
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
            >
              <Card
                onClick={() => handleCardClick(index)}
                className="text-center h-16 w-16 flex flex-col items-center justify-center transition-colors p-2 cursor-pointer border-none shadow-none relative z-10 bg-transparent sm:h-20 sm:w-20 sm:p-4"
              >
                <CardContent className="text-sm font-semibold p-0 flex flex-col items-center justify-center sm:text-xl">
                  {day}
                  <div className="text-xs mt-1 sm:text-base">
                    {weekDates[index]}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentWeek((prev) => prev + 1)}
          className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-transparent text-black w-8 h-8 rounded-full z-20 sm:w-10 sm:h-10"
        >
          &gt;
        </button>
      </div>
      <div className="w-full h-[1px] bg-black mt-4"></div>
    </div>
  );
}
