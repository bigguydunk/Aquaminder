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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#28D0FF] to-[#88D7FF]">
      <Background />
      <header className="w-full flex flex-col items-center py-4 px-2 bg-white/80 shadow-md sticky top-0 z-20">
        <div className="w-full max-w-4xl flex flex-row items-center justify-between">
          <span className="text-2xl font-bold text-[#3443E9]">Aquaminder</span>
          <UserMenu userName={userName} onLogout={handleLogout} />
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col items-center px-2 py-4">
        <section className="w-full max-w-2xl flex flex-col items-center">
          <HomeData />
        </section>
        <section className="w-full max-w-3xl flex flex-col items-center mt-4">
          <WeekRow />
        </section>
      </main>
      <footer className="w-full flex justify-center items-center py-4 bg-transparent">
        <FloatingButton email={user?.email} />
      </footer>
    </div>
  );
}

export default Homepage;