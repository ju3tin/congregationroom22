import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";
import DJsClient from "./DJsClient";

export const metadata = {
  title: "DJs - Congregation Room 22",
  description: "Meet the talented DJs behind Congregation Room 22's world-class programming.",
};

export default function DJsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-20">
        <DJsClient />
      </main>

      <Footer />
      <LivePlayer />
    </div>
  );
}
