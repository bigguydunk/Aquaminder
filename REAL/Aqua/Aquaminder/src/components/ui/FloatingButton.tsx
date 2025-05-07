import React, { useState } from "react";

const FloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleButtons = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-center gap-2">
      {isOpen && (
        <>
          <button
            className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
            title="Fish"
          >
            🐟
          </button>
          <button
            className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
            title="Home"
          >
            🏠
          </button>
          <button
            className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
            title="Edit"
          >
            📝
          </button>
        </>
      )}
      <button
        onClick={toggleButtons}
        className="w-14 h-14 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-900 flex items-center justify-center"
        title="Toggle"
      >
        {isOpen ? "⬇️" : "⬆️"}
      </button>
    </div>
  );
};

export default FloatingButton;