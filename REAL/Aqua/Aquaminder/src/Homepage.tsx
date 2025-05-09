import './Homepage.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomeData from './HomeData';
import WeekRow from './components/ui/weekrow';
import AquariumTable from './components/AquariumTable';
import "./App.css";
// import supabase from '../supabaseClient';


function Homepage() {
  // console.log(supabase);
  return (
    <>
      <div className="header">
          <HomeData/>
          <WeekRow/>
          <AquariumTable/>
      </div>
    </>
  );
}

export default Homepage;