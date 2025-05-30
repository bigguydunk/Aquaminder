import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@heroui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"

import { TimePickerDemo } from "@/components/ui/timePicker";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

import { Label } from "@/components/ui/label";

import supabase from '../../../supabaseClient';

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as RadixDialog from '@radix-ui/react-dialog';
import { ToastContext } from '@/components/ui/toast';

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
import SimplificationSVG from "../../assets/Simplification.svg?react";

// Add props for conditional rendering
export default function WeekRow({ onlyAddScheduleBox = false, onlyCalendar = false, selectedDay: externalSelectedDay, setSelectedDay: externalSetSelectedDay }: {
  onlyAddScheduleBox?: boolean,
  onlyCalendar?: boolean,
  selectedDay?: { week: number; day: number } | null,
  setSelectedDay?: React.Dispatch<React.SetStateAction<{ week: number; day: number } | null>>
} = {}) {
  const today = new Date();
  const currentDay = today.getDay();
  // Use external state if provided, otherwise use internal state
  const [internalSelectedDay, internalSetSelectedDay] = useState<{ week: number; day: number } | null>({ week: 5, day: currentDay });
  const selectedDay = externalSelectedDay !== undefined ? externalSelectedDay : internalSelectedDay;
  const setSelectedDay = externalSetSelectedDay !== undefined ? externalSetSelectedDay : internalSetSelectedDay;
  const [akuariumOptions, setAkuariumOptions] = useState<{ akuarium_id: number }[]>([]);
  const [tugasOptions, setTugasOptions] = useState<{ tugas_id: number; deskripsi_tugas: string | null }[]>([]);
  const [userOptions, setUserOptions] = useState<{ user_id: number; username: string }[]>([]);
  const [selectedAkuarium, setSelectedAkuarium] = useState<number | null>(null);
  const [selectedTugas, setSelectedTugas] = useState<{ tugas_id: number; deskripsi_tugas: string | null } | null>(null);
  const [selectedUser, setSelectedUser] = useState<{ user_id: number; username: string } | null>(null);
  const [time, setTime] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // user_id is string in your schema
  const [userRole, setUserRole] = useState<number | null>(null);
  const location = useLocation();
  const email = location.state?.email;
  const toastCtx = useContext(ToastContext);

  // Set your Supabase project ref here (from your Supabase URL, e.g. abcd1234)
  const SUPABASE_PROJECT_REF = "your-project-ref"; // <-- CHANGE THIS to your actual project ref

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

    const fetchTugasData = async () => {
      const { data, error } = await supabase.from('tugas').select('tugas_id, deskripsi_tugas');
      if (error) {
        console.error('Error fetching tugas data:', error);
      } else {
        setTugasOptions(data || []);
      }
    };
    fetchTugasData();

    const fetchUserData = async () => {
      const { data, error } = await supabase.from('users').select('user_id, username');
      if (error) {
        console.error('Error fetching user data:', error);
      } else {
        setUserOptions(data || []);
      }
    };
    fetchUserData();

    // Get current user from Supabase Auth, checking localStorage if needed
    const fetchUserRole = async () => {
      let userId = null;
      // Try to get user from Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      } else {
        // Fallback: try to get user from localStorage (Supabase stores session here by default)
        const sessionStr = localStorage.getItem('sb-' + SUPABASE_PROJECT_REF + '-auth-token');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            userId = session?.user?.id;
          } catch {}
        }
      }
      if (userId) {
        setCurrentUserId(userId);
        // Fetch role from users table
        const { data } = await supabase
          .from('users')
          .select('username, role')
          .eq('user_id', userId)
          .single();
        if (data) {
          setUserName(data.username);
          setUserRole(typeof data.role === 'number' ? data.role : Number(data.role));
        }
      }
    };
    fetchUserRole();
  }, [email]);

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

  // Helper to get the selected date from the calendar week/day selection
  const getSelectedDate = () => {
    if (!selectedDay) return null;
    // Calculate the base date for the first day (Sunday) of the selected week
    const baseDate = new Date(today);
    baseDate.setHours(0, 0, 0, 0);
    // Move to the first day (Sunday) of the selected week
    baseDate.setDate(today.getDate() - today.getDay() + (selectedDay.week - 5) * 7);
    // Now move to the selected day in that week
    baseDate.setDate(baseDate.getDate() + selectedDay.day);
    return baseDate;
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAkuarium || !selectedTugas || !selectedUser || !time || !userName || !selectedDay || !currentUserId) {
      let missingFields = [];
      if (!selectedAkuarium) missingFields.push('Aquarium');
      if (!selectedTugas) missingFields.push('Tugas');
      if (!selectedUser) missingFields.push('User');
      if (!time) missingFields.push('Time');
      if (!userName) missingFields.push('Current User');
      if (!selectedDay) missingFields.push('Selected Day');
      if (!currentUserId) missingFields.push('Current User ID');
      toastCtx?.showToast({
        title: 'Missing Fields',
        description: 'Some required fields are missing: ' + missingFields.join(', ') + '. Data not sent.',
        variant: 'error',
      });
      return;
    }
    setLoading(true);
    // Combine selected calendar date with selected time
    const selectedDate = getSelectedDate();
    if (!selectedDate) {
      setLoading(false);
      toastCtx?.showToast({
        title: 'Tanggal tidak valid',
        description: 'Tanggal tidak valid. Data not sent.',
        variant: 'error',
      });
      return;
    }
    // Set the time from TimePickerDemo
    selectedDate.setHours(time.getHours());
    selectedDate.setMinutes(time.getMinutes());
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);
    // Convert to Asia/Jakarta (WIB) timezone ISO string
    const tanggalJakarta = selectedDate.toISOString();
    const insertData = {
      akuarium_id: selectedAkuarium,
      tugas_id: selectedTugas.tugas_id,
      user_id: selectedUser.user_id,
      tanggal: tanggalJakarta,
      created_by: currentUserId, // Use the user ID instead of userName
    };
    const { error } = await supabase.from('jadwal').insert([insertData]);
    setLoading(false);
    if (!error) {
      toastCtx?.showToast({
        title: 'Success',
        description: 'Data successfully sent to Supabase!',
        variant: 'success',
      });
      setSelectedAkuarium(null);
      setSelectedTugas(null);
      setSelectedUser(null);
      setTime(new Date());
    } else {
      toastCtx?.showToast({
        title: 'Gagal menambah jadwal',
        description: error.message,
        variant: 'error',
      });
    }
  };

  return (
    <div className="w-full flex flex-col  md:flex-col lg:pl-10 md:pl-20 lg:-pl-0" >
      {/* Desktop: Two columns for Add Schedule and Calendar, schedule list below in two columns */}
      <div className="w-full flex flex-col  lg:flex-row  md:items-start gap-5">
        {/* Calendar (left) */}
        {!onlyAddScheduleBox && (
          <div className=" flex flex-col md:items-start items-center order-1 md:order-1">
            <div className="relative max-w-[470px] w-[90%] sm:w-full !h-auto ">
              {/* Calendar Section */}
              {!onlyAddScheduleBox && (
                <div className="relative  bg-[#26648B] px-2 rounded-md h-full shadow-lg py-2">
                  <div className="w-full sm:h-[2px] bg-transparent mb-2"></div>
                  <div className="w-full flex text-[#FFE3B3] items-start mb-0 pl-2 text-base leading-tight">
                    {(() => {
                      const selectedDate = getSelectedDate();
                      if (!selectedDate) return null;
                      const month = selectedDate.toLocaleString('en-US', { month: 'long' });
                      const day = selectedDate.getDate();
                      const weekday = selectedDate.toLocaleString('en-US', { weekday: 'long' });
                      return (
                        <span className="text-lg">
                          <span className="font-bold">{month}</span>
                          {`, ${day} `}
                          <span>{weekday}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <Carousel>
                    {/* Carousel navigation buttons at top right, but inside Carousel for context */}
                    <div className="absolute -top-5 right-11 flex gap-2 z-20">
                      <CarouselPrevious
                        variant="ghost"
                        className="focus:outline-none focus-visible:outline-none !bg-[transparent] text-[#FFE3B3] focus:!outline-none hover:!text-[#FFE3B3] hover:bg-gray-100 w-10 h-10 rounded-md"
                      />
                      <CarouselNext
                        variant="ghost"
                        className="focus:outline-none focus-visible:outline-none !bg-transparent text-[#FFE3B3] hover:!text-[#FFE3B3] hover:bg-gray-100 w-10 h-10 rounded-full"
                      />
                    </div>
                    <CarouselContent className="relative flex mx-auto justify-center p-0 xl:w-[450px] lg:w-[450px] sm:w-[450px]">
                      {weeks.map((week, weekIndex) => (
                        <CarouselItem
                          key={weekIndex}
                          className="flex w-full justify-evenly items-center px-0 min-w-full shrink-1 grow-0 basis-full !pl-0"
                        >
                          {week.map((dateNum, dayIndex) => (
                            <div key={dayIndex} className="flex flex-col items-center">
                              <Card
                                onClick={() => handleDayClick(weekIndex, dayIndex)}
                                className={`text-center flex flex-col items-center justify-center border-none shadow-none relative z-10
                                   !h-10 w-10 sm:!h-14 sm:w-14
                                  transition-all duration-300 ease-in-out
                                  ${
                                    selectedDay?.week === weekIndex && selectedDay?.day === dayIndex
                                      ? "bg-[#0F354D] text-[#FFE3B3] shadow-md rounded-md h-16" 
                                      : weekIndex === 5 && currentDay === dayIndex
                                      ? "bg-[#4F8FBF] text-[#FFE3B3] shadow-md rounded-md h-16"
                                      : "!bg-[#FFE3B3] text-[#26648B] rounded-md h-16"
                                  } cursor-pointer !pl-0`}
                              >
                                <CardContent className="flex flex-col items-center justify-center p-0">
                                  <span className="text-lg font-semibold mb-0.5">{dateNum}</span>
                                  <span className="text-xs sm:text-sm lg:text-base mt-0">{days[dayIndex]}</span>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                  <div className="w-full h-[1px] bg-transparent mt-2"></div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Add Schedule Box (right) */}
        {!onlyCalendar && (
          <div className="pl-[5%] md:pl-0 w-full flex flex-col items-center md:items-start order-2 md:order-2 ">
            {(userRole === 1 || userRole === 2) && (
              <div className="relative w-full max-w-[470px] h-30 items-center md:items-start">
                <div className="relative md:w-full w-[95%] max-w-[470px] h-4/4 ">
                  <div className="relative rounded-[15px] px-6 py-4 flex items-center justify-start w-full h-full shadow-lg bg-[#FFE3B3] z-10 space-x-4">
                    <RadixDialog.Root>
                      <RadixDialog.Trigger asChild>
                        <div className="rounded-md w-16 h-16 flex items-center justify-center cursor-pointer bg-[#26648B] transition-colors duration-150"
                          style={{ transition: 'transform 0.15s, opacity 0.15s' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          <span className="text-[#FFE3B3] text-2xl font-bold cursor-pointer">+</span>
                        </div>
                      </RadixDialog.Trigger>
                      <RadixDialog.Portal>
                        <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-1/3.5 min-w-[90vw] text-[#26648B] sm:min-w-[425px] max-w-[95vw] sm:max-w-[425px] -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-4 sm:p-6 z-50">
                          <RadixDialog.Close asChild>
                            <button
                              type="button"
                              aria-label="Close"
                              className="absolute top-2 right-2 !bg-[#FFE3B3] text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
                              style={{ zIndex: 100 }}
                            >
                              ×
                            </button>
                          </RadixDialog.Close>
                          <RadixDialog.Title className="text-xl font-bold mb-2">Schedule</RadixDialog.Title>
                          <RadixDialog.Description className="mb-4">
                            Tambahkan jadwal baru.
                          </RadixDialog.Description>
                          <form onSubmit={handleSaveSchedule}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dropdown" className="text-right">
                                  Aquarium
                                </Label>
                                <div className="col-span-3">
                                  <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                      <Button
                                        className="capitalize w-full text-left !bg-[#FFE3B3]  !hover:bg-gray-200 !border !border-[#26648B] rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150"
                                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#bdbdbd' }}
                                      >
                                        {selectedAkuarium !== null ? `Aquarium ${selectedAkuarium}` : 'Pilih aquarium'}
                                      </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Portal>
                                      <DropdownMenu.Content className="!bg-[#FFE3B3] border rounded shadow-lg p-2 z-50">
                                        {akuariumOptions.map((option) => (
                                          <DropdownMenu.Item
                                            key={option.akuarium_id}
                                            onSelect={() => setSelectedAkuarium(option.akuarium_id)}
                                            className="!bg-[#FFE3B3] cursor-pointer hover:!bg-blue-100 active:!bg-blue-200 text-[#26648B] focus:!bg-blue-100 transition-colors"
                                          >
                                            Aquarium {option.akuarium_id}
                                          </DropdownMenu.Item>
                                        ))}
                                      </DropdownMenu.Content>
                                    </DropdownMenu.Portal>
                                  </DropdownMenu.Root>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tugas-dropdown" className="text-right">
                                  Tugas
                                </Label>
                                <div className="col-span-3">
                                  <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                     <Button
                                        className="capitalize w-full text-left !bg-[#FFE3B3]  !hover:bg-gray-200 !border  !border-[#26648B] rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150"
                                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#bdbdbd' }}
                                      >
                                        {selectedTugas ? (selectedTugas.deskripsi_tugas || `Tugas ${selectedTugas.tugas_id}`) : 'Pilih tugas'}
                                      </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Portal>
                                      <DropdownMenu.Content className="!bg-[#FFE3B3] border rounded shadow-lg p-2 z-50">
                                        {tugasOptions.map((option) => (
                                          <DropdownMenu.Item
                                            key={option.tugas_id}
                                            onSelect={() => setSelectedTugas(option)}
                                          className="!bg-#FFE3B3 cursor-pointer hover:!bg-blue-100 active:!bg-blue-200 text-[#26648B] focus:!bg-blue-100 transition-colors"
                                          >
                                            {option.deskripsi_tugas || `Tugas ${option.tugas_id}`}
                                          </DropdownMenu.Item>
                                        ))}
                                      </DropdownMenu.Content>
                                    </DropdownMenu.Portal>
                                  </DropdownMenu.Root>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="user-dropdown" className="text-right">
                                  User
                                </Label>
                                <div className="col-span-3">
                                  <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                      <Button
                                        className="capitalize w-full text-left !bg-[#FFE3B3] !hover:bg-gray-200 !border !border-[#26648B] rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150"
                                        style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#bdbdbd' }}
                                      >
                                        {selectedUser ? selectedUser.username : 'Pilih user'}
                                      </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Portal>
                                      <DropdownMenu.Content className="!bg-[#FFE3B3] border rounded shadow-lg p-2 z-50">
                                        {userOptions.map((option) => (
                                          <DropdownMenu.Item
                                            key={option.user_id}
                                            onSelect={() => setSelectedUser(option)}
                                            className="!bg-[#FFE3B3] cursor-pointer hover:!bg-blue-100 active:!bg-blue-200 text-[#26648B] focus:!bg-blue-100 transition-colors"
                                          >
                                            {option.username}
                                          </DropdownMenu.Item>
                                        ))}
                                      </DropdownMenu.Content>
                                    </DropdownMenu.Portal>
                                  </DropdownMenu.Root>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tanggal-picker" className="text-right">
                                  Waktu
                                </Label>
                                <div className="col-span-3 flex justify-center">
                                  <TimePickerDemo date={time} setDate={setTime} />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-center w-full">
                              <Button type="submit" className="w-full !bg-[#0F354D] text-[#FFE3B3]" disabled={loading}>
                              {loading ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </form>
                        </RadixDialog.Content>
                      </RadixDialog.Portal>
                    </RadixDialog.Root>
                    <div className="flex-1 text-[#26648B] font-bold text-lg text-left sm:text-left ">
                      {"Tambah Jadwal Baru"}
                      {selectedDay && (
                        <div className="text-sm mt-1 font-normal">
                          {(() => {
                            const selectedDate = getSelectedDate();
                            return selectedDate ? selectedDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Schedule List: below, in one column on desktop */}
      <div className="w-full flex flex-col items-center mt-8">
        {currentUserId && selectedDay && (
          <ScheduleForUserBox
            userId={currentUserId}
            selectedDate={getSelectedDate()}
            tugasOptions={tugasOptions}
            akuariumOptions={akuariumOptions}
            userRole={userRole ?? undefined}
          />
        )}
      </div>
    </div>
  );
}

import { useEffect as useEffectBox, useState as useStateBox } from 'react';

// Update ScheduleForUserBox to always use two-column layout for all users
function ScheduleForUserBox({ userId, selectedDate, tugasOptions, akuariumOptions, userRole }: {
  userId: string,
  selectedDate: Date | null,
  tugasOptions: { tugas_id: number; deskripsi_tugas: string | null }[],
  akuariumOptions: { akuarium_id: number }[],
  userRole?: number, // Add userRole as optional prop
}) {
  const [_hasSchedule, setHasSchedule] = useStateBox(false);
  const [loading, setLoading] = useStateBox(true);
  const [_schedules, setSchedules] = useStateBox<any[]>([]);
  const [_userMap, setUserMap] = useStateBox<{ [key: number]: string }>({});
  // Always fetch all schedules for the day, but for employees only show their own
  const [allSchedules, setAllSchedules] = useStateBox<any[]>([]);
  const [allUserMap, setAllUserMap] = useStateBox<{ [key: number]: string }>({});

  useEffectBox(() => {
    supabase.from('users').select('user_id, username').then(({ data }) => {
      if (data) {
        const map: { [key: number]: string } = {};
        data.forEach((u: { user_id: number; username: string }) => { map[u.user_id] = u.username; });
        setUserMap(map);
        setAllUserMap(map);
      }
    });
  }, []);

  useEffectBox(() => {
    if (!userId || !selectedDate) return;
    setLoading(true);
    const dayStringDate = new Date(selectedDate);
    dayStringDate.setDate(dayStringDate.getDate() + 1);
    const dayString = dayStringDate.toISOString().slice(0, 10);
    // Always fetch all schedules for the day
    supabase
      .from('jadwal')
      .select('*')
      .gte('tanggal', dayString + 'T00:00:00+07:00')
      .lte('tanggal', dayString + 'T23:59:59+07:00')
      .then(({ data }) => {
        setAllSchedules(data || []);
        // For employees, filter only their own
        if (userRole !== 1 && userRole !== 2) {
          const own = (data || []).filter((s: any) => s.user_id === userId);
          setSchedules(own);
          setHasSchedule(own.length > 0);
        } else {
          setHasSchedule(false); // not used for manager layout
        }
        setTimeout(() => setLoading(false), 200);
      });
  }, [userId, selectedDate, userRole]);

  // Skeleton loading UI
  if (loading) {
    return (
      <div className="relative w-full flex flex-col lg:flex-row items-center md:items-start mt-4 mx-auto gap-6">
        <div className="w-full lg:w-[470px] flex flex-col items-center md:items-start">
          <div className="relative rounded-[15px] px-6 py-4 flex items-center gap-4 !h-30 w-[90%] md:w-full max-w-[470px] h-full bg-[#4F8FBF] z-10 mb-2 shadow-md">
            <div className="rounded-xl w-16 h-16 flex items-center justify-center bg-[#FFE3B3] text-[#26648B] text-3xl font-bold">
              –
            </div>
            <div className="flex-1 text-[#FFE3B3] font-bold text-lg text-left">
              <div className="h-6 w-1/2 mb-2 bg-[#FFE3B3] rounded animate-pulse" />
              <div className="h-4 w-1/4 bg-[#FFE3B3] rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col"></div>
      </div>
    );
  }

  // Always use two-column layout for all users
  const leftCol: any[] = [];
  const rightCol: any[] = [];
  let displaySchedules = allSchedules;
  if (userRole !== 1 && userRole !== 2) {
    // For employees, only show their own schedules
    displaySchedules = allSchedules.filter((s: any) => s.user_id === userId);
  }
  displaySchedules
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    .forEach((schedule, idx) => {
      (idx % 2 === 0 ? leftCol : rightCol).push(schedule);
    });

  // If there are schedules, show them in two columns for md+ and single col for mobile
  if (displaySchedules.length) {
    return (
      <>
        {/* Mobile: single column, chronological order */}
        <div className="w-full flex flex-col items-center mt-4 gap-0 md:hidden">
          {displaySchedules.map((schedule, idx) => {
            const isOwn = schedule.user_id === userId;
            return (
              <div
                key={schedule.jadwal_id || `mobile-${idx}`}
                className={`relative rounded-[15px] px-6 py-4 flex items-center gap-4 max-w-[470px] w-[90%] !h-30 bg-[#4F8FBF] z-10 mb-2 shadow-md`}
              >
                {/* X button for delete, only show if userRole is 1 or 2 */}
                {(userRole === 1 || userRole === 2) && (
                  <RadixDialog.Root>
                    <RadixDialog.Trigger asChild>
                      <button
                        className="absolute top-2 right-2 text-[#FFE3B3] hover:text-red text-xl font-bold bg-transparent border-none cursor-pointer z-20"
                        style={{ background: 'transparent' }}
                        title="Delete schedule"
                        type="button"
                      >
                        ×
                      </button>
                    </RadixDialog.Trigger>
                    <RadixDialog.Portal>
                      <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                      <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                        <RadixDialog.Title className="text-lg font-bold mb-2 text-[#26648B]">Delete Schedule</RadixDialog.Title>
                        <RadixDialog.Description className="mb-4 text-[#26648B] text-center">
                          Are you sure you want to delete this schedule?
                        </RadixDialog.Description>
                        <div className="flex gap-4 justify-center mt-2">
                          <Button
                            className="!bg-red-600 text-white hover:bg-red-700"
                            onClick={async () => {
                              await supabase.from('jadwal').delete().eq('jadwal_id', schedule.jadwal_id);
                              setAllSchedules((prev) => prev.filter((s) => s.jadwal_id !== schedule.jadwal_id));
                            }}
                          >
                            Yes
                          </Button>
                          <RadixDialog.Close asChild>
                            <Button className="!bg-[#26648B] !text-[#FFE3B3] ">No</Button>
                          </RadixDialog.Close>
                        </div>
                      </RadixDialog.Content>
                    </RadixDialog.Portal>
                  </RadixDialog.Root>
                )}
                <div className="rounded-md w-16 h-16 flex items-center justify-center bg-[#FFE3B3] text-[#FFE3B3] text-3xl font-bold ">
                  <SimplificationSVG style={{ width: '80%', height: 'auto' }} strokeWidth={1} />
                </div>
                <div className="flex-1 text-[#FFE3B3] font-bold text-lg text-left sm:text-left relative flex flex-col">
                  <div>
                    {schedule.tugas_id && tugasOptions.length > 0
                      ? tugasOptions.find((t: { tugas_id: number; deskripsi_tugas: string | null }) => t.tugas_id === schedule.tugas_id)?.deskripsi_tugas || `Tugas ${schedule.tugas_id}`
                      : 'Tugas tidak ditemukan'}
                  </div>
                  {schedule.akuarium_id && schedule.tanggal && akuariumOptions.length > 0 && (
                    <div className="text-sm font-normal text-[#FFE3B3] mt-1 flex items-center gap-2 relative">
                      <span className="font-semibold">{new Date(schedule.tanggal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>{` ⚲ Akuarium ${schedule.akuarium_id}`}
                      {(userRole === 1 || userRole === 2) && !isOwn && schedule.user_id && allUserMap[schedule.user_id] && (
                        <span className="absolute -bottom-7 -right-4">
                          <Badge variant="outline" className="!border-[#26648B] !text-[#FFE3B3]">{allUserMap[schedule.user_id]}</Badge>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop/tablet: two columns */}
        <div className="relative w-full flex-col lg:flex-row items-start lg:gap-5 gap-0 justify-center mt-4 mx-auto hidden md:flex">
          <div className="w-full max-w-[470px] flex flex-col md:items-start items-center">
            {leftCol.map((schedule, idx) => {
              const isOwn = schedule.user_id === userId;
              return (
                <div
                  key={schedule.jadwal_id || `left-${idx}`}
                  className={`relative rounded-[15px] px-6 py-4 flex items-center gap-4 max-w-[470px] w-[90%] md:w-full !h-30 bg-[#4F8FBF] z-10 mb-2 shadow-md`}
                >
                  {/* X button for delete, only show if userRole is 1 or 2 */}
                  {(userRole === 1 || userRole === 2) && (
                    <RadixDialog.Root>
                      <RadixDialog.Trigger asChild>
                        <button
                          className="absolute top-2 right-2 text-[#FFE3B3] hover:text-red text-xl font-bold bg-transparent border-none cursor-pointer z-20"
                          style={{ background: 'transparent' }}
                          title="Delete schedule"
                          type="button"
                        >
                          ×
                        </button>
                      </RadixDialog.Trigger>
                      <RadixDialog.Portal>
                        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                          <RadixDialog.Title className="text-lg font-bold mb-2 text-[#26648B]">Delete Schedule</RadixDialog.Title>
                          <RadixDialog.Description className="mb-4 text-[#26648B] text-center">
                            Are you sure you want to delete this schedule?
                          </RadixDialog.Description>
                          <div className="flex gap-4 justify-center mt-2">
                            <Button
                              className="!bg-red-600 text-white hover:bg-red-700"
                              onClick={async () => {
                                await supabase.from('jadwal').delete().eq('jadwal_id', schedule.jadwal_id);
                                setAllSchedules((prev) => prev.filter((s) => s.jadwal_id !== schedule.jadwal_id));
                              }}
                            >
                              Yes
                            </Button>
                            <RadixDialog.Close asChild>
                              <Button className="!bg-[#FFE3B3] !text-[#26648B] ">No</Button>
                            </RadixDialog.Close>
                          </div>
                        </RadixDialog.Content>
                      </RadixDialog.Portal>
                    </RadixDialog.Root>
                  )}
                  <div className="rounded-md w-16 h-16 flex items-center justify-center bg-[#FFE3B3] text-[#FFE3B3] text-3xl font-bold ">
                    <SimplificationSVG style={{ width: '80%', height: 'auto' }} strokeWidth={1} />
                  </div>
                  <div className="flex-1 text-[#FFE3B3] font-bold text-lg text-left sm:text-left relative flex flex-col">
                    <div>
                      {schedule.tugas_id && tugasOptions.length > 0
                        ? tugasOptions.find((t: { tugas_id: number; deskripsi_tugas: string | null }) => t.tugas_id === schedule.tugas_id)?.deskripsi_tugas || `Tugas ${schedule.tugas_id}`
                        : 'Tugas tidak ditemukan'}
                    </div>
                    {schedule.akuarium_id && schedule.tanggal && akuariumOptions.length > 0 && (
                      <div className="text-sm font-normal text-[#FFE3B3] mt-1 flex items-center gap-2 relative">
                        <span className="font-semibold">{new Date(schedule.tanggal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>{` ⚲ Akuarium ${schedule.akuarium_id}`}
                        {(userRole === 1 || userRole === 2) && !isOwn && schedule.user_id && allUserMap[schedule.user_id] && (
                          <span className="absolute -bottom-7 -right-4">
                            <Badge variant="outline" className="!border-[#26648B] !text-[#FFE3B3]">{allUserMap[schedule.user_id]}</Badge>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="w-full flex flex-col md:items-start items-center">
            {rightCol.map((schedule, idx) => {
              const isOwn = schedule.user_id === userId;
              return (
                <div
                  key={schedule.jadwal_id || `right-${idx}`}
                  className={`relative rounded-[15px] px-6 py-4 flex items-center gap-4 max-w-[470px] w-[90%] md:w-full !h-30 bg-[#4F8FBF] z-10 mb-2 shadow-md`}
                >
                  {(userRole === 1 || userRole === 2) && (
                    <RadixDialog.Root>
                      <RadixDialog.Trigger asChild>
                        <button
                          className="absolute top-2 right-2 text-[#FFE3B3] hover:text-red-500 text-xl font-bold bg-transparent border-none cursor-pointer z-20"
                          style={{ background: 'transparent' }}
                          title="Delete schedule"
                          type="button"
                        >
                          ×
                        </button>
                      </RadixDialog.Trigger>
                      <RadixDialog.Portal>
                        <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                        <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-[#FFE3B3] rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                          <RadixDialog.Title className="text-lg font-bold mb-2 text-[#26648B]">Delete Schedule</RadixDialog.Title>
                          <RadixDialog.Description className="mb-4 text-[#26648B] text-center">
                            Are you sure you want to delete this schedule?
                          </RadixDialog.Description>
                          <div className="flex gap-4 justify-center mt-2">
                            <Button
                              className="!bg-red-600 text-white hover:bg-red-700"
                              onClick={async () => {
                                await supabase.from('jadwal').delete().eq('jadwal_id', schedule.jadwal_id);
                                setAllSchedules((prev) => prev.filter((s) => s.jadwal_id !== schedule.jadwal_id));
                              }}
                            >
                              Yes
                            </Button>
                            <RadixDialog.Close asChild>
                              <Button className="!bg-[#FFE3B3] !text-[#4F8FBF] !hover:bg-[#FFE3B3]">No</Button>
                            </RadixDialog.Close>
                          </div>
                        </RadixDialog.Content>
                      </RadixDialog.Portal>
                    </RadixDialog.Root>
                  )}
                  <div className="rounded-md w-16 h-16 flex items-center justify-center bg-[#FFE3B3] text-[#FFE3B3] text-3xl font-bold ">
                    <SimplificationSVG style={{ width: '80%', height: 'auto' }} strokeWidth={1} />
                  </div>
                  <div className="flex-1 text-[#FFE3B3] font-bold text-lg text-left sm:text-left relative flex flex-col">
                    <div>
                      {schedule.tugas_id && tugasOptions.length > 0
                        ? tugasOptions.find((t: { tugas_id: number; deskripsi_tugas: string | null }) => t.tugas_id === schedule.tugas_id)?.deskripsi_tugas || `Tugas ${schedule.tugas_id}`
                        : 'Tugas tidak ditemukan'}
                    </div>
                    {schedule.akuarium_id && schedule.tanggal && akuariumOptions.length > 0 && (
                      <div className="text-sm font-normal text-[#FFE3B3] mt-1 flex items-center gap-2 relative">
                        <span className="font-semibold">{new Date(schedule.tanggal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>{` ⚲ Akuarium ${schedule.akuarium_id}`}
                        {(userRole === 1 || userRole === 2) && !isOwn && schedule.user_id && allUserMap[schedule.user_id] && (
                          <span className="absolute -bottom-7 -right-4">
                            <Badge variant="outline" className="!border-[#26648B] !text-[#FFE3B3]">{allUserMap[schedule.user_id]}</Badge>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }
  // No schedules: show 'Tidak ada jadwal' in left column, left-aligned
  return (
    <div className="relative w-full flex flex-col lg:flex-row items-start mt-4 mx-auto gap-6">
      <div className="w-full lg:w-[470px] flex flex-col md:items-start items-center">
        <div className="relative rounded-[15px] px-6 py-4 flex items-center gap-4 max-w-[470px] !h-30 w-[90%] md:w-full bg-[#4F8FBF] z-10 mb-2 shadow-lg">
          <div className="rounded-xl w-16 h-16 flex items-center justify-center bg-[#FFE3B3] text-[#26648B] text-3xl font-bold">
            –
          </div>
          <div className="flex-1 text-[#FFE3B3] text-lg text-left font-bold">
            Tidak ada jadwal
            <div className="text-sm text-[#FFE3B3] mt-1 font-normal">
              {selectedDate && selectedDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col"></div>
    </div>
  );
}
//# sourceMappingURL=WeekRow.astro.js.map
