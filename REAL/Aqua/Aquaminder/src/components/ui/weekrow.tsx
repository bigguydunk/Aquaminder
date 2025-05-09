import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekRow() {
  const today = new Date();
  const currentDay = today.getDay();
  const currentDate = today.getDate();
  const [currentWeek, setCurrentWeek] = useState(5); // Centered at the 5th week (current week)
  const [selectedDay, setSelectedDay] = useState<{ week: number; day: number } | null>(null);
  const [carouselApi, setCarouselApi] = useState(null);

  const generateWeekDates = (weekOffset: number) => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(today.getDate() - today.getDay() + index + weekOffset * 7);
      return date.getDate();
    });
  };

  const weeks = Array.from({ length: 11 }, (_, index) => generateWeekDates(index - 5));

  const handleDayClick = (weekIndex: number, dayIndex: number) => {
    setSelectedDay({ week: weekIndex, day: dayIndex });
  };





  return (
    <div style={{ userSelect: 'none' }}>
      <div className="relative">
        <div className="w-full h-[1px] bg-black mb-2"></div>
        <Carousel
        >
          <CarouselPrevious
            variant="ghost"
            className="!bg-transparent text-black hover:bg-gray-100 w-10 h-10 rounded-full"
          />

<CarouselContent className="relative flex mx-auto justify-center p-0 xl:w-[550px] lg:w-[500px] sm:w-[350px]">  {weeks.map((week, weekIndex) => (
    <CarouselItem
      key={weekIndex}
      className="flex w-full justify-evenly items-center px-0 min-w-full shrink-0 grow-0 basis-full !pl-0"
    >
      {days.map((day, dayIndex) => (
        <Card
          key={dayIndex}
          onClick={() => handleDayClick(weekIndex, dayIndex)}
          className={`text-center flex flex-col items-center justify-center border-none shadow-none relative z-10
            lg:h-16 lg:w-16 sm:h-14 sm:w-14 h-10 w-10
            transition-all duration-300 ease-in-out
            ${
              selectedDay?.week === weekIndex && selectedDay?.day === dayIndex
                ? "bg-white text-black opacity-100 " 
                : weekIndex === 5 && currentDay === dayIndex
                ? "bg-blue-500 text-white opacity-100"
                : "bg-transparent text-black bg-opacity-50"
            } cursor-pointer !pl-0`}
        >
          <CardContent className="text-sm font-semibold p-0 flex flex-col items-center justify-center lg:text-lg sm:text-md text-xs">
            {day}
            <div className="text-xs mt-1 sm:text-sm">
              {week[dayIndex]}
            </div>
          </CardContent>
        </Card>
      ))}
    </CarouselItem>
  ))}
</CarouselContent>

          <CarouselNext
            variant="ghost"
            className="!bg-transparent text-black hover:bg-gray-100 w-10 h-10 rounded-full"
          />
        </Carousel>
        <div className="w-full h-[1px] bg-black mt-2"></div>
      </div>
    </div>
  );
}
