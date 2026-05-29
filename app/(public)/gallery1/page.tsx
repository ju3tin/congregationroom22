'use client';
import { useEffect, useRef } from 'react';

export default function RadioTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (timelineRef.current) {
        const timelineData = {
          title: {
            text: {
              headline: "Vibe FM",
              text: "Our Radio Station Journey"
            }
          },
          events: [
            {
              start_date: { year: "2010", month: "05" },
              text: { headline: "Station Founded", text: "First broadcast from a small studio." }
            },
            {
              start_date: { year: "2015", month: "03" },
              text: { headline: "100,000 Listeners", text: "Major milestone celebration" }
            },
            // Add more events here
          ]
        };

        // @ts-ignore
        new TL.Timeline(timelineRef.current, timelineData);
      }
    };

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-10">
          Radio Station Timeline
        </h1>
        <div ref={timelineRef} style={{ width: "100%" }} />
      </div>
    </div>
  );
}
