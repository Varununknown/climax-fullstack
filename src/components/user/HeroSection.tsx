import React, { useEffect, useState } from "react";
import { Play, Plus, Star } from "lucide-react";
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
    mode: "free-snap",
    slides: { perView: 1 },
    drag: true,
    created(s) {
      setCurrentSlide(s.track.details.rel);
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
    renderMode: "performance",
    animation: { duration: 800, easing: (t) => t },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      instanceRef.current?.next();
    }, 3000);
    return () => clearInterval(interval);
  }, [instanceRef]);

  if (!contents.length) return null;

  return (
    <div className="relative overflow-hidden select-none">
      <div ref={sliderRef} className="keen-slider relative h-[70vh] lg:h-[80vh]">
        {contents.map((content, idx) => {
          const isMobile = window.innerWidth <= 768;

          const slideInner = (
            <>
              {/* Background Image */}
              <img
                src={content.thumbnail}
                alt={content.title}
                loading="lazy"
                className={`slide-background ${
                  currentSlide === idx ? "active" : ""
                }`}
                draggable={false}
                aria-hidden={currentSlide !== idx}
              />

              {/* Vintage gradient overlays */}
              <div className="absolute inset-0 bg-vintage-top z-10" />
              <div className="absolute inset-0 bg-vintage-right z-10" />

              {/* Black border */}
              <div className="slide-border" />

              {/* Content overlay wrapper for scaling */}
              <div className="content-overlay absolute bottom-0 left-0 w-full z-20">
                <div
                  className="
                    px-6
                    pb-10
                    bg-gradient-to-t
                    from-black/55
                    via-black/30
                    to-transparent
                    text-white
                    max-w-2xl
                    mx-auto
                  "
                >
                  {content.premiumPrice === 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        Free
                      </div>
                      <span className="text-white text-xs">Included with Prime</span>
                    </div>
                  )}

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight drop-shadow-md">
                    {content.title}
                  </h1>

                  <div className="flex items-center space-x-3 mb-3 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="font-semibold">{content.rating}</span>
                    </div>
                    <span className="text-gray-300">2024</span>
                    <span className="text-gray-300">
                      {Math.floor(content.duration / 60)} min
                    </span>
                    <span className="text-gray-300 capitalize">{content.type}</span>
                    <div className="bg-gray-700 text-white px-1.5 py-0.5 rounded text-[10px]">
                      U/A 16+
                    </div>
                  </div>

                  <div className="flex space-x-1.5 mb-3 text-xs">
                    {content.genre.slice(0, 3).map((genre, index) => (
                      <React.Fragment key={genre}>
                        {index > 0 && <span className="text-gray-500">•</span>}
                        <span className="text-gray-300">{genre}</span>
                      </React.Fragment>
                    ))}
                  </div>

                  {!isMobile && (
                    <p className="text-sm sm:text-base text-gray-300 mb-5 leading-relaxed line-clamp-3">
                      {content.description}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => navigate(`/watch/${content._id}`)}
                      className="flex items-center justify-center space-x-2 bg-white text-black font-semibold px-6 py-2 rounded hover:bg-gray-200 transition-colors text-sm sm:text-base"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play</span>
                    </button>

                    {/* Hide Watchlist on mobile */}
                    {!isMobile && (
                      <button className="flex items-center justify-center space-x-2 bg-gray-600/80 text-white font-semibold px-6 py-2 rounded hover:bg-gray-600 transition-colors backdrop-blur-sm text-sm sm:text-base">
                        <Plus className="w-4 h-4" />
                        <span>Watchlist</span>
                      </button>
                    )}
                  </div>

                  {content.premiumPrice > 0 && (
                    <div className="mt-3 flex items-center space-x-2 text-sm">
                      <div className="bg-yellow-600 text-black px-2 py-0.5 rounded font-bold text-xs sm:text-sm">
                        RENT
                      </div>
                      <span className="text-white">
                        ₹{content.premiumPrice} upon climax
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          );

          return (
            <div
              key={content._id}
              className="keen-slider__slide relative flex items-end"
            >
              {isMobile ? (
                <div className="slide-wrapper">{slideInner}</div>
              ) : (
                slideInner
              )}
            </div>
          );
        })}
      </div>

      {/* Dots Navigation */}
      {/* Thin line navigation */}
        <div className="hero-line-nav">
          {contents.map((_, idx) => (
            <div
              key={idx}
              className={currentSlide === idx ? "active" : ""}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") instanceRef.current?.moveToIdx(idx);
              }}
            />
          ))}
        </div>
    </div>
  );
};
