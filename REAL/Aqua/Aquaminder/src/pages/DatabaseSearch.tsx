import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FloatingButton from '../components/ui/FloatingButton';
import supabase from '../../supabaseClient';
import SearchBar from '../components/ui/SearchBar';

const DatabaseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState(""); // <-- query system state
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Fetch all penyakit data on mount or when query changes
  useEffect(() => {
    const fetchPenyakit = async () => {
      let supabaseQuery = supabase.from('penyakit').select('*');
      if (query) {
        // Split query into words, ignore extra spaces, and filter out common Indonesian filler words
        const fillerWords: string[] = [
          'dan', 'atau', 'yang',   'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'itu', 'ini', 'sebagai', 'juga', 'karena', 'tetapi', 'namun', 'sehingga', 'agar', 'supaya', 'oleh', 'sebelum', 'sesudah', 'setelah', 'saat', 'ketika', 'bila', 'jika', 'sejak', 'hingga', 'sampai', 'dalam', 'luar', 'atas', 'bawah', 'antara', 'tanpa', 'selain', 'bahwa', 'pun', 'lagi', 'saja', 'sudah', 'belum', 'masih', 'akan', 'harus', 'boleh', 'mungkin', 'dapat', 'per', 'para', 'oleh', 'kepada', 'tentang', 'seperti', 'misal', 'contoh', 'dst', 'dll', 'ter' 
        ];
        const words = query.trim().split(/\s+/).filter(word => !fillerWords.includes(word.toLowerCase()));
        // Supabase doesn't support dynamic AND of ORs directly, so fetch all and filter in JS
        const { data, error } = await supabaseQuery;
        if (!error && data) {
          // Only include results where every word is found in either field
          const filtered = data.filter((row: any) =>
            words.every(word =>
              (row.nama_penyakit && row.nama_penyakit.toLowerCase().includes(word.toLowerCase())) ||
              (row.gejala && row.gejala.toLowerCase().includes(word.toLowerCase()))
            )
          );
          setResults(filtered);
        } else {
          setResults([]);
        }
        return;
      }
      // If no query, fetch all
      const { data, error } = await supabaseQuery;
      if (!error && data) {
        setResults(data);
      } else {
        setResults([]);
      }
    };
    fetchPenyakit();
  }, [query]);

  // Show results as user types: update query on every keystroke
  useEffect(() => {
    setQuery(searchTerm);
  }, [searchTerm]);

  // Reset focus index when results or searchTerm changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [results, searchTerm]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (results.length === 0 ? 0 : Math.min(prev + 1, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (results.length === 0 ? 0 : Math.max(prev - 1, 0)));
    } else if (e.key === "Enter") {
      if (results[focusedIndex]) {
        handleResultClick(results[focusedIndex].penyakit_id);
      } else {
        handleSearch();
      }
    }
  };

  // Search/filter penyakit data
  const handleSearch = () => {
    setQuery(searchTerm);
  };

  const handleResultClick = (penyakit_id: number) => {
    navigate(`/disease-detail/${penyakit_id}`);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-b from-[#28D0FF] to-[#88D7FF] text-gray-800">
      <main className="p-4">
        <h2 className="text-2xl font-bold mb-4">Fish Encyclopdia</h2>
        <div className="mb-4 relative">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            inputRef={inputRef}
            handleKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
          <ul className="absolute left-0 w-full z-10 bg-white rounded-b-xl shadow-md overflow-hidden text-left">
            {results.length > 0 ? (
              results.map((result, index) => (
                <li
                  key={result.penyakit_id ?? index}
                  onClick={() => handleResultClick(result.penyakit_id)}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                    index === results.length - 1 ? 'rounded-b-xl' : ''
                  } ${
                    inputFocused && index === focusedIndex ? '!bg-blue-100 !text-black' : ''
                  } hover:!bg-blue-100 hover:!rounded-md active:!bg-blue-100 last:border-b-0 text-left`}
                  style={{
                    background: inputFocused && index === focusedIndex ? '#bfdbfe' : 'white',
                    color: inputFocused && index === focusedIndex ? '#000' : '#2563eb',
                  }}
                >
                  <span className="font-semibold text-2xl text-gray-800">{result.nama_penyakit}</span>
                  {result.gejala ? <span className="text-gray-500 text-2xl"> - {result.gejala}</span> : ""}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-gray-400 text-left text-2xl">No results found.</li>
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