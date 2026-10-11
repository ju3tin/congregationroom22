"use client";

import { Search } from "lucide-react";
import type { CR22ArchiveMediaFilter } from "./CR22ArchiveTypes";

interface CR22ArchiveFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: CR22ArchiveMediaFilter;
  onFilterChange: (value: CR22ArchiveMediaFilter) => void;
}

const filterOptions: {
  label: string;
  value: CR22ArchiveMediaFilter;
}[] = [
  { label: "All", value: "all" },
  { label: "Images", value: "image" },
  { label: "YouTube", value: "youtube" },
  { label: "Instagram", value: "instagram" },
  { label: "TikTok", value: "tiktok" },
  { label: "Other", value: "other" },
];

export default function CR22ArchiveFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
}: CR22ArchiveFiltersProps) {
  return (
    <div className="space-y-4">
      <label className="flex max-w-xl items-center gap-3 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 focus-within:border-white/40">
        <Search size={18} className="shrink-0 text-neutral-500" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search events or years..."
          aria-label="Search archive events"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
        />
      </label>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter archive by media type"
      >
        {filterOptions.map((option) => {
          const selected = filter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              aria-pressed={selected}
              className={[
                "rounded-full border px-4 py-2 text-xs font-medium transition",
                selected
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-white/[0.03] text-neutral-300 hover:border-white/40 hover:bg-white/[0.08]",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}