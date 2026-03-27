import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => setEvent(data))
      .catch((err) => console.error(err));
  }, [id]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    university: "",
    faculty: "",
    otherFaculty: "",
    level: "",
    degree: "",
    gender: "",
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

  setError("");
  setSuccess("");

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user?.token) {
    setError("User not logged in");
    return;
  }

  // 🔥 VALIDATIONS
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!form.name.trim()) return setError("Full name is required");

  if (!emailRegex.test(form.email))
    return setError("Enter a valid email address");

  if (!phoneRegex.test(form.phone))
    return setError("Phone must be 10 digits");

  if (!form.university.trim())
    return setError("University is required");

  if (!form.faculty)
    return setError("Please select a faculty");

  if (form.faculty === "Other" && !form.otherFaculty.trim())
    return setError("Please enter your faculty");

  if (!form.level)
    return setError("Please select your level");

  if (!form.degree.trim())
    return setError("Degree programme is required");

  if (!form.gender)
    return setError("Please select gender");

  if (!form.agree)
    return setError("You must accept terms & conditions");

  // 🔥 PAYLOAD
  const payload = {
    event_id: Number(id),
    name: form.name,
    email: form.email,
    phone: form.phone,
    university: form.university,
    faculty:
      form.faculty === "Other"
        ? form.otherFaculty
        : form.faculty,
    level: form.level,
    degree: form.degree,
    gender: form.gender,
  };

  try {
    const res = await fetch("http://localhost:3000/api/events/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      setSuccess("🎉 Registration Successful!");

      setTimeout(() => {
        navigate("/my-events");
      }, 1500);
    } else {
      setError(data.error || "Registration failed");
    }
  } catch (err) {
    setError("Server error");
  }
};

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10">

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">

        {/* 🔥 FORM */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-xl border"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Event Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid md:grid-cols-2 gap-4">
              <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="input"/>
              <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="input"/>
            </div>

            <input name="phone" placeholder="Mobile Number" value={form.phone} onChange={handleChange} className="input"/>
            <input name="university" placeholder="University Name" value={form.university} onChange={handleChange} className="input"/>

            <select name="faculty" value={form.faculty} onChange={handleChange} className="input">
              <option value="">Select Faculty</option>
              <option>Engineering</option>
              <option>Computing</option>
              <option>Business</option>
              <option>Humanity Science</option>
              <option>Other</option>
            </select>

            {form.faculty === "Other" && (
              <input name="otherFaculty" placeholder="Enter your faculty" value={form.otherFaculty} onChange={handleChange} className="input"/>
            )}

            <div className="flex gap-6 text-sm">
              <label><input type="radio" name="level" value="Undergraduate" onChange={handleChange}/> Undergraduate</label>
              <label><input type="radio" name="level" value="Postgraduate" onChange={handleChange}/> Postgraduate</label>
            </div>

            <input name="degree" placeholder="Degree Programme" value={form.degree} onChange={handleChange} className="input"/>

            <div className="flex gap-6 text-sm">
              <label><input type="radio" name="gender" value="Male" onChange={handleChange}/> Male</label>
              <label><input type="radio" name="gender" value="Female" onChange={handleChange}/> Female</label>
            </div>

            <div>
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange}/>
              <span className="ml-2 text-sm">I agree to terms & conditions</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition"
            >
              Confirm Registration
            </motion.button>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && (
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-green-600 font-semibold"
              >
                {success}
              </motion.p>
            )}
          </form>
        </motion.div>

        {/* 🔥 EVENT CARD */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-xl border"
        >
          <div className="relative">
            <img
              src={`http://localhost:3000/${event.Image}`}
              className="rounded-xl h-44 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl"></div>
          </div>

          <h3 className="font-semibold text-lg mt-4 text-gray-800">
            {event.Title}
          </h3>

          <p className="text-sm text-gray-500 mt-2">
            📍 {event.Location}
          </p>

          <p className="text-sm text-gray-500">
            📅 {event.Date}
          </p>

          <div className="mt-4 text-green-600 font-semibold">
            🎟 Free Event
          </div>
        </motion.div>

      </div>

      {/* 🔥 INPUT STYLE */}
      <style>
        {`
          .input {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            outline: none;
            transition: 0.3s;
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