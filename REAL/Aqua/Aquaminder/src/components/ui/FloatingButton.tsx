import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeIcon from '../../assets/home-icon-silhouette-svgrepo-com.svg?react';
import FishIcon from '../../assets/fish-svgrepo-com.svg?react';
import Encyclopedia from '../../assets/book-magnifying-glass-svgrepo-com.svg?react';


const FloatingButton = ({ email }: { email?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleButtons = () => {
    setIsOpen(!isOpen);
  };

  const goToDatabase = () => {
    navigate("/database-search", { state: { email } });
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 md:hidden"
      style={{ pointerEvents: 'auto' }}
    >
      {isOpen && (
        <>
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
            onClick={goToDatabase}
            className="focus:outline-none focus-visible:outline-none w-18 h-12 !rounded-2xl !bg-[#FFE3B3] text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
            title="D-Database"
            type="button"
            style={{ minWidth: 48, minHeight: 48 }}
          >
            <Encyclopedia className="w-7 h-7" />
          </button>
        </>
      )}
      <button
        onClick={toggleButtons}
        className="focus:outline-none focus-visible:outline-none w-18 h-12 !rounded-2xl !bg-[#FFE3B3] text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
        title="Toggle"
        type="button"
        style={{ minWidth: 56, minHeight: 56 }}
      >
        <span>
          <FishIcon className="w-7 h-7" />
        </span>
      </button>
    </div>
  );
};

export default FloatingButton;