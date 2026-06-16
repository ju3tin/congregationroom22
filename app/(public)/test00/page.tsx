import Checkout from '@/components/checkout';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";

export default function Page() {
  return (
        <div className="min-h-screen bg-background">
      <Header />
     
      <main className="pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mb-12">
    <div id="checkout">
      <Checkout />
    </div>
            </div>
        
        </section>
      </main>
        </div>
  )
}
