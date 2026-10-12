import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const videoRoot = path.join(root, "public", "instagram");
const outputDir = path.join(root, "data");
const outputFile = path.join(outputDir, "videos.json");

const extensions = new Set([".mp4", ".webm", ".mov", ".m4v"]);

function walk(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return walk(fullPath);

    if (extensions.has(path.extname(entry.name).toLowerCase())) {
      return [fullPath];
    }

    return [];
  });
}

if (!fs.existsSync(videoRoot)) {
  throw new Error(`Video directory not found: ${videoRoot}`);
}

const files = walk(videoRoot);
const videos = [];

for (const file of files) {
  const relativePath = path.relative(
    path.join(root, "public"),
    file
  );

  // Detect Git LFS pointer files before publishing broken URLs.
  const header = fs.readFileSync(file).subarray(0, 200).toString("utf8");

  if (header.startsWith("version https://git-lfs.github.com/spec/v1")) {
    throw new Error(
      `Git LFS pointer detected: ${relativePath}. ` +
      "The actual video must be available during the Vercel build."
    );
  }

  const parts = relativePath.split(path.sep);
  const username = parts.length >= 3 ? parts[1] : null;
  const filename = path.basename(file);

  videos.push({
    id: path.parse(filename).name,
    username,
    filename,
    path: "/" + relativePath.split(path.sep).map(encodeURIComponent).join("/"),
  });
}

videos.sort((a, b) => a.path.localeCompare(b.path));

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(videos, null, 2) + "\n");

console.log(`Generated video manifest: ${videos.length} videos`);