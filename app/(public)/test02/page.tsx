import Slideshow from "@/components/SlideShow";

export default function Home() {
  const slides = [
    {
      image: "/images/blade.png",
      title: "First Slide",
      description: "This is the first slide.",
    },
    {
      image: "/images/GARYG.png",
      title: "Second Slide",
      description: "This is the second slide.",
    },
    {
      image: "/images/DnDada.png",
      title: "Third Slide",
      description: "This is the third slide.",
    },
  ];

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Slideshow
        slides={slides}
        autoPlay={true}
        interval={5000}
      />
    </main>
  );
}