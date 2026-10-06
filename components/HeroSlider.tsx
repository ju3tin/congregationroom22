"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";

interface Slide {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  background?: string;
  transition?: string;
  notes?: string;
  timer?: number;
}

interface Slideshow {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  slides: Slide[];
  theme: string;
  isPublic: boolean;
  featured: boolean;
}

export default function HeroSlider() {
  const [slideshow, setSlideshow] = useState<Slideshow | null>(null);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHero() {
      try {
        const response = await fetch("/api/slideshows/hero", {
          cache: "no-store",
        });

        const data = await response.json();

        console.log("HERO API:", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to load hero");
        }

        setSlideshow(data.slideshow);
      } catch (error) {
        console.error("Hero slider error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHero();
  }, []);

  /*
   * Automatic slide timer
   */
  useEffect(() => {
    if (!slideshow?.slides?.length) return;

    const slide = slideshow.slides[current];

    const seconds =
      slide.timer && slide.timer > 0
        ? slide.timer
        : 5;

    const timer = setTimeout(() => {
      setCurrent((prev) =>
        prev === slideshow.slides.length - 1
          ? 0
          : prev + 1
      );
    }, seconds * 1000);

    return () => clearTimeout(timer);
  }, [slideshow, current]);

  function nextSlide() {
    if (!slideshow?.slides?.length) return;

    setCurrent((prev) =>
      prev === slideshow.slides.length - 1
        ? 0
        : prev + 1
    );
  }

  function previousSlide() {
    if (!slideshow?.slides?.length) return;

    setCurrent((prev) =>
      prev === 0
        ? slideshow.slides.length - 1
        : prev - 1
    );
  }

  if (loading) {
    return (
      <section className="relative min-h-[600px] overflow-hidden bg-black">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-white/60">
            Loading...
          </div>
        </div>
      </section>
    );
  }

  if (!slideshow || slideshow.slides.length === 0) {
    return (
      <section className="relative min-h-[600px] overflow-hidden bg-black">
        <div className="flex min-h-[600px] items-center justify-center">
          <p className="text-white/60">
            No hero slides available.
          </p>
        </div>
      </section>
    );
  }

  const slide = slideshow.slides[current];

  return (
    <section className="relative min-h-[600px] overflow-hidden bg-black">
      {/* Slides */}
      {slideshow.slides.map((item, index) => (
        <div
          key={item._id || index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          {item.image && (
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Optional background */}
          {item.background && (
            <div
              className="absolute inset-0"
              style={{
                background: item.background,
              }}
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-7xl items-center px-4 py-24">
        <div
          key={slide._id || current}
          className="max-w-3xl text-white"
        >
          <h1 className="mb-6 text-5xl font-bold md:text-7xl">
            {slide.title}
          </h1>

          {slide.content && (
            <p className="mb-8 max-w-2xl text-lg text-white/80 md:text-xl">
              {slide.content}
            </p>
          )}

          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-white transition hover:opacity-90"
          >
            <Radio className="mr-2 h-5 w-5" />
            Listen Live
          </button>
        </div>
      </div>

      {/* Previous */}
      {slideshow.slides.length > 1 && (
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur transition hover:bg-black/70"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next */}
      {slideshow.slides.length > 1 && (
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white backdrop-blur transition hover:bg-black/70"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Dots */}
      {slideshow.slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-2">
          {slideshow.slides.map((item, index) => (
            <button
              key={item._id || index}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                index === current
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}