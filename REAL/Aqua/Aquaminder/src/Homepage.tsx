import './Homepage.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomeData from './HomeData';
import WeekRow from './components/ui/weekrow';
import FloatingButton from './components/ui/FloatingButton';

function Homepage() {
  return (
    <div style={{ userSelect: 'none' }}>
      <div className="header">
        <HomeData />
        <WeekRow />
      </div>
      <FloatingButton />
    </div>
  );
}

// Added necessary logic from script.js to Homepage.tsx.

export default Homepage;