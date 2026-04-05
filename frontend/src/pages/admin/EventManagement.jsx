import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function EventManagement() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [editId, setEditId] = useState(null);

  const [error, setError] = useState("");

  // FETCH EVENTS
  const fetchEvents = () => {
    fetch("http://localhost:3000/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch(() => setEvents([]));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // IMAGE PREVIEW
  const handleImage = (file) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // RESET FORM
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setCapacity("");
    setImageFile(null);
    setPreview("");
    setEditId(null);
  };

  // CREATE / UPDATE
  const createEvent = async () => {
    setError("");

    const today = new Date().toISOString().split("T")[0];

    if (!title.trim() || title.length < 3)
      return setError("Title must be at least 3 characters");

    if (!description.trim())
      return setError("Description is required");

    if (!date || date < today)
      return setError("Invalid date");

    if (!time)
      return setError("Please select a time");

    if (!location.trim())
      return setError("Location is required");

    if (!capacity || capacity <= 0 || capacity > 1000)
      return setError("Capacity must be between 1–1000");

    if (!editId && !imageFile)
      return setError("Please upload an image");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("location", location);
    formData.append("capacity", capacity);

    if (imageFile) formData.append("image", imageFile);

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `http://localhost:3000/api/events/${editId}`
      : "http://localhost:3000/api/events";

    await fetch(url, { method, body: formData });

    resetForm();
    fetchEvents();
  };

  // DELETE
  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    await fetch(`http://localhost:3000/api/events/${id}`, {
      method: "DELETE",
    });

    setEvents((prev) => (Array.isArray(prev) ? prev : []).filter((e) => e.ID !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">

      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Event Management
      </h2>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 backdrop-blur-2xl border rounded-3xl p-8 shadow-2xl mb-10"
      >

        {/* EDIT MODE */}
        {editId && (
          <div className="mb-5 p-3 rounded-xl bg-yellow-100 border flex justify-between">
            <span>✏️ Editing Event</span>
            <button onClick={resetForm} className="underline text-sm">
              Cancel
            </button>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-6">
          {editId ? "Update Event" : "Create Event"}
        </h3>

        <div className="grid md:grid-cols-2 gap-5">

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

          {/* BIG DESCRIPTION */}
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="input mt-1 resize-none"
              placeholder="Enter detailed event description..."
            />
          </div>

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="input"
          />

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input"
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

        {/* IMAGE */}
        {preview && (
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={preview}
            className="mt-5 h-44 w-full object-cover rounded-2xl shadow"
          />
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createEvent}
          className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-xl shadow-lg"
        >
          {editId ? "Update Event" : "Create Event"}
        </motion.button>

        {error && (
          <p className="text-red-500 mt-3 text-sm">{error}</p>
        )}
      </motion.div>

      {/* EVENTS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {(events ?? []).map((e, i) => (
          <motion.div
            key={e.ID}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{
              scale: 1.04,
              boxShadow: "0px 10px 30px rgba(0,0,0,0.1)"
            }}
            className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden"
          >
            <img
              src={`http://localhost:3000/${e.Image}`}
              className="h-48 w-full object-cover"
            />

            <div className="p-4">
              <h3 className="font-semibold text-lg">{e.Title}</h3>

              <p className="text-sm text-gray-500">📅 {e.Date}</p>
              <p className="text-sm text-gray-500">⏰ {e.Time}</p>
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
                    setTime(e.Time);
                    setLocation(e.Location);
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
            transition: all 0.2s;
          }

          .input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
          }
        `}
      </style>
    </div>
  );
}