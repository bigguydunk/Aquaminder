import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FloatingButton from '../components/ui/FloatingButton';
import supabase from '../../supabaseClient';
import SearchBar from '../components/ui/SearchBar';

const DatabaseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState(""); // <-- query system state
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Fetch all penyakit data on mount or when query changes
  useEffect(() => {
    const fetchPenyakit = async () => {
      let supabaseQuery = supabase.from('penyakit').select('*');
      if (query) {
        supabaseQuery = supabaseQuery.ilike('nama_penyakit', `%${query}%`);
      }
      const { data, error } = await supabaseQuery;
      if (!error && data) {
        setResults(data);
      } else {
        setResults([]);
      }
    };
    fetchPenyakit();
  }, [query]);

  // Search/filter penyakit data
  const handleSearch = () => {
    setQuery(searchTerm);
  };

  const handleResultClick = (penyakit_id: number) => {
    navigate(`/disease-detail/${penyakit_id}`);
  };

  useEffect(() => {
  const fetchPenyakit = async () => {
    let supabaseQuery = supabase.from('penyakit').select('*');
    if (searchTerm) {
      supabaseQuery = supabaseQuery.or(
        `nama_penyakit.ilike.%${searchTerm}%,gejala.ilike.%${searchTerm}%`
      );
    }
    const { data, error } = await supabaseQuery;
    if (!error && data) {
      setResults(data);
    } else {
      setResults([]);
    }
  };
  fetchPenyakit();
}, [searchTerm]);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#28D0FF] to-[#88D7FF] text-gray-800">
      <main className="p-4">
        <h2 className="text-lg font-bold mb-4">Cari Penyakit Ikan</h2>
        <div className="mb-4">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            inputRef={inputRef}
          />
        </div>
        <div>
          <h3 className="text-md font-semibold mb-2">
            {query ? "Matching Search" : "Most Recent Search"}
          </h3>
          <ul className="list-disc pl-5">
            {results.length > 0 ? (
              results.map((result, index) => (
                <li
                  key={result.penyakit_id ?? index}
                  onClick={() => handleResultClick(result.penyakit_id)}
                  className="cursor-pointer text-blue-600 hover:underline"
                >
                  {result.nama_penyakit} {result.gejala ? `- ${result.gejala}` : ""}
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