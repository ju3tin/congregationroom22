
import InstagramEmbed from "@/components/InstagramEmbed2";
import VideoPlayer from "@/components/videoplayer";

export default function Home() {
  const instagramUrl =
    "https://www.instagram.com/p/fA9uwTtkSN/";

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Instagram Video
      </h1>

      <InstagramEmbed url={instagramUrl} />
      <VideoPlayer src="https://github.com/ju3tin/congregationroom22/raw/refs/heads/redr/public/instagram/4tay_da_hosta/3942791312635414081.mp4" />
    <p>dsfsdf</p>
    </main>
  );
}
