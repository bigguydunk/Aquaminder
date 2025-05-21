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
import { useNavigate } from 'react-router-dom';
// import supabase from '../supabaseClient';

function Homepage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current user from Supabase Auth
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // Fetch username from users table using user_id
        const { data } = await supabase
          .from('users')
          .select('username')
          .eq('user_id', user.id)
          .single();
        if (data && data.username) {
          setUserName(data.username);
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="display-flex !height-screen">
      <Background />
      <div className="header">
        <UserMenu userName={userName} onLogout={handleLogout} />
        <HomeData />
        <WeekRow />
      </div>
      <FloatingButton email={user?.email} />
    </div>
  );
}

// Added necessary logic from script.js to Homepage.tsx.

export default Homepage;