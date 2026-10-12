
import InstagramEmbed from "@/components/InstagramEmbed2";

export default function Home() {
  const instagramUrl =
    "https://www.instagram.com/p/fA9uwTtkSN/";

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold">
        Instagram Video
      </h1>

      <InstagramEmbed url={instagramUrl} />
    </main>
  );
}
