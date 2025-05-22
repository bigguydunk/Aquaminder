import { useEffect, useState } from 'react';
import HomeData from './HomeData';
import WeekRow from './components/ui/weekrow';
import FloatingButton from './components/ui/FloatingButton';
import Background from './components/background';
import UserMenu from './components/UserMenu';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

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
  <div className="display flex flex-col overflow-x-hidden">
    <Background />
    <div className="relative z-10 w-full flex flex-col justify-center items-center text-center mt-4 gap-4">
      {/* Decorative header background */}
      <UserMenu userName={userName} onLogout={handleLogout} />
      <HomeData />
      <div className="h-4" />
      <WeekRow />
    </div>
    <FloatingButton email={user?.email} />
  </div>
);
}

export default Homepage;