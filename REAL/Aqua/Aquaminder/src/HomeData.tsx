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
    <div className='sm:h-[30vh] h-[30vh] relative'>
      {/* Navigation Dots moved to top center, with extra spacing to avoid overlap */}
      <div
        className="absolute left-1/2 z-20 flex justify-center space-x-2 md:top-4 md:bottom-auto bottom-4 md:translate-y-0"
        style={{
          top: undefined,
          bottom: undefined,
          transform: 'translateX(-50%)',
        }}
      >
        {Array.from({ length: totalItems }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`rounded-full focus:outline-none focus-visible:outline-none hover:scale-110 ${
              currentIndex === index ? "w-3 h-3 !bg-[#FFE3B3]" : "!w-1 !h-1 !bg-[#0F354D] "
            }`}
          />
        ))}
      </div>
      <div className="h-6 " /> {/* Add extra vertical space between nav dots and radial bar */}
      <Carousel setApi={handleSetApi} className='h-full'>
        <CarouselContent>
          <CarouselItem><RadialBar /></CarouselItem>
          <CarouselItem><RadialBar2 /></CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}

export default HomeData;