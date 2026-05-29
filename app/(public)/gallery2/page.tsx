'use client';
import { useEffect, useRef, useState } from 'react';

export default function RadioTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => {
        // Ensure proper structure
        const safeData = {
          title: data.title || {
            text: {
              headline: "Vibe FM Radio Station",
              text: "Our Journey & Milestones"
            }
          },
          events: data.events || []
        };
        setTimelineData(safeData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load timeline data");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!timelineData || !timelineRef.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      try {
        // @ts-ignore
        new TL.Timeline(timelineRef.current, timelineData, {
          width: '100%',
          height: '680',
          initial_zoom: 3,
          start_at_slide: 0,
          timenav_position: 'bottom'
        });
      } catch (err) {
        console.error("TimelineJS Error:", err);
        setError("Error initializing timeline");
      }
    };

    return () => {
      if (link.parentNode) document.head.removeChild(link);
      if (script.parentNode) document.body.removeChild(script);
    };
  }, [timelineData]);

  if (loading) return <div className="text-center py-20 text-xl">Loading Timeline...</div>;
  if (error) return <div className="text-center py-20 text-red-500 text-xl">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-10">
          Vibe FM Timeline
        </h1>
        <div ref={timelineRef} style={{ height: "680px", width: "100%" }} />
      </div>
    </div>
  );
}
