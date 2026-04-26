import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // FETCH EVENTS + FILTER PAST EVENTS (FIXED)
  useEffect(() => {
    fetch("http://localhost:3000/api/events")
      .then((res) => res.json())
      .then((data) => {

        const now = new Date(); 

        const upcoming = data.filter((e) => {
          // combine date + time
          const eventDateTime = new Date(`${e.Date}T${e.Time}`);

          return eventDateTime >= now; 
        });

        setEvents(upcoming);
      })
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

      {/* HERO SLIDER */}
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

            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

            <div className="absolute bottom-6 left-6">
              <h2 className="text-white text-2xl font-bold">
                {events[currentSlide].Title}
              </h2>
            </div>
          </motion.div>
        )}
      </div>

      {/* TITLE */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Upcoming Events
        </h2>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => {

            const remaining =
              event.Capacity - (event.Registered || 0);

            const isFull = remaining <= 0;

            return (
              <motion.div
                key={event.ID}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isFull ? 1 : 1.05 }}
                onClick={() =>
                  !isFull && navigate(`/events/${event.ID}`)
                }
                className={`group rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border shadow-lg transition-all duration-300 ${
                  isFull
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer hover:shadow-2xl"
                }`}
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

                  {/* STATUS BADGE */}
                  <div className="absolute top-3 right-3">
                    {isFull ? (
                      <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                        Full
                      </span>
                    ) : (
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                        Available
                      </span>
                    )}
                  </div>

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

                  {/* SEATS INFO */}
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">
                      Capacity: {event.Capacity}
                    </span>
                    <span
                      className={
                        remaining > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }
                    >
                      {remaining > 0
                        ? `${remaining} left`
                        : "Full"}
                    </span>
                  </div>

                 {/* BUTTON */}
                  <div className="pt-3">
                    {isFull ? (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/events/${event.ID}?waitlist=true`)}
                        className="w-full py-2 rounded-xl text-sm font-medium shadow bg-yellow-500 text-white hover:bg-yellow-600 transition"
                      >
                        Join Waitlist
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-2 rounded-xl text-sm font-medium shadow bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg"
                      >
                        View Details →
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {events.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-400 text-lg">
              No upcoming events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}