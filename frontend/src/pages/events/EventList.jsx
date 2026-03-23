import { useState } from "react";

function EventList() {
  const [events] = useState([
    { id: 1, title: "Stress Management Workshop", capacity: 50 },
    { id: 2, title: "Mindfulness Session", capacity: 30 },
  ]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Wellbeing Events</h2>

      {events.map((event) => (
        <div key={event.id} style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          marginBottom: "10px"
        }}>
          <h3>{event.title}</h3>
          <p>Capacity: {event.capacity}</p>
          <button>Register</button>
        </div>
      ))}
    </div>
  );
}

export default EventList;