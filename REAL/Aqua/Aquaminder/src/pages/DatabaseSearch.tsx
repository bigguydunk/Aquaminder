import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FloatingButton from '../components/ui/FloatingButton';

const DatabaseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const mockResults = [
      "Gourami, jarang makan, pergantian warna, per...",
      "Vibrosis, berubah warna, sayap merah, mata me...",
    ];
    const filteredResults = mockResults.filter((result) =>
      result.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filteredResults);
  };

  const handleResultClick = () => {
    navigate("/disease-detail");
  };

  const SearchBar = () => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    };

    return (
      <div className="w-full mx-auto relative mt-4">
        <div className="flex w-full">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-white rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="What are you looking for?"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="bg-white border border-black rounded-r-md p-2 flex items-center justify-center"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#34e7ff"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442 0a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchTerm]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#28D0FF] to-[#88D7FF] text-gray-800">
      <main className="p-4">
        <h2 className="text-lg font-bold mb-4">Cari Penyakit Ikan</h2>
        <div className="mb-4">
          <SearchBar />
        </div>
        <div>
          <h3 className="text-md font-semibold mb-2">
            {searchTerm ? "Matching Search" : "Most Recent Search"}
          </h3>
          <ul className="list-disc pl-5">
            {results.length > 0 ? (
              results.map((result, index) => (
                <li
                  key={index}
                  onClick={handleResultClick}
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  {result}
                </li>
              ))
            ) : (
              <li>No results found.</li>
            )}
          </ul>
        </div>
      </main>
      <div className="fixed bottom-4 right-4 flex flex-col items-center gap-2">
        <FloatingButton />
      </div>
    </div>
  );
};

export default DatabaseSearch;
