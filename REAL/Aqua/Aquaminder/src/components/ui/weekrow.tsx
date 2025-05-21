import { useState, useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@heroui/button";
import { Card, CardContent } from "@/components/ui/card";

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

export default function () {
  const today = new Date();
  const currentDay = today.getDay();
  const [selectedDay, setSelectedDay] = useState<{ week: number; day: number } | null>({ week: 5, day: currentDay });
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
    <div style={{ userSelect: 'none' }}>
      <div className="relative">
        <div className="w-full h-[2px] bg-transparent mb-2"></div>
        <div className="w-full h-[2px] bg-white mb-2 rounded-md shadow-lg"></div>
        <div className="w-full h-[2px] bg-transparent mb-2"></div>
        <Carousel>
          <CarouselPrevious
            variant="ghost"
            className="focus:outline-none focus-visible:outline-none !bg-transparent text-black hover:bg-gray-100 w-10 h-10 rounded-full"
          />
          <CarouselContent className="relative flex mx-auto justify-center p-0 xl:w-[550px] lg:w-[500px] sm:w-[300px]">
            {weeks.map((week, weekIndex) => (
              <CarouselItem
                key={weekIndex}
                className="flex w-full justify-evenly items-center px-0 min-w-full shrink-0 grow-0 basis-full !pl-0"
              >
                {week.map((dateNum, dayIndex) => (
                  <div key={dayIndex} className="flex flex-col items-center">
                    <div className="text-xs sm:text-sm lg:text-base text-gray-800 mb-1">
                      {days[dayIndex]}
                    </div>
                    <Card
                      onClick={() => handleDayClick(weekIndex, dayIndex)}
                      className={`text-center flex flex-col items-center justify-center border-none shadow-none relative z-10
                        lg:h-16 lg:w-16 sm:h-14 sm:w-14 
                        transition-all duration-300 ease-in-out
                        ${
                          selectedDay?.week === weekIndex && selectedDay?.day === dayIndex
                            ? "bg-white text-gray-800 opacity-100 shadow-md" 
                            : weekIndex === 5 && currentDay === dayIndex
                            ? "bg-[#3443E9] text-white opacity-100 shadow-md"
                            : "!bg-transparent text-gray-800"
                        } cursor-pointer !pl-0`}
                    >
                      <CardContent className="text-lg font-semibold p-0 flex flex-col items-center justify-center">
                        {dateNum}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext
            variant="ghost"
            className="focus:outline-none focus-visible:outline-none !bg-transparent text-black hover:bg-gray-100 w-10 h-10 rounded-full"
          />
        </Carousel>
        <div className="w-full h-[1px] bg-transparent mt-2"></div>
      </div>
      <div className="relative mt-4 flex-row justify-center items-center">
        {/* Only render the parent container and box if userRole is 1 or 2 */}
        {(userRole === 1 || userRole === 2) && (
          <div className="relative w-3/4 h-30 justify-center items-center mx-auto">
            <div className="relative w-full h-4/4">
              <div className="relative border-black border-1 border-dashed rounded-4xl px-6 p12-4 flex items-center justify-start w-full h-full bg-white z-10 space-x-4">
                <RadixDialog.Root>
                  <RadixDialog.Trigger asChild>
                    <div className="border-black border-1 border-dashed rounded-xl w-20 h-20 flex items-center justify-center cursor-pointer bg-[#76cef9] transition-colors duration-150"
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
                      <span className="text-gray-600 text-2xl cursor-pointer">+</span>
                    </div>
                  </RadixDialog.Trigger>
                  <RadixDialog.Portal>
                    <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
                    <RadixDialog.Content className="fixed left-1/2 top-1/2 w-1/3.5 sm:max-w-[425px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50">
                      <RadixDialog.Close asChild>
                        <button
                          type="button"
                          aria-label="Close"
                          className="absolute top-2 right-2 !bg-white text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
                          style={{ zIndex: 100 }}
                        >
                          ×
                        </button>
                      </RadixDialog.Close>
                      <RadixDialog.Title className="text-xl font-bold mb-2">Scheduler</RadixDialog.Title>
                      <RadixDialog.Description className="mb-4 text-gray-600">
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
                                    className="capitalize w-full text-left !bg-white !text-black !hover:bg-gray-200 !border rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150"
                                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#bdbdbd' }}
                                  >
                                    {selectedAkuarium !== null ? `Aquarium ${selectedAkuarium}` : 'Pilih aquarium'}
                                  </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content className="!bg-white border rounded shadow-md p-2 z-50">
                                    {akuariumOptions.map((option) => (
                                      <DropdownMenu.Item
                                        key={option.akuarium_id}
                                        onSelect={() => setSelectedAkuarium(option.akuarium_id)}
                                        className="!bg-white cursor-pointer hover:!bg-blue-100 active:!bg-blue-200 focus:!bg-blue-100 transition-colors"
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
                                    className="capitalize w-full text-left !bg-white !text-black !hover:bg-gray-200 !border rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150"
                                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#bdbdbd' }}
                                  >
                                    {selectedTugas ? (selectedTugas.deskripsi_tugas || `Tugas ${selectedTugas.tugas_id}`) : 'Pilih tugas'}
                                  </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content className="!bg-white border rounded shadow-md p-2 z-50">
                                    {tugasOptions.map((option) => (
                                      <DropdownMenu.Item
                                        key={option.tugas_id}
                                        onSelect={() => setSelectedTugas(option)}
                                        className="!bg-white cursor-pointer hover:!bg-blue-100 active:!bg-blue-200 focus:!bg-blue-100 transition-colors"
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
                                    className="capitalize w-full text-left !bg-white !text-black !hover:bg-gray-200 !border rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150"
                                    style={{ borderWidth: '1px', borderStyle: 'solid', borderColor: '#bdbdbd' }}
                                  >
                                    {selectedUser ? selectedUser.username : 'Pilih user'}
                                  </Button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                  <DropdownMenu.Content className="!bg-white border rounded shadow-md p-2 z-50">
                                    {userOptions.map((option) => (
                                      <DropdownMenu.Item
                                        key={option.user_id}
                                        onSelect={() => setSelectedUser(option)}
                                        className="!bg-white cursor-pointer hover:!bg-blue-100 active:!bg-blue-200 focus:!bg-blue-100 transition-colors"
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
                          <Button type="submit" className="w-full !bg-[#3443E9] text-white hover:bg-gray-800" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </form>
                    </RadixDialog.Content>
                  </RadixDialog.Portal>
                </RadixDialog.Root>
                <div className="flex-1 text-gray-500 text-lg text-center sm:text-left">
                  {"Tambah Jadwal Baru"}
                  {selectedDay && (
                    <div className="text-sm mt-1">
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
        {/* Add margin between add-schedule box and schedule list */}
        <div className="my-10" />
        {/* New: Show box if user has a schedule on the selected day */}
        {currentUserId && selectedDay && (
          <ScheduleForUserBox
            userId={currentUserId}
            selectedDate={getSelectedDate()}
            tugasOptions={tugasOptions}
            akuariumOptions={akuariumOptions}
            userRole={userRole ?? undefined} // Ensure userRole is number or undefined
          />
        )}
      </div>
    </div>
  );
}

import { useEffect as useEffectBox, useState as useStateBox } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Update ScheduleForUserBox to accept userId as string
function ScheduleForUserBox({ userId, selectedDate, tugasOptions, akuariumOptions, userRole }: {
  userId: string,
  selectedDate: Date | null,
  tugasOptions: { tugas_id: number; deskripsi_tugas: string | null }[],
  akuariumOptions: { akuarium_id: number }[],
  userRole?: number // Add userRole as optional prop
}) {
  const [hasSchedule, setHasSchedule] = useStateBox(false);
  const [loading, setLoading] = useStateBox(true);
  const [schedules, setSchedules] = useStateBox<any[]>([]);
  const [userMap, setUserMap] = useStateBox<{ [key: number]: string }>({});

  // If manager/supervisor, show all users' schedules for the day
  const [allSchedules, setAllSchedules] = useStateBox<any[]>([]);
  const [allUserMap, setAllUserMap] = useStateBox<{ [key: number]: string }>({});

  useEffectBox(() => {
    // Fetch all users for mapping user_id to username
    supabase.from('users').select('user_id, username').then(({ data }) => {
      if (data) {
        const map: { [key: number]: string } = {};
        data.forEach((u: { user_id: number; username: string }) => { map[u.user_id] = u.username; });
        setUserMap(map);
      }
    });
  }, []);

  useEffectBox(() => {
    if (!userId || !selectedDate) return;
    setLoading(true);
    const dayStringDate = new Date(selectedDate);
    dayStringDate.setDate(dayStringDate.getDate() + 1);
    const dayString = dayStringDate.toISOString().slice(0, 10);
    supabase
      .from('jadwal')
      .select('*')
      .eq('user_id', userId)
      .gte('tanggal', dayString + 'T00:00:00+07:00')
      .lte('tanggal', dayString + 'T23:59:59+07:00')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setHasSchedule(true);
          setSchedules(data);
        } else {
          setHasSchedule(false);
          setSchedules([]);
        }
        setTimeout(() => setLoading(false), 150); 
      });
  }, [userId, selectedDate]);

  useEffectBox(() => {
    if ((userRole === 1 || userRole === 2) && selectedDate) {
      setLoading(true);
      const dayStringDate = new Date(selectedDate);
      dayStringDate.setDate(dayStringDate.getDate() + 1);
      const dayString = dayStringDate.toISOString().slice(0, 10);
      supabase
        .from('jadwal')
        .select('*')
        .gte('tanggal', dayString + 'T00:00:00+07:00')
        .lte('tanggal', dayString + 'T23:59:59+07:00')
        .then(({ data }) => {
          setAllSchedules(data || []);
          setTimeout(() => setLoading(false), 200); // Delay loading state by 200ms
        });
      // Fetch all users for mapping user_id to username
      supabase.from('users').select('user_id, username').then(({ data }) => {
        if (data) {
          const map: { [key: number]: string } = {};
          data.forEach((u: { user_id: number; username: string }) => { map[u.user_id] = u.username; });
          setAllUserMap(map);
        }
      });
    }
  }, [userRole, selectedDate]);

  // Skeleton loading UI
  if (loading) {
    return (
      <div className="relative w-3/4 flex flex-col items-center justify-center mt-4 mx-auto gap-2">
        <div className="relative border-black border-1 rounded-4xl px-6 py-4 flex items-center gap-4 w-full max-w-xl h-full bg-white z-10 mb-2 shadow-md opacity-70">
          <Skeleton className="border-white border-2 rounded-xl w-20 h-20 flex items-center justify-center !border-1 !border-black" />
          <div className="flex-1">
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3 mb-1" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  // Default: always show the 'No schedule for the day' box
  let scheduleBox = (
    <div className="relative w-3/4 flex flex-col items-center justify-center mt-4 mx-auto gap-2">
      <div className="relative border-black border-1 rounded-4xl px-6 py-4 flex items-center gap-4 w-full max-w-xl h-full bg-white z-10 mb-2 shadow-md opacity-70">
        <div className="border-white border-2 rounded-xl w-20 h-20 flex items-center justify-center bg-gray-200 text-gray-400 text-3xl font-bold !border-1 !border-black">
          –
        </div>
        <div className="flex-1 text-gray-500 text-lg text-left sm:text-left">
          No schedule for the day
          <div className="text-sm text-gray-400 mt-1">
            {selectedDate && selectedDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading || !selectedDate) return null;
  if ((userRole === 1 || userRole === 2)) {
    if (allSchedules.length) {
      scheduleBox = (
        <div className="relative w-3/4 flex flex-col items-center justify-center mt-4 mx-auto gap-2">
          {[...allSchedules]
            .sort((a, b) => {
              const isOwnA = a.user_id === userId;
              const isOwnB = b.user_id === userId;
              if (isOwnA && !isOwnB) return -1;
              if (!isOwnA && isOwnB) return 1;
              // Both are isOwn or both are not, sort by earliest
              return new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime();
            })
            .map((schedule, idx) => {
              const isOwn = schedule.user_id === userId;
              return (
                <div
                  key={schedule.jadwal_id || idx}
                  className={`relative border-black border-1 rounded-4xl px-6 py-4 flex items-center gap-4 w-full max-w-xl h-full bg-white z-10 mb-2 shadow-md ${!isOwn ? 'opacity-70 grayscale' : ''}`}
                >
                  {/* X button for delete, only show if userRole is 1 or 2 */}
                  <RadixDialog.Root>
                    <RadixDialog.Trigger asChild>
                      <button
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold bg-transparent !bg-transparent border-none cursor-pointer z-20"
                        style={{ background: 'transparent' }}
                        title="Delete schedule"
                        type="button"
                      >
                        ×
                      </button>
                    </RadixDialog.Trigger>
                    <RadixDialog.Portal>
                      <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                      <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                        <RadixDialog.Title className="text-lg font-bold mb-2">Delete Schedule</RadixDialog.Title>
                        <RadixDialog.Description className="mb-4 text-gray-600 text-center">
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
                            <Button className="!bg-gray-200 !text-black !hover:bg-gray-300">No</Button>
                          </RadixDialog.Close>
                        </div>
                      </RadixDialog.Content>
                    </RadixDialog.Portal>
                  </RadixDialog.Root>
                  <div className="border-white border-2 rounded-xl w-20 h-20 flex items-center justify-center bg-[#76cef9] text-white text-3xl font-bold !border-1 !border-black">
                    ✓
                  </div>
                  <div className="flex-1 text-black text-lg text-left sm:text-left">
                    {schedule.tugas_id && tugasOptions.length > 0
                      ? tugasOptions.find((t: { tugas_id: number; deskripsi_tugas: string | null }) => t.tugas_id === schedule.tugas_id)?.deskripsi_tugas || `Tugas ${schedule.tugas_id}`
                      : 'Tugas tidak ditemukan'}
                    {schedule.akuarium_id && akuariumOptions.length > 0 && (
                      <div className="text-sm text-black mt-1">
                        Akuarium {schedule.akuarium_id}
                      </div>
                    )}
                    <div className="text-sm text-black mt-1">
                      {schedule.tanggal ? new Date(schedule.tanggal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                    </div>
                    {/* Created by/for info at bottom right */}
                    <div className="absolute right-4 bottom-2 text-xs text-gray-500 italic">
                      {isOwn
                        ? (schedule.created_by ? `created by: ${allUserMap[schedule.created_by] || 'user'} ` : '')
                        : (schedule.user_id ? `created for: ${allUserMap[schedule.user_id] || 'user'} ` : '')}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      );
    }
    return scheduleBox;
  }
  // ...existing code for normal user...
  if (hasSchedule && schedules.length) {
    scheduleBox = (
      <div className="relative w-3/4 flex flex-col items-center justify-center mt-4 mx-auto gap-2">
        {[...schedules]
          .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
          .map((schedule, idx) => (
            <div key={schedule.jadwal_id || idx} className="relative border-black border-1 rounded-4xl px-6 py-4 flex items-center gap-4 w-full max-w-xl h-full bg-white z-10 mb-2 shadow-md">
              {/* X button for delete, only show if userRole is 1 or 2 */}
              {(userRole === 1 || userRole === 2) && (
                <RadixDialog.Root>
                  <RadixDialog.Trigger asChild>
                    <button
                      className="absolute top-2 right-2 !text-red-500 !hover:text-red-700 text-lg font-bold !bg-transparent border-none cursor-pointer z-20"
                      title="Delete schedule"
                      type="button"
                    >
                      ×
                    </button>
                  </RadixDialog.Trigger>
                  <RadixDialog.Portal>
                    <RadixDialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                    <RadixDialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-xs -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 flex flex-col items-center">
                      <RadixDialog.Title className="text-lg font-bold mb-2">Delete Schedule</RadixDialog.Title>
                      <RadixDialog.Description className="mb-4 text-gray-600 text-center">
                        Are you sure you want to delete this schedule?
                      </RadixDialog.Description>
                      <div className="flex gap-4 justify-center mt-2">
                        <Button
                          className="!bg-red-600 text-white hover:bg-red-700"
                          onClick={async () => {
                            await supabase.from('jadwal').delete().eq('jadwal_id', schedule.jadwal_id);
                            setSchedules((prev) => prev.filter((s) => s.jadwal_id !== schedule.jadwal_id));
                          }}
                        >
                          Yes
                        </Button>
                        <RadixDialog.Close asChild>
                          <Button className="!bg-gray-200 !text-black !hover:bg-gray-300">No</Button>
                        </RadixDialog.Close>
                      </div>
                    </RadixDialog.Content>
                  </RadixDialog.Portal>
                </RadixDialog.Root>
              )}
              <div className="border-white border-2 rounded-xl w-20 h-20 flex items-center justify-center bg-[#76cef9] text-white text-3xl font-bold !border-1 !border-black">
                ✓
              </div>
              <div className="flex-1 text-black text-lg text-left sm:text-left">
                {schedule.tugas_id && tugasOptions.length > 0
                  ? tugasOptions.find((t: { tugas_id: number; deskripsi_tugas: string | null }) => t.tugas_id === schedule.tugas_id)?.deskripsi_tugas || `Tugas ${schedule.tugas_id}`
                  : 'Tugas tidak ditemukan'}
                {schedule.akuarium_id && akuariumOptions.length > 0 && (
                  <div className="text-sm text-black mt-1">
                    Akuarium {schedule.akuarium_id}
                  </div>
                )}
                <div className="text-sm text-black mt-1">
                  {schedule.tanggal ? new Date(schedule.tanggal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                </div>
                {/* Created by info at bottom right */}
                <div className="absolute right-4 bottom-2 text-xs text-gray-500 italic">
                  {schedule.created_by ? `created by: ${userMap[schedule.created_by] || 'user'} ` : ''}
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }
  return scheduleBox;
}
