"use client";

import { useEffect, useState } from "react";
import HeroSlider from "@/components/HeroSlider";

interface HeroCheck {
  success: boolean;
  slideshow?: {
    isPublic: boolean;
    slides?: unknown[];
  };
}

export default function HeroSection() {
  const [hasHeroSlider, setHasHeroSlider] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkHero() {
      try {
        const response = await fetch("/api/slideshows/hero", {
          cache: "no-store",
        });

        if (!response.ok) {
          setHasHeroSlider(false);
          return;
        }

        const data: HeroCheck = await response.json();

        const available =
          data.success === true &&
          data.slideshow?.isPublic === true &&
          Array.isArray(data.slideshow?.slides) &&
          data.slideshow.slides.length > 0;

        setHasHeroSlider(available);
      } catch (error) {
        console.error("Hero check failed:", error);
        setHasHeroSlider(false);
      }
    }

    checkHero();
  }, []);

  // While checking the API, don't flash the fallback hero
  if (hasHeroSlider === null) {
    return (
      <section className="relative min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      </section>
    );
  }

  // Public hero slideshow exists
  if (hasHeroSlider) {
    return <HeroSlider />;
  }

  // No public hero slideshow - use normal hero
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />

      <div className="relative mx-auto max-w-7xl px-4 py-24">
        <h1 className="mb-6 text-5xl font-bold">
          Music For The People{" "}
          <span className="text-primary">24/7</span>
        </h1>

        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
          Discover DJs, mixes, and live events.
        </p>

        {/* Keep your existing Button/Radio here */}
      </div>
    </section>
  );
}