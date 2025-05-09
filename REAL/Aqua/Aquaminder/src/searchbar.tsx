
import './searchbar.css';

function SearchBar() {
  return (
    <div className="wrap">
      <div className="search">
        <input type="text" className="searchTerm" placeholder="What are you looking for?" />
        <button type="submit" className="searchButton" aria-label="Search">
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
}

export default SearchBar;
