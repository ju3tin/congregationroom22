"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DeleteSlideshowButtonProps {
  action: () => Promise<void>;
}

export default function DeleteSlideshowButton({
  action,
}: DeleteSlideshowButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this slideshow?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await action();
    } catch (error) {
      console.error(
        "Failed to delete slideshow:",
        error
      );

      alert("Failed to delete slideshow.");

      setDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4" />

      {deleting && (
        <span className="ml-2">
          Deleting...
        </span>
      )}
    </Button>
  );
}