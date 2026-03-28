import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EventManagement() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editId, setEditId] = useState(null);

  const [error, setError] = useState("");

  // 🔥 FETCH EVENTS
  const fetchEvents = () => {
    fetch("http://localhost:3000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔥 IMAGE PREVIEW
  const handleImage = (file) => {
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔥 VALIDATION + CREATE
  const createEvent = async () => {
    setError("");

    const today = new Date().toISOString().split("T")[0];

    if (!title.trim() || title.length < 3) {
      return setError("Title must be at least 3 characters");
    }

    if (!description.trim()) {
      return setError("Description is required");
    }

    if (!date) {
      return setError("Please select a date");
    }

    if (date < today) {
      return setError("Event date must be in the future");
    }

    if (!capacity || capacity <= 0 || capacity > 1000) {
      return setError("Capacity must be between 1 - 1000");
    }

    if (!editId && !imageFile) {
      return setError("Please upload an event image");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("time", "10:00");
    formData.append("location", "Main Hall");
    formData.append("capacity", capacity);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `http://localhost:3000/api/events/${editId}`
      : "http://localhost:3000/api/events";

    await fetch(url, {
      method,
      body: formData,
    });

    // RESET
    setTitle("");
    setDescription("");
    setDate("");
    setCapacity("");
    setImageFile(null);
    setPreview("");
    setEditId(null);

    fetchEvents();
  };

  // 🔥 DELETE
  const deleteEvent = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this event? This will remove all registrations."
    );

    if (!confirmDelete) return;

    await fetch(`http://localhost:3000/api/events/${id}`, {
      method: "DELETE",
    });

    setEvents(events.filter((e) => e.ID !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">

      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Event Management
      </h2>

      {/* 🔥 FORM */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 backdrop-blur-xl border rounded-3xl p-6 shadow-xl mb-10"
      >
        <h3 className="text-lg font-semibold mb-4">
          {editId ? "Update Event" : "Create Event"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input md:col-span-2"
          />

          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="input"
          />

          <input
            type="file"
            onChange={(e) => handleImage(e.target.files[0])}
            className="input"
          />
        </div>

        {preview && (
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={preview}
            className="mt-4 h-44 w-full object-cover rounded-xl shadow"
          />
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={createEvent}
          className="mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition"
        >
          {editId ? "Update Event" : "Create Event"}
        </motion.button>

        {error && (
          <p className="text-red-500 mt-3 text-sm">{error}</p>
        )}
      </motion.div>

      {/* 🔥 EVENTS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {events.map((e, i) => (
          <motion.div
            key={e.ID}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden"
          >
            <img
              src={`http://localhost:3000/${e.Image}`}
              className="h-48 w-full object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg">{e.Title}</h3>

              <p className="text-sm text-gray-500">📅 {e.Date}</p>
              <p className="text-sm text-gray-500">📍 {e.Location}</p>

              <p className="text-blue-600 text-sm">
                Capacity: {e.Capacity}
              </p>

              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => {
                    setEditId(e.ID);
                    setTitle(e.Title);
                    setDescription(e.Description);
                    setDate(e.Date);
                    setCapacity(e.Capacity);
                    setPreview(`http://localhost:3000/${e.Image}`);
                  }}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-100"
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    navigate(`/admin/event-analytics/${e.ID}`)
                  }
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-100"
                >
                  Analytics
                </button>

                <button
                  onClick={() => deleteEvent(e.ID)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>

              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* INPUT STYLE */}
      <style>
        {`
          .input {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            outline: none;
          }

          .input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
          }
        `}
      </style>
    </div>
  );
}