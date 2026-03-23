import { useParams, useNavigate } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Stress Management Workshop",
    date: "25 March 2026 | 4:00 PM",
    location: "Main Hall",
    price: "Free",
    description:
      "Learn how to manage stress effectively through guided techniques and expert sessions.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  },
  {
    id: 2,
    title: "Mindfulness Session",
    date: "30 March 2026 | 10:00 AM",
    location: "Wellbeing Center",
    price: "Free",
    description:
      "Relax your mind with meditation and mindfulness practices guided by professionals.",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
  },
  {
    id: 3,
    title: "Career Growth Seminar",
    date: "5 April 2026 | 2:00 PM",
    location: "Auditorium",
    price: "Free",
    description:
      "Career guidance session to help students plan their future effectively.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
  },
];

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = events.find((e) => e.id === Number(id));

  if (!event) return <div className="p-10">Event not found</div>;

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* 🔥 BANNER (NOT FULL WIDTH) */}
      <div className="pt-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-xl overflow-hidden shadow-md">
            <img
              src={event.image}
              alt="event"
              className="w-full h-[260px] object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </div>
      </div>

      {/* 🔥 FLOATING CARD */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center -mt-12 relative z-10">

          {/* LEFT */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              {event.title}
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Wellbeing Event | English | 2hrs
            </p>

            <hr className="my-4" />

            <p className="text-gray-600 text-sm">📅 {event.date}</p>
            <p className="text-gray-600 text-sm">📍 {event.location}</p>

            <p className="text-orange-500 text-sm font-semibold mt-1">
              Filling Fast
            </p>
          </div>

          {/* RIGHT BUTTON */}
          <button
            onClick={() => navigate(`/register-event/${event.id}`)}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-lg font-semibold transition transform hover:scale-105 active:scale-95"
          >
            Book
          </button>
        </div>
      </div>

      {/* 🔥 CONTENT SECTION */}
      <div className="max-w-6xl mx-auto px-6 mt-10 grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* ABOUT */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">About Event</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>

          {/* TERMS */}
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-lg mb-2">Terms & Conditions</h3>
            <ul className="text-gray-600 text-sm list-disc pl-5 space-y-1">
              <li>No refunds after booking</li>
              <li>Arrive 15 minutes early</li>
              <li>Valid student ID required</li>
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h3 className="font-semibold text-lg mb-3">Location</h3>

          <p className="text-gray-600 text-sm mb-4">
            {event.location}, University Campus
          </p>

          <iframe
            title="map"
            src="https://maps.google.com/maps?q=colombo&t=&z=13&ie=UTF8&iwloc=&output=embed"
            className="w-full h-40 rounded-lg border"
          ></iframe>
        </div>
      </div>
    </div>
  );
}