import eventImage1 from "./12.jpg";
import eventImage2 from "./20.jpg";
import eventImage3 from "./27.jpg";

export type EventItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  registerUrl?: string;
  sortDate: string;
  status: "upcoming" | "past";
};

export const events: EventItem[] = [
  {
    id: "smile-on-gods-face-launch",
    title: "How to Put a Smile on God's Face",
    subtitle: "Book launch · Nigeria",
    description:
      "We appreciate your support in launching this book and your commitment to strengthening your relationship with God. Launch packages include complimentary copies of the book, with delivery across Nigeria.\n\nJoin us as we release a message crafted to help believers walk in intimacy with God — practical, heartfelt, and rooted in worship.",
    imageUrl: eventImage1,
    registerUrl: "https://selar.com/m/wole-emmanuel1",
    sortDate: "2026-01-01",
    status: "upcoming",
  },
  {
    id: "worship-flames-experience",
    title: "Worship Flames Live Experience",
    subtitle: "Coming soon · Lagos, Nigeria",
    description:
      "An evening of prophetic worship and ministry with Wole Emmanuel and True Worship Global. Expect extended moments in God's presence, live worship, and a gathering built for young people hungry for more.\n\nDates and venue will be announced soon. Register your interest to be notified first.",
    imageUrl: eventImage2,
    registerUrl: "mailto:hello@trueworshipglobal.com?subject=Worship%20Flames%20Live%20Experience",
    sortDate: "2026-06-01",
    status: "upcoming",
  },
  {
    id: "deep-soaking-night",
    title: "Deep Soaking Worship Night",
    subtitle: "Coming soon · Abuja, Nigeria",
    description:
      "Built around the Deep Soaking Worship sound, this night is designed for stillness, reflection, and encounter. Come expecting a atmosphere where worship leads and distractions fade.\n\nMore details coming soon.",
    imageUrl: eventImage3,
    registerUrl: "mailto:hello@trueworshipglobal.com?subject=Deep%20Soaking%20Worship%20Night",
    sortDate: "2026-07-01",
    status: "upcoming",
  },
  {
    id: "oba-ni-jesus-2023",
    title: "Oba Ni Jesus Concert",
    subtitle: "Apr 9, 2023 · Lagos, Nigeria",
    description:
      "A powerful night of worship featuring Wole Emmanuel alongside EmmaOMG and Pelumi Deborah, performing YESHUA and other spirit-filled songs before a vibrant audience.\n\nThis concert marked another milestone in carrying the gospel through music and unified worship.",
    imageUrl: eventImage2,
    sortDate: "2023-04-09",
    status: "past",
  },
];

export function getEventById(id: string): EventItem | undefined {
  return events.find((event) => event.id === id);
}

export function getUpcomingEvents(): EventItem[] {
  return sortEventsByDate(events.filter((e) => e.status === "upcoming")).reverse();
}

export function getPastEvents(): EventItem[] {
  return sortEventsByDate(events.filter((e) => e.status === "past"));
}

export function sortEventsByDate(list: EventItem[]): EventItem[] {
  return [...list].sort((a, b) => b.sortDate.localeCompare(a.sortDate));
}
