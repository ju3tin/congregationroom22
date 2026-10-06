"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

type Slide = {
  image: string;
  title?: string;
  description?: string;
};

export default function HeroSection() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  // Load slides from API
  useEffect(() => {
    async function loadSlides() {
      try {
        const response = await fetch("/api/slides");

        if (!response.ok) {
          throw new Error("Failed to load slides");
        }

        const data: Slide[] = await response.json();

        setSlides(data);
      } catch (error) {
        console.error("Failed to load slideshow:", error);
      }
    }

    loadSlides();
  }, []);

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title || `Slide ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Existing gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/60 to-background/80" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[600px] max-w-7xl items-center px-4 py-24">
        <div>
          <h1 className="mb-6 text-5xl font-bold">
            Music For The People{" "}
            <span className="text-primary">24/7</span>
          </h1>

          <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
            Discover DJs, mixes, and live events.
          </p>

          <Button size="lg">
            <Radio className="mr-2 h-5 w-5" />
            Listen Live
          </Button>
        </div>
      </div>

      {/* Previous / Next */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrent(
                (prev) => (prev - 1 + slides.length) % slides.length
              )
            }
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white backdrop-blur hover:bg-black/70"
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrent((prev) => (prev + 1) % slides.length)
            }
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 px-4 py-2 text-2xl text-white backdrop-blur hover:bg-black/70"
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index === current
                  ? "w-8 bg-white"
                  : "bg-white/50 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}