"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";

type Slide = {
  image: string;
  title?: string;
  description?: string;
};

type SlideshowProps = {
  slides: Slide[];
  autoPlay?: boolean;
  interval?: number;
};

export default function Slideshow({
  slides,
  autoPlay = true,
  interval = 5000,
}: SlideshowProps): ReactElement {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  if (!slides || slides.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl bg-gray-100">
        No slides available
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black">
      
      {/* Image */}
      <div className="relative flex min-h-[400px] w-full items-center justify-center bg-black">
        <img
          src={slide.image}
          alt={slide.title || `Slide ${current + 1}`}
          className="max-h-[700px] w-full object-contain"
        />

        {/* Caption */}
        {(slide.title || slide.description) && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-8 pt-24 text-white">
            {slide.title && (
              <h2 className="text-2xl font-bold">
                {slide.title}
              </h2>
            )}

            {slide.description && (
              <p className="mt-2 text-sm text-white/90">
                {slide.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Previous */}
      {slides.length > 1 && (
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-2xl text-white backdrop-blur hover:bg-black/70"
        >
          ‹
        </button>
      )}

      {/* Next */}
      {slides.length > 1 && (
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-2xl text-white backdrop-blur hover:bg-black/70"
        >
          ›
        </button>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-3 w-3 rounded-full ${
                current === index
                  ? "bg-white"
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}