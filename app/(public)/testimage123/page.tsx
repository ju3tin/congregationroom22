import Head from 'next/head'
import ImageSlider from '@/components/ImageSlider'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Image Slider</title>
        <meta name="description" content="Image slider example with Next.js, Tailwind CSS, and TypeScript" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center py-2">
        <ImageSlider />
      </main>
    </div>
  )
}