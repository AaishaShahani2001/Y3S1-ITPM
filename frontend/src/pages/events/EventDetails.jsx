import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/events/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then((data) => setEvent(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading event...
      </div>
    );
  }

  //CHECK IF EVENT FULL
  const isFull = event.Registered >= event.Capacity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <motion.div
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl"
        >
          <img
            src={
              event.Image
                ? `http://localhost:3000/${event.Image}`
                : "https://via.placeholder.com/800x300"
            }
            className="w-full h-[320px] object-cover"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

          {/* TITLE */}
          <div className="absolute bottom-6 left-6">
            <h2 className="text-white text-4xl font-bold">
              {event.Title}
            </h2>
            <p className="text-gray-200 text-sm mt-1">
              Enhance your wellbeing journey
            </p>
          </div>
        </motion.div>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-xl border rounded-3xl shadow-xl p-6 flex flex-col md:flex-row justify-between items-center -mt-16 relative z-10"
        >

          {/* LEFT */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {event.Title}
            </h2>

            {/* BADGES */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                Wellbeing
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                Interactive
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                2 Hours
              </span>
            </div>

            {/* INFO */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>📅 {event.Date}</p>
              <p>⏰ {event.Time}</p>
              <p>📍 {event.Location}</p>
            </div>

            <div className="mt-2 text-indigo-600 font-semibold text-sm">
              Capacity: {event.Capacity}
            </div>

            {/*FULL WARNING */}
            {isFull && (
              <p className="text-red-500 text-sm mt-2">
                ⚠️ Event full — you will be added to waitlist
              </p>
            )}
          </div>

          {/* CTA BUTTON */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/register-event/${event.ID}`)}
            className={`mt-5 md:mt-0 px-10 py-3 rounded-xl text-white font-semibold shadow-lg transition
              ${isFull
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-xl"}
            `}
          >
            {isFull ? "Join Waitlist →" : "Register Now →"}
          </motion.button>
        </motion.div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 mt-12 grid md:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* ABOUT */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border"
          >
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              About Event
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {event.Description || "No description available"}
            </p>
          </motion.div>

          {/* TERMS */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border"
          >
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Terms & Conditions
            </h3>
            <ul className="text-gray-600 text-sm list-disc pl-5 space-y-2">
              <li>No refunds after booking</li>
              <li>Arrive 15 minutes early</li>
              <li>Valid student ID required</li>
            </ul>
          </motion.div>
        </div>

        {/* RIGHT */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-lg border"
        >
          <h3 className="font-semibold text-lg mb-3 text-gray-800">
            📍 Location
          </h3>

          <p className="text-gray-600 text-sm mb-4">
            {event.Location}, University Campus
          </p>

          <iframe
            title="map"
            src="https://maps.google.com/maps?q=colombo&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="w-full h-44 rounded-xl border"
          ></iframe>
        </motion.div>
      </div>
    </div>
  );
}