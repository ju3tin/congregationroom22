'use client';
import { useEffect, useRef } from 'react';
import { Timeline } from '@knight-lab/timelinejs';
//import '@knight-lab/timelinejs/dist/css/timeline.css';

export default function RadioTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<any>(null);

  useEffect(() => {
    if (!timelineRef.current) return;

    const timelineData = {
      title: {
        media: {
          url: "https://your-radio-station-logo.png",
          caption: "Vibe FM",
          credit: "Radio Station"
        },
        text: {
          headline: "Our Story",
          text: "<p>The journey of your radio station from 2010 to today.</p>"
        }
      },
      events: [
        {
          start_date: { year: "2010", month: "05" },
          text: {
            headline: "Station Founded",
            text: "Vibe FM was born with its first broadcast."
          },
          media: { url: "https://source.unsplash.com/random/800x600/?radio" }
        },
        {
          start_date: { year: "2015", month: "03" },
          text: {
            headline: "Reached 100,000 Listeners",
            text: "Milestone celebration with live concert."
          }
        },
        {
          start_date: { year: "2023", month: "11" },
          text: {
            headline: "Digital Streaming Launch",
            text: "Now available on all major platforms."
          }
        },
        {
          start_date: { year: "2026", month: "05" },
          text: {
            headline: "Today",
            text: "Growing stronger with amazing events!"
          }
        }
      ]
    };

    timelineInstance.current = new Timeline(
      timelineRef.current,
      timelineData,
      {
        width: '100%',
        height: '650',
        initial_zoom: 2,
        font: 'default'
      }
    );

    // Cleanup on unmount
    return () => {
      if (timelineInstance.current) {
        timelineInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">
          Radio Station Timeline
        </h1>
        <div ref={timelineRef} className="timeline-container" />
      </div>
    </div>
  );
}
