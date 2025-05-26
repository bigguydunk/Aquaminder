const SearchBar = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  inputRef,
  handleKeyDown,
  onFocus,
  onBlur,
}: {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}) => {
  return (
    <div className="w-full mx-auto relative mt-4">
      <div className="flex w-full">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            className="w-full border border-black !rounded-t-lg !rounded-b-0 p-2 pr-10 bg-white text-gray-900 !text-2xl placeholder-gray-500 focus:!outline-none focus:ring-2 focus:ring-blue-400"
            placeholder={inputRef.current && inputRef.current === document.activeElement ? '' : 'Gejala apa yang dialami ikan Anda?'}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 !bg-white flex items-center justify-center focus:!outline-none"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="#34e7ff"
              viewBox="0 0 16 16"
              className="focus:outline-none"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.442 0a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
export default SearchBar;