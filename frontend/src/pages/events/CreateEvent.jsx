import { useState } from "react";

function CreateEvent() {
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title) {
      setError("Event title is required");
      return;
    }

    if (capacity <= 0) {
      setError("Capacity must be greater than 0");
      return;
    }

    setError("");
    alert("Event Created Successfully!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Event</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br /><br />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <br /><br />

        <button type="submit">Create Event</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default CreateEvent;