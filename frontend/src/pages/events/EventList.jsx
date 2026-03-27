import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // FETCH EVENTS
  useEffect(() => {
    fetch("http://localhost:3000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  // AUTO SLIDER
  useEffect(() => {
    if (events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [events]);

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen">

      {/* 🔥 HERO SLIDER */}
      <div className="max-w-6xl mx-auto mt-6 px-6">
        {events.length > 0 && (
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative h-[200px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src={
                events[currentSlide].Image
                  ? `http://localhost:3000/${events[currentSlide].Image}`
                  : "https://via.placeholder.com/800x300"
              }
              className="w-full h-full object-cover"
            />

            {/* DARK GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

            {/* TEXT */}
            <div className="absolute bottom-6 left-6">
              <h2 className="text-white text-2xl font-bold">
                {events[currentSlide].Title}
              </h2>
              <p className="text-gray-200 text-sm mt-1">
                Discover upcoming experiences
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 🔥 TITLE */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Upcoming Events
        </h2>

        {/* 🔥 CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.ID}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate(`/events/${event.ID}`)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden">
                <img
                  src={
                    event.Image
                      ? `http://localhost:3000/${event.Image}`
                      : "https://via.placeholder.com/300"
                  }
                  className="h-52 w-full object-cover group-hover:scale-110 transition duration-500"
                />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-2">
                <h3 className="font-semibold text-lg text-gray-800 group-hover:text-blue-600 transition">
                  {event.Title}
                </h3>

                <p className="text-sm text-gray-500">
                  📅 {event.Date}
                </p>

                <p className="text-sm text-gray-500">
                  📍 {event.Location || "Main Hall"}
                </p>

                <div className="text-sm font-medium text-blue-600">
                  Capacity: {event.Capacity}
                </div>

                {/* CTA */}
                <div className="pt-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow hover:shadow-lg transition"
                  >
                    View Details →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {events.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg">
              No events available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}