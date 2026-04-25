import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";
import { motion } from "framer-motion";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
      setShowQR(null);
    }, [date]);

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

  // FORMAT DATE (NO BUG)
  const selectedDateStr =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const filteredEvents = events.filter(
    (e) => e.date === selectedDateStr
  );

  // check if selected date has past event
  const hasPastEvent = filteredEvents.some(
    (e) => new Date(e.date) < today
  );

  const getDaysLeft = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

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

        {/* SELECTED DATE EVENTS */}
        {filteredEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border shadow ${
              hasPastEvent
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-100"
            }`}
          >
            <h3
              className={`font-semibold mb-3 ${
                hasPastEvent ? "text-red-700" : "text-blue-700"
              }`}
            >
              Events on {selectedDateStr}
            </h3>

            {filteredEvents.map((e) => {
              const isPast = new Date(e.date) < today;

              return (
                <div key={e.id} className="mb-3">
                  <p
                    className={`font-semibold ${
                      isPast ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {e.title}
                  </p>

                  <p className="text-sm text-gray-600">
                    📍 {e.location}
                  </p>

                  <p className="text-sm text-gray-500">
                    📅 {e.date}
                  </p>
                </div>
              );
            })}
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
                  className="h-44 w-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-2">
                <h4 className="font-semibold text-gray-800 text-lg">
                  {e.title}
                </h4>

                {/* STATUS */}
                {e.status === "waitlist" ? (
                  <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full">
                    Waitlist ⏳
                  </span>
                ) : (
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                    Registered ✅
                  </span>
                )}

                {e.status === "waitlist" && (
                  <p className="text-xs text-yellow-600 mt-1">
                    You are in waitlist
                  </p>
                )}

                {/* DETAILS */}
                <p className="text-sm text-gray-500">📅 {e.date}</p>
                <p className="text-sm text-gray-500">📍 {e.location}</p>

                <p className="text-green-600 text-sm font-semibold">
                  {getDaysLeft(e.date)} days left
                </p>

                {/* CANCEL BUTTON */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowQR(null);
                    handleCancel(e.id);
                  }}
                  className="mt-3 w-full py-2 bg-red-500 text-white rounded-lg"
                >
                  Cancel Registration
                </motion.button>

                {/* QR SECTION (ONLY FOR CONFIRMED USERS) */}
                {e.status === "confirmed" && e.qr && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() =>
                        setShowQR(showQR === e.id ? null : e.id)
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      {showQR === e.id ? "Hide QR" : "View QR"}
                    </button>

                    {showQR === e.id && (
                      <>
                        <img
                          src={e.qr}
                          alt="QR Code"
                          className="w-40 mx-auto mt-3 border rounded shadow"
                        />

                        <a
                          href={e.qr}
                          download
                          className="block mt-2 text-blue-500 underline"
                        >
                          Download QR
                        </a>
                      </>
                    )}
                  </div>
                )}
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
                {e.qr && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowQR(showQR === e.id ? null : e.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      {showQR === e.id ? "Hide QR" : "View QR"}
                    </button>

                    {showQR === e.id && (
                      <>
                        <img
                          src={e.qr}
                          alt="QR Code"
                          className="w-40 mx-auto mt-3 border rounded shadow"
                        />

                        <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = e.qr;
                              link.download = `event_qr_${e.id}.png`;
                              link.target = "_blank"; 

                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="block mt-2 text-blue-500 underline"
                          >
                            Download QR
                          </button>
                        
                      </>
                    )}
                  </div>
                )}
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

              const dayEvents = events.filter(
                (e) => e.date === formatted
              );

              if (dayEvents.length > 0) {
                return (
                  <div className="flex justify-center mt-1">
                    {dayEvents.slice(0, 3).map((event, i) => {
                      const isPast =
                        new Date(event.date) < today;

                      return (
                        <div
                          key={i}
                          className={`w-2 h-2 mx-[1px] rounded-full ${
                            isPast
                              ? "bg-red-500"
                              : "bg-blue-600"
                          }`}
                        ></div>
                      );
                    })}
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