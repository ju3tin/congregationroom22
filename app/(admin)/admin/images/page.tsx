"use client";

import { useEffect, useState } from "react";

interface GitHubFile {
  name: string;
  path: string;
  size: number;
  sha: string;
  url: string;
  download_url: string;
}

export default function GitHubImagesPage() {
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadFiles() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/github/images", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load images");
      }

      setFiles(data.files || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load images"
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteFile(file: GitHubFile) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"?\n\nThis will permanently delete the image from GitHub.`
    );
  
    if (!confirmed) {
      return;
    }
  
    setError("");
    setMessage("");
  
    try {
      const response = await fetch("/api/github/images", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: file.path,
          sha: file.sha,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete image");
      }
  
      setMessage(`Deleted ${file.name} successfully.`);
  
      await loadFiles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete image"
      );
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function uploadFile() {
    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch("/api/github/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to upload image"
        );
      }

      setMessage(`Uploaded ${selectedFile.name} successfully.`);

      setSelectedFile(null);

      // Reset file input
      const input = document.getElementById(
        "image-upload"
      ) as HTMLInputElement;

      if (input) {
        input.value = "";
      }

      // Reload GitHub images
      await loadFiles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${
      sizes[i]
    }`;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              GitHub Images
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage images in{" "}
              <code className="rounded bg-gray-200 px-1.5 py-0.5">
                public/images
              </code>
            </p>
          </div>

          <button
            onClick={loadFiles}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Upload box */}
        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Upload Image
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(
                  e.target.files?.[0] || null
                );
                setMessage("");
                setError("");
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 sm:flex-1"
            />

            <button
              onClick={uploadFile}
              disabled={!selectedFile || uploading}
              className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {selectedFile && (
            <p className="mt-3 text-sm text-gray-500">
              Selected:{" "}
              <span className="font-medium text-gray-900">
                {selectedFile.name}
              </span>
            </p>
          )}

          {message && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* Image count */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Images
          </h2>

          <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
            {files.length}{" "}
            {files.length === 1 ? "image" : "images"}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500">
              Loading images from GitHub...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && files.length === 0 && !error && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="text-4xl">🖼️</div>

            <h3 className="mt-3 font-semibold text-gray-900">
              No images found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Upload your first image above.
            </p>
          </div>
        )}

        {/* Gallery */}
        {!loading && files.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => (
              <div
                key={file.sha}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={file.download_url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="p-4">
                  <h3
                    className="truncate text-sm font-semibold text-gray-900"
                    title={file.name}
                  >
                    {file.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {formatBytes(file.size)}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
  <a
    href={file.url}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-lg border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50"
  >
    GitHub
  </a>

  <a
    href={file.url}
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-lg bg-black px-3 py-2 text-center text-xs font-semibold text-white hover:bg-gray-800"
  >
    View
  </a>

  <button
    type="button"
    onClick={() => deleteFile(file)}
    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
  >
    Delete
  </button>
</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
