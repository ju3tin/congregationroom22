'use client';
import { useEffect, useRef, useState } from 'react';

export default function RadioTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from MongoDB
  useEffect(() => {
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => {
        setTimelineData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Initialize TimelineJS
  useEffect(() => {
    if (!timelineData || !timelineRef.current) return;

    // Load TimelineJS from CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      new TL.Timeline(timelineRef.current, timelineData, {
        width: '100%',
        height: '700',
        initial_zoom: 3,
        start_at_slide: 0
      });
    };

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, [timelineData]);

  if (loading) {
    return <div className="text-center py-20 text-white text-xl">Loading Timeline...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-10">
          Vibe FM Timeline
        </h1>
        <div ref={timelineRef} style={{ height: "700px", width: "100%" }} />
      </div>
    </div>
  );
}
