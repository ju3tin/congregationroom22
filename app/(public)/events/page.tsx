import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LivePlayer } from "@/components/live-player";
import EventsClient from "./EventsClient";

export const metadata = {
  title: "Events - Congregation Room 22",
  description: "Upcoming Congregation Room 22 events. Get your tickets and join us on the dancefloor.",
};

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventsClient />
      <Footer />
      <LivePlayer />
    </div>
  );
}
