import { useState } from "react";
import { useParams } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Stress Management Workshop",
    date: "25 March 2026 | 4:00 PM",
    location: "Main Hall",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  },
  {
    id: 2,
    title: "Mindfulness Session",
    date: "30 March 2026 | 10:00 AM",
    location: "Wellbeing Center",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
  },
];

export default function RegisterEvent() {
  const { id } = useParams();
  const event = events.find((e) => e.id === Number(id));

  const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  university: "",
  faculty: "",
  otherFaculty: "",
  level: "",
  degree: "",
  agree: false,
});

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  setForm({
    ...form,
    [name]: type === "checkbox" ? checked : value,
  });
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !form.name ||
    !form.email ||
    !form.phone ||
    !form.university ||
    !form.faculty ||
    !form.level ||
    !form.degree
  ) {
    setError("Please fill all required fields");
    return;
  }

  if (form.faculty === "Other" && !form.otherFaculty) {
    setError("Please specify your faculty");
    return;
  }

  if (!form.email.includes("@")) {
    setError("Invalid email");
    return;
  }

  if (!form.agree) {
    setError("Please accept terms");
    return;
  }

  setError("");

  try {
    const res = await fetch("http://localhost:3000/api/events/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_Id: event.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        university: form.university,
        faculty:
          form.faculty === "Other" ? form.otherFaculty : form.faculty,
        level: form.level,
        degree: form.degree,
      }),
    });

    const data = await res.json();

      if (res.ok) {
      setSuccess("🎉 Registration Confirmed!");
      
      setTimeout(() => {
        window.location.href = "/student-dashboard";
      }, 2000);
      
    } else {
      setError(data.message || "Registration failed");
    }

  } catch (err) {
    console.error(err);
    setError("Server error");
  }
};

  if (!event) return <div className="p-10">Event not found</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-10">

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">

        {/* 🔥 LEFT SIDE (FORM) */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-bold mb-6">
            Booking Confirmation
          </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

            {/* NAME + EMAIL */}
            <div className="grid md:grid-cols-2 gap-4">
                <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                />

                <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* PHONE */}
            <input
                type="text"
                name="phone"
                placeholder="Mobile Number (+94...)"
                value={form.phone}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            />

            {/* UNIVERSITY */}
            <input
                type="text"
                name="university"
                placeholder="University Name"
                value={form.university}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            />

            {/* FACULTY */}
            <select
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select Faculty</option>
                <option>Engineering</option>
                <option>Computing</option>
                <option>Business</option>
                <option>Humanity Science</option>
                <option>Other</option>
            </select>

            {/* OTHER FACULTY */}
            {form.faculty === "Other" && (
                <input
                type="text"
                name="otherFaculty"
                placeholder="Enter your faculty"
                value={form.otherFaculty}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                />
            )}

            {/* LEVEL */}
            <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                <input
                    type="radio"
                    name="level"
                    value="Undergraduate"
                    onChange={handleChange}
                />
                Undergraduate
                </label>

                <label className="flex items-center gap-2">
                <input
                    type="radio"
                    name="level"
                    value="Postgraduate"
                    onChange={handleChange}
                />
                Postgraduate
                </label>
            </div>

            {/* DEGREE */}
            <input
                type="text"
                name="degree"
                placeholder="Degree Programme (e.g. IT, CS, Business)"
                value={form.degree}
                onChange={handleChange}
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            />

            {/* TERMS */}
            <div className="flex items-center gap-2 text-sm">
                <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                />
                <span>
                I agree to the{" "}
                <span className="text-blue-600 underline">
                    terms & conditions
                </span>
                </span>
            </div>

            {/* BUTTON */}
            <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold transition transform hover:scale-105"
            >
                Confirm Registration
            </button>

            {/* ERROR / SUCCESS */}
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}
            </form>
        </div>

        {/* 🔥 RIGHT SIDE (EVENT SUMMARY) */}
        <div className="bg-white p-4 rounded-xl shadow">

          <img
            src={event.image}
            alt="event"
            className="rounded-lg mb-4 h-40 w-full object-cover"
          />

          <h3 className="font-semibold text-lg">
            {event.title}
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            📍 {event.location}
          </p>

          <p className="text-sm text-gray-500">
            📅 {event.date}
          </p>

          <div className="mt-4 text-green-600 font-semibold">
            🎟 FREE EVENT
          </div>

          <hr className="my-4" />

          <p className="text-sm text-gray-600">
            You are registering for this university wellbeing event.
          </p>
        </div>

      </div>
    </div>
  );
}