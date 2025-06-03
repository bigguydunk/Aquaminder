import { useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import HomeIcon from '../assets/home-icon-silhouette-svgrepo-com.svg?react';
import Encyclopedia from '../assets/book-magnifying-glass-svgrepo-com.svg?react';

const UserActions: React.FC<{ userName: string | null; onLogout: () => void; email?: string }> = ({ userName, onLogout, email }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-row items-center gap-2 whitespace-nowrap">
      <button
        onClick={() => navigate("/homepage", { state: { email } })}
        className="focus:outline-none focus-visible:outline-none w-18 h-12 !rounded-2xl !bg-[#FFE3B3] text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
        title="Home"
        type="button"
        style={{ minWidth: 48, minHeight: 48 }}
      >
        <HomeIcon className="w-7 h-7" />
      </button>
      <button
        onClick={() => navigate("/database-search", { state: { email } })}
        className="focus:outline-none focus-visible:outline-none w-18 h-12 !rounded-2xl !bg-[#FFE3B3] text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
        title="D-Database"
        type="button"
        style={{ minWidth: 48, minHeight: 48 }}
      >
        <Encyclopedia className="w-7 h-7" />
      </button>
      <div className="flex items-center ml-2 !static !relative" style={{ position: 'static' }}>
        <UserMenu userName={userName} onLogout={onLogout} className="!static !relative !z-10" />
      </div>
    </div>
  );
};

export default UserActions;
