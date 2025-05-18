import './Homepage.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomeData from './HomeData';
import WeekRow from './components/ui/weekrow';
import FloatingButton from './components/ui/FloatingButton';
import AquariumTable from './components/AquariumTable';

import "./App.css";
import { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import { data } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// import supabase from '../supabaseClient';


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
    <div style={{ userSelect: 'none' }} >
      <div className="header">
        <h2> Welcome, {userName ?? 'Guest'}</h2>
        <HomeData />
        <WeekRow />
      </div>
      <FloatingButton />
    </div>
  );
}

// Added necessary logic from script.js to Homepage.tsx.

export default Homepage;