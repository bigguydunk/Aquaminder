import './Homepage.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomeData from './HomeData';
import WeekRow from './components/ui/weekrow';
import FloatingButton from './components/ui/FloatingButton';
import Background from './components/background';
import UserMenu from './components/UserMenu';

import "./App.css";
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { data } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
// import supabase from '../supabaseClient';
import * as DropdownMenu from "./components/ui/dropdown-menu";

function Homepage() {
  const [userName, setUserName] = useState<string | null>(null);
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

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

  const handleLogout = () => {
    // Remove email from navigation state by redirecting without state
    navigate('/', { replace: true, state: {} });
  };

  return (
    <div className="display-flex !height-screen">
      <Background />
      <div className="header">
        <UserMenu userName={userName} onLogout={handleLogout} />
        <HomeData />
        <WeekRow />
      </div>
      <FloatingButton />
    </div>
  );
}

// Added necessary logic from script.js to Homepage.tsx.

export default Homepage;