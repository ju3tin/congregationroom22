export interface DJ {
  id: string
  name: string
  slug: string
  genre: string
  bio: string
  image: string
  socialLinks: {
    instagram?: string
    soundcloud?: string
    twitter?: string
  }
  upcomingShows: string[]
}

export interface Mix {
  id: string
  title: string
  djId: string
  djName: string
  genre: string
  duration: string
  releaseDate: string
  downloadUrl: string
  coverImage: string
  plays: number
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  venue: string
  address: string
  description: string
  image: string
  ticketPrice: number
  ticketsAvailable: number
  djIds: string[]
}

export interface MerchItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  sizes?: string[]
  inStock: boolean
}

export interface ScheduleSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  djId: string
  showName: string
}

export const djs: DJ[] = [
  {
    id: "1",
    name: "Gary G",
    slug: "garyg",
    genre: "House / Tech House",
    bio: "Gary G has been at the forefront of the underground house scene for over a decade. Known for his energetic sets and seamless transitions, he brings the heat to dancefloors worldwide. His weekly show has become a staple for house and garage music lovers.",
    image: "/images/image101.jpg",
    socialLinks: {
      instagram: "garygrierson78",
      soundcloud: "gary-grierson-591563083",
      twitter: "garygrierson78"
    },
    upcomingShows: ["GaryG - Every Thursday 10PM"]
  },
  {
    id: "2",
    name: "Marcus Wave",
    slug: "marcus-wave",
    genre: "Drum & Bass",
    bio: "Marcus Wave is a DnB pioneer who's been rolling out bass-heavy beats since the early 2000s. His signature sound blends liquid funk with harder rolling tracks, creating an atmosphere that's both euphoric and intense.",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
    socialLinks: {
      instagram: "marcuswave",
      soundcloud: "marcuswave"
    },
    upcomingShows: ["Bass Sessions - Saturday 8PM"]
  },
  {
    id: "3",
    name: "Elektra",
    slug: "elektra",
    genre: "Techno",
    bio: "Elektra brings dark, hypnotic techno straight from the Berlin underground. Her sets are known for their relentless energy and industrial edge. She's played at clubs across Europe and has releases on major techno labels.",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
    socialLinks: {
      instagram: "elektraofficial",
      soundcloud: "elektra",
      twitter: "elektramusic"
    },
    upcomingShows: ["Dark Matter - Sunday 12AM"]
  },
  {
    id: "4",
    name: "Sunset Kid",
    slug: "sunset-kid",
    genre: "Melodic House / Progressive",
    bio: "Sunset Kid creates emotional journeys through melodic house and progressive sounds. His sets are perfect for those magical sunset moments, blending deep grooves with uplifting melodies.",
    image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop",
    socialLinks: {
      instagram: "sunsetkid",
      soundcloud: "sunsetkid"
    },
    upcomingShows: ["Golden Hour - Thursday 6PM"]
  },
  {
    id: "5",
    name: "Vinyl Queen",
    slug: "vinyl-queen",
    genre: "Disco / Nu-Disco",
    bio: "Vinyl Queen keeps the spirit of disco alive with her all-vinyl sets. She's a collector of rare grooves and knows exactly how to get a party started with classic and modern disco cuts.",
    image: "https://images.unsplash.com/photo-1529518969858-8baa65152fc8?w=400&h=400&fit=crop",
    socialLinks: {
      instagram: "vinylqueen",
      twitter: "vinylqueendj"
    },
    upcomingShows: ["Disco Inferno - Wednesday 9PM"]
  },
  {
    id: "6",
    name: "Bass Prophet",
    slug: "bass-prophet",
    genre: "Dubstep / Bass Music",
    bio: "Bass Prophet delivers earth-shaking bass music that pushes sound systems to their limits. From deep dubstep to experimental bass, his sets are an auditory experience like no other.",
    image: "https://images.unsplash.com/photo-1571935441913-9cd63d3f96fc?w=400&h=400&fit=crop",
    socialLinks: {
      instagram: "bassprophet",
      soundcloud: "bassprophet",
      twitter: "bassprophetdj"
    },
    upcomingShows: ["Low Frequency - Tuesday 11PM"]
  }
]

export const mixes: Mix[] = [
  {
    id: "1",
    title: "Gary G's House Mix",
    djId: "1",
    djName: "Gary G",
    genre: "House / Garage",
    duration: "1:32:45",
    releaseDate: "2026-04-20",
    downloadUrl: "/downloads/garyginthemix.mp3",
    coverImage: "/images/image101.jpg",
    plays: 12450
  },
  {
    id: "2",
    title: "Liquid Rollers Session",
    djId: "2",
    djName: "Marcus Wave",
    genre: "Drum & Bass",
    duration: "1:15:30",
    releaseDate: "2026-04-18",
    downloadUrl: "/mixes/liquid-rollers.mp3",
    coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop",
    plays: 8920
  },
  {
    id: "3",
    title: "Dark Matter 023",
    djId: "3",
    djName: "Elektra",
    genre: "Techno",
    duration: "2:00:00",
    releaseDate: "2026-04-15",
    downloadUrl: "/mixes/dark-matter-23.mp3",
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop",
    plays: 15680
  },
  {
    id: "4",
    title: "Sunset Sessions - Ibiza Edition",
    djId: "4",
    djName: "Sunset Kid",
    genre: "Melodic House",
    duration: "1:45:00",
    releaseDate: "2026-04-12",
    downloadUrl: "/mixes/sunset-ibiza.mp3",
    coverImage: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=400&fit=crop",
    plays: 22100
  },
  {
    id: "5",
    title: "Disco Classics All Night",
    djId: "5",
    djName: "Vinyl Queen",
    genre: "Disco",
    duration: "1:58:20",
    releaseDate: "2026-04-10",
    downloadUrl: "/mixes/disco-classics.mp3",
    coverImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=400&fit=crop",
    plays: 9540
  },
  {
    id: "6",
    title: "Bass Quake Volume 12",
    djId: "6",
    djName: "Bass Prophet",
    genre: "Dubstep",
    duration: "1:20:00",
    releaseDate: "2026-04-08",
    downloadUrl: "/mixes/bass-quake-12.mp3",
    coverImage: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=400&fit=crop",
    plays: 11200
  }
]

export const events: Event[] = [
  {
    id: "1",
    title: "Warehouse Rave: Night Vision",
    date: "2026-05-15",
    time: "22:00",
    venue: "The Underground",
    address: "123 Industrial Way, Downtown",
    description: "An all-night techno journey featuring our resident DJs and special guests. Expect relentless beats and an immersive visual experience in our legendary warehouse space.",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop",
    ticketPrice: 25,
    ticketsAvailable: 150,
    djIds: ["3", "6"]
  },
  {
    id: "2",
    title: "Sunday Sunset Sessions",
    date: "2026-05-08",
    time: "16:00",
    venue: "Rooftop Garden",
    address: "456 Sky High Ave, Uptown",
    description: "Watch the sun go down to melodic house beats. A daytime-into-evening party with stunning city views, craft cocktails, and the smoothest grooves.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop",
    ticketPrice: 35,
    ticketsAvailable: 200,
    djIds: ["4", "1"]
  },
  {
    id: "3",
    title: "Bass Invasion",
    date: "2026-05-22",
    time: "21:00",
    venue: "The Bass Cave",
    address: "789 Low End Blvd",
    description: "Feel the bass in your chest as our heaviest hitters throw down dubstep and drum & bass all night. Warning: This event is not for the faint-hearted.",
    image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800&h=400&fit=crop",
    ticketPrice: 20,
    ticketsAvailable: 300,
    djIds: ["2", "6"]
  },
  {
    id: "4",
    title: "Disco Revival Night",
    date: "2026-05-29",
    time: "20:00",
    venue: "Studio 54 Revival",
    address: "321 Boogie Street",
    description: "Step back in time with our disco celebration. Glitter, platforms, and the finest disco cuts all night long. Dress code: Fabulous.",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=400&fit=crop",
    ticketPrice: 30,
    ticketsAvailable: 180,
    djIds: ["5"]
  }
]

export const merch: MerchItem[] = [
  {
    id: "1",
    name: "Congregation Room 22 Logo Tee",
    description: "Premium cotton tee featuring our iconic logo. Soft, comfortable, and perfect for the dancefloor.",
    price: 35,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    category: "Clothing",
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true
  },
  {
    id: "2",
    name: "Neon Nights Hoodie",
    description: "Stay warm at those late-night raves with our cozy hoodie featuring glow-in-the-dark print.",
    price: 65,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    category: "Clothing",
    sizes: ["S", "M", "L", "XL"],
    inStock: true
  },
  {
    id: "3",
    name: "Limited Edition Vinyl Box Set",
    description: "Collection of exclusive mixes pressed on 180g vinyl. Limited to 500 copies worldwide.",
    price: 120,
    image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=400&h=400&fit=crop",
    category: "Music",
    inStock: true
  },
  {
    id: "4",
    name: "Congregation Room 22 Snapback",
    description: "Classic snapback with embroidered logo. One size fits most.",
    price: 28,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop",
    category: "Accessories",
    inStock: true
  },
  {
    id: "5",
    name: "DJ Nova Signature Tee",
    description: "Official DJ Nova merchandise. Limited edition design.",
    price: 40,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop",
    category: "Clothing",
    sizes: ["S", "M", "L", "XL"],
    inStock: false
  },
  {
    id: "6",
    name: "Glow Stick Pack (100)",
    description: "Light up the night with our premium glow sticks. Perfect for events.",
    price: 15,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=400&fit=crop",
    category: "Accessories",
    inStock: true
  },
  {
    id: "7",
    name: "Congregation Room 22 Tote Bag",
    description: "Eco-friendly canvas tote with our signature design. Great for carrying your vinyl.",
    price: 22,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop",
    category: "Accessories",
    inStock: true
  },
  {
    id: "8",
    name: "Bass Prophet Poster",
    description: "High-quality print of Bass Prophet's iconic artwork. Size: 24x36 inches.",
    price: 25,
    image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&h=400&fit=crop",
    category: "Accessories",
    inStock: true
  }
]

export const schedule: ScheduleSlot[] = [
  { id: "1", dayOfWeek: 0, startTime: "00:00", endTime: "02:00", djId: "3", showName: "Dark Matter" },
  { id: "2", dayOfWeek: 1, startTime: "20:00", endTime: "22:00", djId: "4", showName: "Chill Vibes" },
  { id: "3", dayOfWeek: 2, startTime: "23:00", endTime: "01:00", djId: "6", showName: "Low Frequency" },
  { id: "4", dayOfWeek: 3, startTime: "21:00", endTime: "23:00", djId: "5", showName: "Disco Inferno" },
  { id: "5", dayOfWeek: 4, startTime: "18:00", endTime: "20:00", djId: "4", showName: "Golden Hour" },
  { id: "6", dayOfWeek: 5, startTime: "22:00", endTime: "00:00", djId: "1", showName: "Nova Nights" },
  { id: "7", dayOfWeek: 5, startTime: "00:00", endTime: "02:00", djId: "2", showName: "Late Night Rollers" },
  { id: "8", dayOfWeek: 6, startTime: "20:00", endTime: "22:00", djId: "2", showName: "Bass Sessions" },
  { id: "9", dayOfWeek: 6, startTime: "22:00", endTime: "00:00", djId: "6", showName: "Bass Takeover" }
]

export const dabChannels = [
  { id: "main", name: "Congregation Room 22 Main", frequency: "11D", bitrate: "128kbps", description: "Our flagship channel with 24/7 programming" },
  { id: "bass", name: "Congregation Room 22 Bass", frequency: "11D", bitrate: "96kbps", description: "Non-stop bass music - DnB, Dubstep, and more" },
  { id: "chill", name: "Congregation Room 22 Chill", frequency: "11D", bitrate: "96kbps", description: "Relaxed vibes and melodic sounds" }
]

export const getDjById = (id: string) => djs.find(dj => dj.id === id)
export const getDjBySlug = (slug: string) => djs.find(dj => dj.slug === slug)
export const getMixesByDj = (djId: string) => mixes.filter(mix => mix.djId === djId)
export const getEventsByDj = (djId: string) => events.filter(event => event.djIds.includes(djId))
