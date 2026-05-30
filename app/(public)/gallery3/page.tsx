'use client';

import { useEffect, useRef } from 'react';

export default function RadioTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    let link: HTMLLinkElement | null = null;

    const initTimeline = async () => {
      try {
        // Fetch timeline data
        const response = await fetch('/api/timeline');
        const timelineData = await response.json();

        // Load CSS
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href =
          'https://cdn.knightlab.com/libs/timeline3/latest/css/timeline.css';
        document.head.appendChild(link);

        // Load JS
        script = document.createElement('script');
        script.src =
          'https://cdn.knightlab.com/libs/timeline3/latest/js/timeline.js';
        script.async = true;

        script.onload = () => {
          if (timelineRef.current) {
            // @ts-ignore
            new TL.Timeline(timelineRef.current, timelineData);
          }
        };

        document.body.appendChild(script);
      } catch (error) {
        console.error('Failed to load timeline:', error);
      }
    };

    initTimeline();

    return () => {
      if (link) document.head.removeChild(link);
      if (script) document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-gray-950">
      <div className="mx-auto">
        <div
          ref={timelineRef}
          style={{ height: '100vh', width: '100%' }}
        />
      </div>
    </div>
  );
}
