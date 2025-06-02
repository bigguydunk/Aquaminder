import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FloatingButton from '../components/ui/FloatingButton';
import supabase from '../../supabaseClient';
import SearchBar from '../components/ui/SearchBar';
import AquaminderLogo from '../assets/Aquaminder.svg?react';
import UserActions from '../components/UserActions';
import UserMenu from '../components/UserMenu';
import Background from '../components/background';

const DatabaseSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState(""); // <-- query system state
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;

  // Fetch all penyakit data on mount or when query changes
  useEffect(() => {
    const fetchPenyakit = async () => {
      let supabaseQuery = supabase.from('penyakit').select('*');
      if (query) {
        // Split query into words, ignore extra spaces, and filter out common Indonesian filler words
        const fillerWords: string[] = [
          'dan', 'atau', 'yang', 'ikan',  'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'itu', 'ini', 'sebagai', 'juga', 'karena', 'tetapi', 'namun', 'sehingga', 'agar', 'supaya', 'oleh', 'sebelum', 'sesudah', 'setelah', 'saat', 'ketika', 'bila', 'jika', 'sejak', 'hingga', 'sampai', 'dalam', 'luar', 'atas', 'bawah', 'antara', 'tanpa', 'selain', 'bahwa', 'pun', 'lagi', 'saja', 'sudah', 'belum', 'masih', 'akan', 'harus', 'boleh', 'mungkin', 'dapat', 'per', 'para', 'oleh', 'kepada', 'tentang', 'seperti', 'misal', 'contoh', 'dst', 'dll', 'ter'
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

  // Get the current user from Supabase Auth
  useEffect(() => {
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

  // Load recent searches from localStorage on mount ONLY
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(stored);
  }, []);

  // Debug: log when recentSearches state changes
  useEffect(() => {
    console.log('recentSearches state updated:', recentSearches);
  }, [recentSearches]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  // Utility: update recent searches in localStorage and state
  const updateRecentSearches = (term: string) => {
    if (!term.trim()) return;
    try {
      // Check cookies/localStorage as before
      document.cookie = "testcookie=1";
      if (document.cookie.indexOf("testcookie=1") === -1) {
        return;
      }
      let isStorageWorking = true;
      try {
        localStorage.setItem('test', '1');
        localStorage.removeItem('test');
      } catch (err) {
        isStorageWorking = false;
      }
      if (!isStorageWorking) {
        return;
      }
      let current: string[] = [];
      try {
        current = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      } catch (err) {
        alert('Error parsing localStorage: ' + err);
      }
      let updated = [term, ...current.filter((t: string) => t !== term)].slice(0, 10); // changed 5 to 10
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
      console.log('[updateRecentSearches] Updated:', updated);
    } catch (e) {
      alert('localStorage error: ' + e);
    }
  };

  // Search/filter penyakit data
  const handleSearch = () => {
    console.log('handleSearch called with searchTerm:', searchTerm);
    setQuery(searchTerm);
    // Only add to recent searches if the search term matches a result
    const match = results.find(
      (r) => r.nama_penyakit && r.nama_penyakit.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (match) {
      updateRecentSearches(match.nama_penyakit);
    }
  };

  const handleResultClick = (penyakit_id: number) => {
    // Find the clicked result by id
    const clicked = results.find(r => r.penyakit_id === penyakit_id);
    if (clicked && clicked.nama_penyakit) {
      updateRecentSearches(clicked.nama_penyakit);
    }
    navigate(`/disease-detail/${penyakit_id}`);
  };

  return (
    <div className="min-h-screen w-screen  text-gray-800">
      <header>
        <div className="w-full flex md:bg-[#56B1CA] flex-row items-center md:shadow-md justify-between pt-3 h-20 pr-6">
          <span className="ml-6 flex items-center h-12 cursor-pointer" onClick={() => navigate('/homepage') }>
            <AquaminderLogo style={{ height: '48px', width: 'auto', display: 'block' }} />
          </span>
          {/* Show UserActions on md and above, UserMenu on small screens */}
          <div className="hidden md:block">
            <UserActions userName={userName} onLogout={handleLogout} email={user?.email} />
          </div>
          <div className="block md:hidden">
            <UserMenu userName={userName} onLogout={handleLogout} />
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col min-h-screen py-0">
        <section className="flex flex-1 w-full min-h-screen flex-col md:flex-row items-start gap-2">
          {/* Left side blue box (now with recent searches) */}
          <div className="relative lg:w-[25%] md:w-[35%] w-full flex flex-col h-auto md:h-full md:pl-0 pl-5 items-stretch">
            {/* White box behind, slightly offset */}
            <div
              className="hidden md:block absolute right-[-16px] w-full md:h-full bg-[#4F8FBF] rounded-r-2xl md:rounded-b-none shadow-lg z-0"
              style={{ filter: 'blur(0.5px)' }}
            />
            {/* Main colored box with recent searches */}
            <div className="hidden md:flex relative z-10 flex-col md:bg-[#26648B] md:rounded-r-xl md:rounded-b-none md:shadow md:h-full md:min-h-screen p-4">
              <h2 className="text-xl mb-2 text-[#FFE3B3] text-left">
                <span className="font-bold">Recent</span> Searches
              </h2>
              <hr className="border-t border-[#FFE3B3] mb-2" />
              <ul className="mb-0">
                {recentSearches.length === 0 && <li className="text-[#FFE3B3] text-opacity-60 text-left">No recent searches</li>}
                {recentSearches.map((item, idx) => (
                  <li key={idx} className="text-left  last:border-b-0">
                    <button
                      className="w-full text-left px-0 py-1 rounded-none bg-transparent  hover:opacity-80 focus:outline-none"
                      style={{ color: '#FFE3B3', background: 'none', textAlign: 'left' }}
                      onClick={async () => {
                        let found = results.find(r => r.nama_penyakit && r.nama_penyakit.toLowerCase() === item.toLowerCase());
                        if (!found) {
                          const { data } = await supabase
                            .from('penyakit')
                            .select('penyakit_id')
                            .eq('nama_penyakit', item)
                            .single();
                          if (data && data.penyakit_id) {
                            navigate(`/disease-detail/${data.penyakit_id}`);
                            return;
                          }
                        } else {
                          navigate(`/disease-detail/${found.penyakit_id}`);
                          return;
                        }
                      }}
                    >
                      {item}
                    </button>
                    {/* Only show the Remove button after the last item */}
                    {idx === recentSearches.length - 1 && recentSearches.length > 0 && (
                      <div className="flex w-full justify-end mt-2">
                        <button
                          className="text-sm bg-transparent underline border-none shadow-none hover:underline focus:outline-none"
                          style={{ color: '#FFE3B3', background: 'none' }}
                          onClick={() => { localStorage.removeItem('recentSearches'); setRecentSearches([]); }}
                        >
                          Remove Recent Searches
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Right side: search bar and results */}
          <div className="w-full flex flex-col items-center md:overflow-y-auto lg:pt-15 md:h-screen md:max-h-screen md:min-h-screen">
            <div className="w-full max-w-2xl px-2 md:px-0 mb-0">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleSearch={handleSearch}
                inputRef={inputRef}
                handleKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                roundedBottom={!searchTerm}
              />
            </div>
            <div className="w-full max-w-2xl px-2 md:px-0">
              <ul className="w-full z-10 bg-[#FFE3B3] rounded-b-xl shadow-md overflow-hidden text-left mt-0">
                {searchTerm ? (
                  results.length > 0 ? (
                    results.map((result, index) => (
                      <li
                        key={result.penyakit_id ?? index}
                        onClick={() => handleResultClick(result.penyakit_id)}
                        className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                          index === results.length - 1 ? 'rounded-b-xl' : ''
                        } ${
                          inputFocused && index === focusedIndex ? '!bg-[#E6C48A] !text-[#26648B]' : ''
                        } hover:!bg-[#E6C48A] hover:!rounded-md active:!bg-[#E6C48A] last:border-b-0 text-left`}
                        style={{
                          background: inputFocused && index === focusedIndex ? '#E6C48A' : '#FFE3B3',
                          color: '#26648B',
                        }}
                      >
                        <span className="font-semibold text-lg" style={{ color: '#26648B' }}>{result.nama_penyakit}</span>
                        {result.gejala ? <span className="text-lg" style={{ color: '#26648B' }}> - {result.gejala}</span> : ""}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-lg text-left" style={{ color: '#26648B' }}>No results found.</li>
                  )
                ) : null}
              </ul>
            </div>
            {/* Recent searches below search/results for mobile (below md) */}
            <div className="block md:hidden w-full max-w-2xl mt-6 px-2">
              <div className="bg-[#26648B] rounded-xl shadow p-4">
                <h2 className="text-xl mb-2 text-[#FFE3B3] text-left">
                  <span className="font-bold">Recent</span> Searches
                </h2>
                <hr className="border-t border-[#FFE3B3] mb-2" />
                <ul className="mb-0">
                  {recentSearches.length === 0 && <li className="text-[#FFE3B3] text-opacity-60 text-left">No recent searches</li>}
                  {recentSearches.map((item, idx) => (
                    <li key={idx} className="text-left last:border-b-0">
                      <button
                        className="w-full text-left px-0 py-1 rounded-none bg-transparent hover:opacity-80 focus:outline-none"
                        style={{ color: '#FFE3B3', background: 'none', textAlign: 'left' }}
                        onClick={async () => {
                          let found = results.find(r => r.nama_penyakit && r.nama_penyakit.toLowerCase() === item.toLowerCase());
                          if (!found) {
                            const { data } = await supabase
                              .from('penyakit')
                              .select('penyakit_id')
                              .eq('nama_penyakit', item)
                              .single();
                            if (data && data.penyakit_id) {
                              navigate(`/disease-detail/${data.penyakit_id}`);
                              return;
                            }
                          } else {
                            navigate(`/disease-detail/${found.penyakit_id}`);
                            return;
                          }
                        }}
                      >
                        {item}
                      </button>
                      {/* Only show the Remove button after the last item */}
                      {idx === recentSearches.length - 1 && recentSearches.length > 0 && (
                        <div className="flex w-full justify-end mt-2">
                          <button
                            className="text-sm bg-transparent underline border-none shadow-none hover:underline focus:outline-none"
                            style={{ color: '#FFE3B3', background: 'none' }}
                            onClick={() => { localStorage.removeItem('recentSearches'); setRecentSearches([]); }}
                          >
                            Remove Recent Searches
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FloatingButton />
      <Background />
    </div>
  );
};

export default DatabaseSearch;