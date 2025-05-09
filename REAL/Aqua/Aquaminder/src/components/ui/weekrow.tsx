import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import supabase from '../../../supabaseClient';

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeekRow() {
  const today = new Date();
  const currentDay = today.getDay();
  const currentDate = today.getDate();
  const [currentWeek, setCurrentWeek] = useState(5); // Centered at the 5th week (current week)
  const [selectedDay, setSelectedDay] = useState<{ week: number; day: number } | null>(null);
  const [carouselApi, setCarouselApi] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [akuariumOptions, setAkuariumOptions] = useState<{ akuarium_id: number }[]>([]);

  useEffect(() => {
    const fetchAkuariumData = async () => {
      const { data, error } = await supabase.from('akuarium').select('akuarium_id');
      if (error) {
        console.error('Error fetching akuarium data:', error);
      } else {
        setAkuariumOptions(data || []);
      }
    };

    fetchAkuariumData();
  }, []);

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
            className="focus:outline-none focus-visible:outline-none !bg-transparent text-black hover:bg-gray-100 w-10 h-10 rounded-full"
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
                ? "bg-[#3443E9] text-white opacity-100"
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
            className="focus:outline-none focus-visible:outline-none !bg-transparent text-black hover:bg-gray-100 w-10 h-10 rounded-full"
          />
        </Carousel>
        <div className="w-full h-[1px] bg-black mt-2"></div>
      </div>
      <div className="relative mt-4 flex justify-center">
        <div className="relative w-3/4 h-40">
         <div className="relative w-full h-4/4">
  <div className="relative  border-gray-500 border-2 rounded-4xl px-6 p12-4 flex items-center justify-start w-full h-full bg-[#3443E9]/30 z-10 space-x-4">
    {/* Blue box embedded inside card */}
    <div
      className="border-gray-500 border-2 rounded-xl w-24 h-24 flex items-center justify-center cursor-pointer bg-[#76cef9] transition-colors duration-150"
      onClick={() => setDialogOpen(true)}
      style={{ transition: 'background-color 0.15s, opacity 0.15s' }}
      onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'white';
      e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = '#76cef9';
      e.currentTarget.style.opacity = '1';
      }}
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
        <span className="text-gray-500 text-2xl font-bold cursor-pointer">+</span>
        </DialogTrigger>
        <DialogContent className="w-1/3 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
        Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dropdown" className="text-right">
          Aquarium
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="col-span-3 w-full text-left !bg-white !text-black !hover:bg-gray-200 !border !border-gray-300 rounded-md">
              Select an option
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {akuariumOptions.map((option) => (
              <DropdownMenuItem key={option.akuarium_id} onClick={() => console.log(`Akuarium ${option.akuarium_id} selected`)}>
                Akuarium {option.akuarium_id}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Username
        </Label>
        <Input
          id="username"
          defaultValue="@peduarte"
          className="col-span-3"
          onChange={(e) => console.log(e.target.value)} // Add an onChange handler to capture input
        />
        </div>
          
        </div>
        <DialogFooter>
            <Button type="submit" className="!bg-[#3443E9] text-white hover:bg-gray-800">
            Save changes
            </Button>
          
        </DialogFooter>
      </DialogContent>
      </Dialog>
    </div>
    
    {/* Text content beside the blue box */}
    <div className="flex-1 font-semibold text-gray-600 text-lg text-center sm:text-left">
      {"Tambah Jadwal Baru"}
    </div>
  </div>
</div>
        </div>
      </div>
    </div>  
  );
}
