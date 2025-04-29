import './Homepage.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomeData from './HomeData';
import WeekRow from './components/ui/weekrow';


function Homepage() {
  return (
    <>
      <div className="header">
          <HomeData/>
          <WeekRow/>
      </div>
    </>
  );
}

export default Homepage;