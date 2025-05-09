import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DatabaseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#28D0FF] to-[#88D7FF] text-gray-800">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Aquaminder</h1>
        <span>🐟</span>
      </header>
      <main className="p-4">
        <h2 className="text-lg font-semibold mb-4">Searching Database Penyakit Ikan</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSearch}
            className="mt-2 w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
          >
            Search
          </button>
        </div>
        <div>
          <h3 className="text-md font-semibold mb-2">
            {searchTerm ? "Matching Search" : "Most Recent Search"}
          </h3>
          <ul className="list-disc pl-5">
            {results.length > 0 ? (
              results.map((result, index) => <li key={index}>{result}</li>)
            ) : (
              <li>No results found.</li>
            )}
          </ul>
        </div>
      </main>
      <div className="fixed bottom-4 right-4 flex flex-col items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
          title="Home"
        >
          🏠
        </button>
        <button
          onClick={() => navigate("/database-search")}
          className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
          title="D-Database"
        >
          📝
        </button>
        <button
          onClick={() => navigate("/foodstock")}
          className="w-12 h-12 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 flex items-center justify-center"
          title="Foodstock"
        >
          🐟
        </button>
      </div>
    </div>
  );
};

export default DatabaseSearch;