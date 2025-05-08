export default function Carousel(slides: any[]) {

    return (
        <div className="carousel">
            {slides.map((slide, index) => (
                <div key={index} className="carousel-slide">
                    {slide}
                </div>
            ))}
        </div>
    );
}