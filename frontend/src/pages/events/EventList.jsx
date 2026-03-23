import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Stress Management Workshop",
    date: "25 March 2026",
    location: "Main Hall",
    capacity: 50,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
  },
  {
    id: 2,
    title: "Mindfulness Session",
    date: "30 March 2026",
    location: "Wellbeing Center",
    capacity: 30,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773"
  },
  {
    id: 3,
    title: "Career Growth Seminar",
    date: "5 April 2026",
    location: "Auditorium",
    capacity: 100,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df"
  }
];

export default function EventList() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // 🔥 AUTO SLIDER
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* 🔥 SMALL SLIDER (NOT FULL WIDTH) */}
      <div className="max-w-6xl mx-auto mt-6 px-6">
        <div className="relative h-[180px] rounded-2xl overflow-hidden shadow-lg">
          <img
            src={events[currentSlide].image}
            alt="event"
            className="w-full h-full object-cover transition-all duration-700"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h2 className="text-white text-xl font-bold">
              {events[currentSlide].title}
            </h2>
          </div>
        </div>
      </div>

      {/* 🔥 TITLE */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>

        {/* 🔥 EVENT CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-2xl transition duration-300 overflow-hidden hover:-translate-y-2"
            >
              <img
                src={event.image}
                alt="event"
                className="h-48 w-full object-cover group-hover:scale-105 transition duration-500"
              />

              <div className="p-4">
                <h3 className="font-bold text-lg hover:text-blue-600 transition">
                  {event.title}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  📅 {event.date}
                </p>
                <p className="text-sm text-gray-500">
                  📍 {event.location}
                </p>

                <div className="mt-2 text-sm text-blue-600 font-semibold">
                  Capacity: {event.capacity}
                </div>

                {/* 🔥 HOVER EFFECT BUTTON TEXT (NO CLICK BUTTON) */}
                <p className="mt-4 text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition">
                  View Details →
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}