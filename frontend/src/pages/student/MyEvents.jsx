import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import { motion } from "framer-motion";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user?.token) {
      console.error("User not logged in");
      return;
    }

    fetch("http://localhost:3000/api/student/events", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Server error:", text);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  }, []);

  const today = new Date();

  const upcoming = events.filter(
    (e) => e.date && new Date(e.date) >= today
  );

  const past = events.filter(
    (e) => e.date && new Date(e.date) < today
  );

  // ✅ FIXED DATE (NO TIMEZONE BUG)
  const selectedDateStr =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const filteredEvents = events.filter(
    (e) => e.date === selectedDateStr
  );

  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // ✅ CANCEL FUNCTION
  const handleCancel = async (id) => {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(
      `http://localhost:3000/api/registration/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    if (res.ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-2xl"
    >
      {/* LEFT */}
      <div className="lg:col-span-3 space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            My Events
          </h2>
          <p className="text-gray-500 text-sm">
            Track and manage your registered events
          </p>
        </div>

        {/* SELECTED DATE */}
        {filteredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow"
          >
            <h3 className="text-blue-700 font-semibold mb-2">
              Events on Selected Date
            </h3>
            {filteredEvents.map((e) => (
              <div key={e.id}>
                <p className="font-semibold">{e.title}</p>
                <p className="text-sm text-gray-600">
                  {e.location}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* UPCOMING */}
        <h3 className="text-lg font-semibold text-gray-800">
          Upcoming Events
        </h3>

        {upcoming.length === 0 && <p>No upcoming events</p>}

        <div className="grid md:grid-cols-2 gap-6">
          {upcoming.map((e, index) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="group bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition border border-gray-200 overflow-hidden"
            >
              {/* IMAGE */}
              <div className="relative">
                <img
                  src={
                    e.image
                      ? `http://localhost:3000/${e.image}`
                      : "https://via.placeholder.com/400x200"
                  }
                  className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-2">
                <h4 className="font-semibold text-gray-800 text-lg">
                  {e.title}
                </h4>

                {/* BADGE BELOW IMAGE */}
                <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                  Upcoming
                </span>

                <p className="text-sm text-gray-500">
                  📅 {e.date}
                </p>
                <p className="text-sm text-gray-500">
                  📍 {e.location}
                </p>

                <p className="text-green-600 text-sm font-semibold">
                  {getDaysLeft(e.date)} days left
                </p>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCancel(e.id)}
                  className="mt-3 w-full py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow hover:shadow-lg"
                >
                  Cancel Registration
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* PAST */}
        <h3 className="text-lg font-semibold text-gray-800 mt-6">
          Past Events
        </h3>

        {past.length === 0 && <p>No past events</p>}

        <div className="grid md:grid-cols-2 gap-5">
          {past.map((e) => (
            <div
              key={e.id}
              className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden"
            >
              <img
                src={
                  e.image
                    ? `http://localhost:3000/${e.image}`
                    : "https://via.placeholder.com/400x200"
                }
                className="h-40 w-full object-cover"
              />

              <div className="p-4">
                <h4 className="font-semibold text-gray-700">
                  {e.title}
                </h4>

                <p className="text-sm text-gray-500">
                  📅 {e.date}
                </p>
                <p className="text-sm text-gray-500">
                  📍 {e.location}
                </p>

                <p className="text-red-500 font-semibold mt-2">
                  Completed
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - CALENDAR */}
      <div className="lg:col-span-1">
        <div className="bg-white p-5 rounded-2xl shadow border">
          <Calendar
            onChange={setDate}
            value={date}
           tileContent={({ date }) => {
            const formatted =
              date.getFullYear() +
              "-" +
              String(date.getMonth() + 1).padStart(2, "0") +
              "-" +
              String(date.getDate()).padStart(2, "0");

            const dayEvents = events.filter((e) => e.date === formatted);

            if (dayEvents.length > 0) {
              return (
                <div className="flex justify-center mt-1 relative group">
                  
                  {/* DOTS */}
                  <div className="flex gap-1">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      ></div>
                    ))}
                  </div>

                  {/* +MORE */}
                  {dayEvents.length > 3 && (
                    <span className="text-[10px] text-blue-600 ml-1">
                      +{dayEvents.length - 3}
                    </span>
                  )}

                  {/* TOOLTIP */}
                  <div className="absolute bottom-6 hidden group-hover:block bg-black text-white text-xs rounded-lg px-2 py-1 shadow-lg whitespace-nowrap z-50">
                    {dayEvents.map((e) => e.title).join(", ")}
                  </div>

                </div>
              );
            }
          }}
          />
        </div>
      </div>
    </motion.div>
  );
}