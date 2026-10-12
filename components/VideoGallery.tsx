
"use client";

import { useCallback, useEffect, useState } from "react";
import { Play, Search, Loader2, Video as VideoIcon } from "lucide-react";

type VideoItem = {
  id: string;
  username: string;
  filename: string;
  path: string;
  url: string;
};

type VideosResponse = {
  total: number;
  count: number;
  limit: number;
  offset: number;
  nextOffset: number | null;
  videos: VideoItem[];
};

export default function VideoGallery() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(100);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] =
    useState<VideoItem | null>(null);

  const loadVideos = useCallback(
    async (startOffset: number, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      setError("");

      try {
        const response = await fetch(
          `/api/videos?limit=${limit}&offset=${startOffset}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Failed to load videos.");
        }

        const data: VideosResponse = await response.json();

        setVideos((previous) =>
          append
            ? [
                ...previous,
                ...data.videos.filter(
                  (video) =>
                    !previous.some((item) => item.id === video.id)
                ),
              ]
            : data.videos
        );

        setTotal(data.total ?? 0);
        setOffset(data.nextOffset ?? startOffset + data.videos.length);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    void loadVideos(0);
  }, [loadVideos]);

  // Build a same-origin URL so localhost URLs from the API
  // also work when the site is deployed.
  const getVideoUrl = (video: VideoItem) => {
    if (video.path) {
      return `/api/video${video.path}`;
    }

    try {
      const url = new URL(video.url, window.location.origin);

      return `${url.pathname}${url.search}`;
    } catch {
      return video.url;
    }
  };

  const usernames = Array.from(
    new Set(videos.map((video) => video.username).filter(Boolean))
  ).sort();

  const filteredVideos = videos.filter((video) => {
    const query = search.trim().toLowerCase();

    return (
      video.username.toLowerCase().includes(query) ||
      video.filename.toLowerCase().includes(query) ||
      video.id.toLowerCase().includes(query)
    );
  });

  const hasMore = videos.length < total;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-red-500">
            <VideoIcon size={18} />
            CR22 Video Archive
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Video Gallery
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Browse and watch videos from the archive.
            {!loading && ` ${total} videos available.`}
          </p>
        </div>

        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search usernames or videos..."
            className="w-full rounded-xl border border-neutral-300 bg-transparent py-3 pl-10 pr-4 text-sm outline-none focus:border-red-500 dark:border-neutral-700"
          />
        </div>
      </div>

      {!loading && usernames.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSearch("")}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:border-red-500 dark:border-neutral-700"
          >
            All videos
          </button>

          {usernames.map((username) => (
            <button
              key={username}
              onClick={() => setSearch(username)}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:border-red-500 dark:border-neutral-700"
            >
              @{username}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 p-5 text-red-500">
          {error}
          <button
            onClick={() => void loadVideos(0)}
            className="ml-3 underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center gap-3">
          <Loader2 className="animate-spin" />
          Loading videos...
        </div>
      ) : (
        <>
          {filteredVideos.length === 0 && !error ? (
            <div className="rounded-2xl border border-neutral-200 p-12 text-center dark:border-neutral-800">
              No videos found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredVideos.map((video) => (
                <article
                  key={video.id}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="relative aspect-[9/16] overflow-hidden bg-black">
                    <video
                      src={getVideoUrl(video)}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-contain"
                      aria-label={`Video by ${video.username}`}
                    />

                    <button
                      type="button"
                      onClick={() => setSelectedVideo(video)}
                      aria-label={`Open video by ${video.username}`}
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    >
                      <Play size={18} />
                    </button>
                  </div>

                  <div className="p-4">
                    <p className="font-semibold">
                      @{video.username}
                    </p>
                    <p className="mt-1 truncate text-xs text-neutral-500">
                      {video.filename}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                disabled={loadingMore}
                onClick={() => void loadVideos(offset, true)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loadingMore && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                Load more videos
              </button>
            </div>
          )}
        </>
      )}

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="mb-3 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20"
            >
              Close video ✕
            </button>

            <video
              key={selectedVideo.id}
              src={getVideoUrl(selectedVideo)}
              controls
              autoPlay
              playsInline
              className="max-h-[80vh] w-full rounded-xl bg-black"
            />

            <p className="mt-3 text-white">
              @{selectedVideo.username}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
