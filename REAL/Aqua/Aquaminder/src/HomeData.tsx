import './Homepage.css';
import RadialBar from './HomeChart';
import RadialBar2 from './HomeChart2';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./components/ui/carousel.tsx"


function HomeData() {
  return (
    <div>
    <Carousel >
    <CarouselPrevious variant="ghost" className="!bg-white text-black hover:bg-gray-100 w-10 h-10 rounded-full" />
    <CarouselContent>
      <CarouselItem ><RadialBar /></CarouselItem>
      <CarouselItem ><RadialBar2 /></CarouselItem>
    </CarouselContent>
    <CarouselNext variant="ghost" className="!bg-white text-black hover:bg-gray-100 w-10 h-10 rounded-full" />
  </Carousel>
    </div>
  );
}

export default HomeData;