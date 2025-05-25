const SearchBar = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  inputRef,
}: {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  handleSearch: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}) => {
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
          className="!bg-white border border-black rounded-r-md p-2 flex items-center justify-center"
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
export default SearchBar;