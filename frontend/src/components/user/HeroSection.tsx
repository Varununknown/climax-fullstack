import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { useContent } from "../../context/ContentContext";
import { useNavigate } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import "./HeroSection.css";

export const HeroSection: React.FC = () => {
  const { contents } = useContent();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: "performance",
    slides: { perView: 1 },
    drag: false, // disable drag for smoother cinematic effect
    created(s) {
      setCurrentSlide(s.track.details.rel);
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 6000); // slower rotation to allow cinematic zoom
    return () => clearInterval(interval);
  }, [instanceRef]);

  if (!contents.length) return null;

  // compute visible dots window (max 5 like OTT)
  const totalSlides = contents.length;
  const maxDots = 5;
  let start = Math.max(0, currentSlide - 2);
  let end = Math.min(totalSlides, start + maxDots);
  if (end - start < maxDots && start > 0) {
    start = Math.max(0, end - maxDots);
  }

  return (
    <div className="relative overflow-hidden select-none">
      <div ref={sliderRef} className="keen-slider relative h-[25vh] lg:h-[60vh]">
        {contents.map((content, idx) => (
          <div
            key={content._id}
            className={`keen-slider__slide relative ${
              currentSlide === idx ? "active" : ""
            }`}
          >
            {/* Background */}
            <img
              src={content.thumbnail}
              alt={content.title}
              className={`slide-background ${
                currentSlide === idx ? "active" : ""
              }`}
              draggable={false}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />

            {/* Center-down overlay */}
            <div className="content-overlay">
              {/* Free or Rent Tag */}
              {content.premiumPrice === 0 ? (
                <div className="mb-2">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                    Free
                  </span>
                  <span className="ml-2 text-white text-xs">
                    Included with Prime
                  </span>
                </div>
              ) : (
                <div className="mb-2">
                  <span className="bg-yellow-600 text-black px-2 py-0.5 rounded text-xs font-bold">
                    Grant @
                  </span>
                  <span className="ml-2 text-white text-xs">
                    ₹{content.premiumPrice} upon climax
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 drop-shadow-lg">
                {content.title}
              </h1>

              {/* U/A tag 
              <div className="flex justify-center mb-4">
                <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-semibold">
                  U/A 16+
                </div>
              </div>  */}
            </div>

            {/* Play button */}
            <div className="absolute bottom-9 left-1/2 transform -translate-x-1/2 z-20">
              <button
                onClick={() => navigate(`/content/${content._id}`)}
                className="btn-hero-play"
              >
                <Play className="w-5 h-5 fill-current" />
                <span className="ml-3">Watch Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* OTT-style dots */}
      <div className="hero-dots" role="tablist" aria-label="Hero slides">
        {contents.slice(start, end).map((_, idx) => {
          const actualIndex = start + idx;
          return (
            <button
              key={actualIndex}
              className={`hero-dot ${
                currentSlide === actualIndex ? "active" : ""
              }`}
              onClick={() => instanceRef.current?.moveToIdx(actualIndex)}
              aria-label={`Go to slide ${actualIndex + 1}`}
              aria-current={currentSlide === actualIndex}
            />
          );
        })}
      </div>
    </div>
  );
};
