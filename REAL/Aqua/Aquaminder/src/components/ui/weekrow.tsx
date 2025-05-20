import { useState, useEffect } from "react";
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
import { Time } from "@internationalized/date";
import * as RadixDialog from '@radix-ui/react-dialog';

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
  const [startTime, setStartTime] = useState<Time>(new Time(0, 0));
  const [endTime, setEndTime] = useState<Time>(new Time(0, 0));
  const [time, setTime] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const location = useLocation();
  const email = location.state?.email;

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

    if (email) {
      supabase
        .from('users')
        .select('user_id, username, role')
        .eq('email', email)
        .then(({ data, error }) => {
          if (data?.[0]) {
            setUserName(data[0].username);
            setCurrentUserId(data[0].user_id);
            setUserRole(typeof data[0].role === 'number' ? data[0].role : Number(data[0].role));
          }
        });
    }
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
    alert('Save button pressed. Starting to process data...');
    if (!selectedAkuarium || !selectedTugas || !selectedUser || !time || !userName || !selectedDay || !currentUserId) {
      let missingFields = [];
      if (!selectedAkuarium) missingFields.push('Aquarium');
      if (!selectedTugas) missingFields.push('Tugas');
      if (!selectedUser) missingFields.push('User');
      if (!time) missingFields.push('Time');
      if (!userName) missingFields.push('Current User');
      if (!selectedDay) missingFields.push('Selected Day');
      if (!currentUserId) missingFields.push('Current User ID');
      alert('Some required fields are missing: ' + missingFields.join(', ') + '. Data not sent.');
      return;
    }
    setLoading(true);
    // Combine selected calendar date with selected time
    const selectedDate = getSelectedDate();
    if (!selectedDate) {
      setLoading(false);
      alert('Tanggal tidak valid. Data not sent.');
      return;
    }
    // Set the time from TimePickerDemo
    selectedDate.setHours(time.getHours());
    selectedDate.setMinutes(time.getMinutes());
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);
    // Convert to Asia/Jakarta (WIB) timezone ISO string
    const tanggalJakarta = selectedDate.toISOString();
    alert('DEBUG: tanggal (Asia/Jakarta) to be sent to Supabase: ' + tanggalJakarta); // Debug alert
    const insertData = {
      akuarium_id: selectedAkuarium,
      tugas_id: selectedTugas.tugas_id,
      user_id: selectedUser.user_id,
      tanggal: tanggalJakarta,
      created_by: currentUserId, // Use the user ID instead of userName
    };
    alert('Attempting to send data to Supabase: ' + JSON.stringify(insertData));
    const { error } = await supabase.from('jadwal').insert([insertData]);
    setLoading(false);
    if (!error) {
      alert('Data successfully sent to Supabase!');
      setSelectedAkuarium(null);
      setSelectedTugas(null);
      setSelectedUser(null);
      setTime(new Date());
    } else {
      alert('Gagal menambah jadwal: ' + error.message);
    }
  };

  return (
    <div style={{ userSelect: 'none' }}>
      <div className="relative">
        <div className="w-full h-[1px] bg-black mb-2"></div>
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
                {days.map((day, dayIndex) => (
                  <Card
                    key={dayIndex}
                    onClick={() => handleDayClick(weekIndex, dayIndex)}
                    className={`text-center flex flex-col items-center justify-center border-none shadow-none relative z-10
                      lg:h-16 lg:w-16 sm:h-14 sm:w-14 
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
                      <span className="text-black text-2xl cursor-pointer">+</span>
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
                                  <Button className="capitalize w-full text-left !bg-white !text-black !hover:bg-gray-200 !border rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150">
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
                                  <Button className="capitalize w-full text-left !bg-white !text-black !hover:bg-gray-200 !border rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150">
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
                                  <Button className="capitalize w-full text-left !bg-white !text-black !hover:bg-gray-200 !border rounded-md focus:outline-none focus-visible:outline-none transition-colors duration-150">
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
                              Jam
                            </Label>
                            <div className="col-span-3 flex justify-center">
                              <TimePickerDemo date={time} setDate={setTime} />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center mt-4">
                          <Button type="submit" className="!bg-[#3443E9] text-white hover:bg-gray-800" disabled={loading}>
                            {loading ? 'Saving...' : 'Save changes'}
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

function ScheduleForUserBox({ userId, selectedDate, tugasOptions, akuariumOptions, userRole }: {
  userId: number,
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
        setLoading(false);
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
          setLoading(false);
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

  if (loading || !selectedDate) return null;
  if ((userRole === 1 || userRole === 2)) {
    if (!allSchedules.length) return null;
    return (
      <div className="relative w-3/4 flex flex-col items-center justify-center mt-4 mx-auto gap-2">
        {allSchedules.map((schedule, idx) => {
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
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold bg-transparent border-none cursor-pointer z-20"
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
  // ...existing code for normal user...
  if (!hasSchedule) return null;
  return (
    <div className="relative w-3/4 flex flex-col items-center justify-center mt-4 mx-auto gap-2">
      {schedules.map((schedule, idx) => (
        <div key={schedule.jadwal_id || idx} className="relative border-black border-1 rounded-4xl px-6 py-4 flex items-center gap-4 w-full max-w-xl h-full bg-white z-10 mb-2 shadow-md">
          {/* X button for delete, only show if userRole is 1 or 2 */}
          {(userRole === 1 || userRole === 2) && (
            <RadixDialog.Root>
              <RadixDialog.Trigger asChild>
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold bg-transparent border-none cursor-pointer z-20"
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
