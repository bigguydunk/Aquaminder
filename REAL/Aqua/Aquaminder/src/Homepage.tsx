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
  const [selectedDay, setSelectedDay] = useState<{ week: number; day: number } | null>({ week: 5, day: new Date().getDay() });
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
    <div className="min-h-screen w-full flex flex-col">
      <Background />
      <header>
        <div className="w-full flex flex-row items-center justify-between pt-6 md:h-20">
          <UserMenu userName={userName} onLogout={handleLogout} />
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col min-h-screen py-0">
        <section className="flex flex-1 w-full min-h-screen flex-col md:flex-row items-start justify-between gap-2">
          {/* HomeData on the far left (1/3) */}
          <div className="relative lg:w-[25%] md:w-[35%] w-full flex flex-col h-full items-stretch">
            {/* White box behind, slightly offset */}
            <div
              className="hidden md:block absolute right-[-16px] w-full h-full bg-[#4F8FBF] rounded-r-2xl md:rounded-b-none shadow-lg z-0"
              style={{ filter: 'blur(0.5px)' }}
            />
            {/* Main colored box */}
            <div className="relative z-10 flex flex-col md:bg-[#26648B] md:rounded-r-xl md:rounded-b-none md:shadow md:h-full md:min-h-screen">
              <HomeData />
            </div>
          </div>
          {/* WeekRow (add schedule + calendar) on the right (2/3) */}
          <div className="w-full  flex flex-col items-center md:overflow-y-auto lg:pt-20 md:h-screen md:max-h-screen md:min-h-screen">
            <WeekRow selectedDay={selectedDay} setSelectedDay={setSelectedDay} />
          </div>
        </section>
        <FloatingButton email={user?.email} />
      </main>

        

    </div>
  );
}

export default Homepage;