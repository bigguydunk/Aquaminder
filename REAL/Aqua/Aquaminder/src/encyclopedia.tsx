import './Encyclopedia.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SearchBar from './searchbar';

function Encyclopedia() {
  return (
    <div style={{ userSelect: 'none' }}>
      <div className="header">
        <SearchBar />
      </div>
    </div>
  );
}

export default Encyclopedia;
