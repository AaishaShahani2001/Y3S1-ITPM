import { useEffect, useState } from "react";

export default function EventAnalytics({ event, onClose }) {
  const [registrations, setRegistrations] = useState([]);

  // 🔥 LOAD REGISTRATIONS
  useEffect(() => {
    if (!event) return;

    fetch(`http://localhost:3000/api/events/${event.ID}/registrations`)
      .then(res => res.json())
      .then(data => setRegistrations(data));
  }, [event]);

  // 🔥 REMOVE REGISTRATION
  const removeRegistration = async (id) => {
    await fetch(`http://localhost:3000/api/events/register/${id}`, {
      method: "DELETE",
    });

    setRegistrations(registrations.filter((r) => r.ID !== id));
  };

  if (!event) return null;

  return (
    <div className="mt-10 bg-white rounded-2xl shadow p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          📊 {event.Title}
        </h2>

        <button
          onClick={onClose}
          className="text-sm text-gray-500"
        >
          Close
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">

        <div className="bg-gray-100 p-4 rounded-xl">
          <p>Total</p>
          <h3 className="text-lg font-semibold">
            {registrations.length}
          </h3>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p>Capacity</p>
          <h3 className="text-lg font-semibold">
            {event.Capacity}
          </h3>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p>Remaining</p>
          <h3 className="text-lg font-semibold">
            {event.Capacity - registrations.length}
          </h3>
        </div>

      </div>

      {/* PROGRESS BAR */}
      <div className="h-3 bg-gray-200 rounded-full mb-6">
        <div
          className="h-full bg-blue-600"
          style={{
            width: event.Capacity
              ? `${(registrations.length / event.Capacity) * 100}%`
              : "0%",
          }}
        />
      </div>

      {/* STUDENTS */}
      {registrations.length === 0 ? (
        <p className="text-gray-500">No registrations</p>
      ) : (
        <div className="space-y-2">
          {registrations.map((r) => (
            <div
              key={r.ID}
              className="flex justify-between items-center bg-gray-50 p-3 rounded"
            >
              <div>
                <p className="font-medium">{r.Name}</p>
                <p className="text-sm text-gray-500">{r.Email}</p>
              </div>

              <button
                onClick={() => removeRegistration(r.ID)}
                className="bg-gray-900 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}