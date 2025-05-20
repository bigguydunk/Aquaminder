import './Homepage.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomeData from './HomeData';
import WeekRow from './components/ui/weekrow';
import FloatingButton from './components/ui/FloatingButton';
import AquariumTable from './components/AquariumTable';
import Background from './components/background';

import "./App.css";
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { data } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// import supabase from '../supabaseClient';
import * as DropdownMenu from "./components/ui/dropdown-menu";

function Homepage() {
  const [userName, setUserName] = useState<string | null>(null);
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (email) {
      supabase
        .from('users')
        .select('username')
        .eq('email', email)
        .then(({ data, error }) => {
          if (data?.[0].username) {
            setUserName(data[0].username);
          }
        });
    }
  }, [email]);

  return (
    <div className="display-flex !height-screen">
      <Background />
      <div className="header">
      <div className="absolute top-6 right-8 z-10">
        <DropdownMenu.DropdownMenu>
          <DropdownMenu.DropdownMenuTrigger asChild>
            <button className="!bg-white rounded-full shadow-md px-6 py-4 inline-block font-semibold focus:outline-none">
              <h2 className="text-2xl">{userName ?? 'Guest'}</h2>
            </button>
          </DropdownMenu.DropdownMenuTrigger>
          <DropdownMenu.DropdownMenuContent align="center" className="bg-transparent border-transparent shadow-none py-2 min-w-[140px] flex flex-col items-center">
            <DropdownMenu.DropdownMenuItem className="!bg-white rounded-full shadow-md px-6 py-4 inline-block focus:outline-none cursor-pointer hover:bg-gray-100 text-center">
              Pegawai
            </DropdownMenu.DropdownMenuItem>
            <DropdownMenu.DropdownMenuSeparator className="my-1 bg-transparent h-px" />
            <DropdownMenu.DropdownMenuItem className="!bg-white rounded-full shadow-md px-6 py-4 inline-block focus:outline-none cursor-pointer text-red-600 hover:bg-gray-100 text-center">
              Log out
            </DropdownMenu.DropdownMenuItem>
          </DropdownMenu.DropdownMenuContent>
        </DropdownMenu.DropdownMenu>
      </div>
      <HomeData />
      <WeekRow />
      </div>
      <FloatingButton />
    </div>
  );
}

// Added necessary logic from script.js to Homepage.tsx.

export default Homepage;