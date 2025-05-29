import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Accept email as a prop
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
    <div className="flex flex-col items-center gap-2">
      {isOpen && (
        <>
          <button
            onClick={() => navigate("/homepage", { state: { email } })}
            className="focus:outline-none focus-visible:outline-none w-12 h-12 !rounded-full !bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
            title="Home"
          >
            🏠
          </button>
          <button
            onClick={goToDatabase}
            className="focus:outline-none focus-visible:outline-none w-12 h-12 !rounded-full !bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
            title="D-Database"
          >
            📝
          </button>
        </>
      )}
      <button
        onClick={toggleButtons}
        className="focus:outline-none focus-visible:outline-none w-14 h-14 !rounded-full !bg-white text-white shadow-lg hover:bg-gray-900 flex items-center justify-center"
        title="Toggle"
      >
        {isOpen ? "⬇️" : "⬆️"}
      </button>
    </div>
  );
};

export default FloatingButton;