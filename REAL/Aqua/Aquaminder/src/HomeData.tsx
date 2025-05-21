import './Homepage.css';
import RadialBar from './HomeChart';
import RadialBar2 from './HomeChart2';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "./components/ui/carousel.tsx"
import { useState, useEffect } from "react";
import type { EmblaCarouselType } from "embla-carousel";


function HomeData() {
  const [carouselApi, setCarouselApi] = useState<EmblaCarouselType | null>(null);

  const handleSetApi = (api: EmblaCarouselType | undefined) => {
    setCarouselApi(api || null);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const updateCarouselState = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
      setTotalItems(carouselApi.scrollSnapList().length);
    };

    updateCarouselState();

    carouselApi.on("select", updateCarouselState);

    return () => {
      carouselApi.off("select", updateCarouselState);
    };
  }, [carouselApi]);

  const scrollToIndex = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  return (
    <div>
      <Carousel setApi={handleSetApi}>
        
        <CarouselContent>
          <CarouselItem><RadialBar /></CarouselItem>
          <CarouselItem><RadialBar2 /></CarouselItem>
        </CarouselContent>
        
      </Carousel>

      {/* Navigation Dots */}
      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalItems }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`rounded-full focus:outline-none focus-visible:outline-none ${
              currentIndex === index ? "w-3 h-3 !bg-white" : "w-2 h-2 !bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HomeData;