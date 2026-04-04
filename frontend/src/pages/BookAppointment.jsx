import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaSmile, FaMeh, FaFrown, FaAngry, FaTired, FaBrain,
  FaStar, FaArrowRight, FaArrowLeft, FaCheckCircle,
  FaExclamationCircle, FaUserMd, FaCalendarAlt, FaClock,
  FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaRobot
} from "react-icons/fa";
import { toast } from "react-toastify";

const MOODS = [
  { label: "Happy", icon: <FaSmile />, value: "happy", color: "bg-green-100 text-green-600" },
  { label: "Neutral", icon: <FaMeh />, value: "neutral", color: "bg-gray-100 text-gray-600" },
  { label: "Sad", icon: <FaFrown />, value: "sad", color: "bg-blue-100 text-blue-600" },
  { label: "Stressed", icon: <FaTired />, value: "stressed", color: "bg-yellow-100 text-yellow-600" },
  { label: "Angry", icon: <FaAngry />, value: "angry", color: "bg-red-100 text-red-600" }
];

// Keep static fallback in case backend fails or returns empty during demo
const FALLBACK_COUNSELLORS = [
  { id: "1", name: "Dr. Nethmi Perera", category: "Stress Management", experience: 5, rating: 4.8, image: "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300", workplace: "New Building F1301" },
  { id: "2", name: "Mr. Dilan Fernando", category: "Academic Support", experience: 3, rating: 4.6, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Main Building A202" },
  { id: "3", name: "Ms. Kavindi Silva", category: "Career Guidance", experience: 4, rating: 4.9, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Wellness Center W101" },
  { id: "4", name: "Dr. Kamal Perera", category: "Mental Health Specialist", experience: 10, rating: 5.0, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Medical Wing M10" },
  { id: "5", name: "Ms. Aruni Jay", category: "Emotional Regulation Expert", experience: 6, rating: 4.7, image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Wellness Center W102" },
];

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);

  const [moodData, setMoodData] = useState({
    mood: "",
    intensity: 5,
    description: "",
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null); // { mood, suggest, urgency }

  const [counsellors, setCounsellors] = useState([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(true);

  const [selectedCounsellorId, setSelectedCounsellorId] = useState(id || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availability, setAvailability] = useState([]);

  const [formData, setFormData] = useState({
    age: "",
    contactNumber: "",
    guardianPhoneNumber: "",
    medicalNotes: "",
    report: null,
  });

  const validateStep1 = () => {
    let newErrors = {};

    if (!moodData.mood) {
      newErrors.mood = "Please select your mood";
    }

    if (!moodData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (moodData.description.length < 10) {
      newErrors.description = "Minimum 10 characters required";
    } else if (moodData.description.length > 300) {
      newErrors.description = "Maximum 300 characters allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    let newErrors = {};

    if (!selectedDate) newErrors.date = "Please select a date";
    if (!selectedSlot) newErrors.slot = "Please select a time slot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    let newErrors = {};

    const ageValue = String(formData.age || "").trim();
    if (!ageValue) {
      newErrors.age = "Age is required";
    } else if (!/^\d{1,2}$/.test(ageValue)) {
      newErrors.age = "Age must be 1 or 2 digits";
    } else {
      const ageNumber = Number(ageValue);
      if (Number.isNaN(ageNumber) || ageNumber < 1 || ageNumber > 60) {
        newErrors.age = "Age must be between 1 and 60";
      }
    }

    const contact = formData.contactNumber.trim();
    if (!contact) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^0\d{9}$/.test(contact)) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits (starts with 0)";
    }

    const guardian = formData.guardianPhoneNumber.trim();
    if (!guardian) {
      newErrors.guardianPhoneNumber = "Guardian phone number is required";
    } else if (!/^0\d{9}$/.test(guardian)) {
      newErrors.guardianPhoneNumber = "Guardian number must be exactly 10 digits (starts with 0)";
    }

    if (formData.medicalNotes.length > 500) {
      newErrors.medicalNotes = "Max 500 characters allowed";
    }

    if (formData.report) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(formData.report.type)) {
        newErrors.report = "Only PDF, JPG, PNG allowed";
      }

      if (formData.report.size > 2 * 1024 * 1024) {
        newErrors.report = "File must be less than 2MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/counsellor/all");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(c => ({
            id: c.userId.toString(), // Use userId instead of counsellor application ID
            counsellorAppId: c.id.toString(), // Keep the application ID for reference
            name: c.fullName,
            category: c.specialization,
            experience: c.experience,
            rating: 4.8,
            image: c.profileImage
              ? `http://localhost:3000/${c.profileImage}`
              : "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300",
            workplace: c.workplace
          }));
          setCounsellors(mapped.length > 0 ? mapped : FALLBACK_COUNSELLORS);
        } else {
          setCounsellors(FALLBACK_COUNSELLORS);
        }
      } catch (err) {
        console.error("Failed to fetch counsellors", err);
        setCounsellors(FALLBACK_COUNSELLORS);
      } finally {
        setLoadingCounsellors(false);
      }
    };
    fetchCounsellors();

    const randomId = "BK-" + Math.floor(100000 + Math.random() * 900000);
    setBookingId(randomId);
  }, []);

  const selectedCounsellor = counsellors.find(c => c.id === (selectedCounsellorId));

  // AI recommendation must match counsellor specialization (case-insensitive)
  const suggestedCounsellors = useMemo(() => {
    if (!aiResult?.suggest) return [];
    const suggestNorm = (aiResult.suggest || "").trim().toLowerCase();
    if (!suggestNorm) return [];
    return counsellors.filter(c => (c.category || "").trim().toLowerCase() === suggestNorm);
  }, [aiResult, counsellors]);

  const getUrgency = (score) => {
    if (!score) return { label: "Unknown", color: "text-gray-600 bg-gray-50 border-gray-100" };
    if (score <= 3) return { label: "Normal", color: "text-green-600 bg-green-50 border-green-100" };
    if (score <= 6) return { label: "Medium", color: "text-orange-600 bg-orange-50 border-orange-100" };
    return { label: "High Priority", color: "text-red-600 bg-red-50 border-red-100" };
  };

  const handleAnalyzeMood = async () => {
    if (!validateStep1()) return;

    //   console.log("Sending to backend:", {
    //   mood: moodData.mood,
    //   intensity: moodData.intensity,
    //   description: moodData.description
    // });

    setIsAnalyzing(true);
    try {
      const res = await fetch("http://localhost:3000/api/mood/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mood: moodData.mood,
          intensity: moodData.intensity,
          description: moodData.description
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
        setStep(2);
        setErrors({});
      } else {
        const text = await res.text();
        console.error(text);
        alert(text);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to AI service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const nextStep = () => {
    if (step === 3 && !validateStep3()) return;

    if (step === 2 && !selectedCounsellorId && !id) {
      setErrors({ counsellor: "Please select a counsellor" });
      return;
    }

    setErrors({});
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  // Counselor availability dates come from `<input type="date" />` so they are already `YYYY-MM-DD`.
  // Keep everything in ISO format internally, and only format for display.
  const parseISODateToUTC = (isoDate) => {
    const [y, m, d] = (isoDate || "").split("-").map(Number);
    if (!y || !m || !d) return NaN;
    return Date.UTC(y, m - 1, d);
  };

  const formatDateLabel = (isoDate) => {
    if (!isoDate) return "";
    const utcMs = parseISODateToUTC(isoDate);
    if (!Number.isFinite(utcMs)) return isoDate;

    const dateUTC = new Date(utcMs);
    const month = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(dateUTC);
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(dateUTC);
    const day = isoDate.split("-")[2];
    return `${month} ${day}, ${weekday}`;
  };

  const selectedDateLabel = useMemo(
    () => (selectedDate ? formatDateLabel(selectedDate) : ""),
    [selectedDate]
  );

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const isSlotInPast = (dateStr, startTime) => {
    if (dateStr !== todayStr) return false;
    const [h, m] = (startTime || "00:00").split(":").map(Number);
    const slotMins = (h || 0) * 60 + (m || 0);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return slotMins <= nowMins;
  };

  const handleSubmit = async (e) => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
      localStorage.setItem("redirectAfterLogin", "booking-step4");

      navigate("/auth", {
        state: { message: "Please login to book an appointment 🔒" }
      });

      return;
    }
    e.preventDefault();

    const form = new FormData();

    form.append("bookingId", bookingId);
    form.append("counsellorId", selectedCounsellorId);
    form.append("date", selectedDate);
    form.append("timeSlot", selectedSlot);
    form.append("mood", aiResult?.mood || "");
    form.append("urgency", aiResult?.urgency || 0);
    form.append("age", formData.age);
    form.append("contactNumber", formData.contactNumber);
    form.append("guardianPhoneNumber", formData.guardianPhoneNumber);
    form.append("medicalNotes", formData.medicalNotes);

    if (formData.report) {
      form.append("report", formData.report);
    }

    try {
      const res = await fetch("http://localhost:3000/api/appointments/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Appointment booked successfully.");
        setSubmitted(true);
      } else {
        if (data.error === "This time slot is already booked") {
          toast.error("⚠️ This slot is already taken. Please choose another time.");
        } else {
          toast.error(data.error || "Booking failed");
        }
      }

    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server.");
    }
  };

  useEffect(() => {
    const redirect = localStorage.getItem("redirectAfterLogin");

    if (redirect === "booking-step4") {
      setStep(4);
      localStorage.removeItem("redirectAfterLogin");
    } else if (redirect === "booking-step3") {
      setStep(3);
      localStorage.removeItem("redirectAfterLogin");
    }
  }, []);


  useEffect(() => {
    if (!selectedDate || !selectedCounsellorId) {
      console.log("Missing date or counsellor, skipping booked slots fetch");
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        const url = `http://localhost:3000/api/appointments/booked-slots?counsellorId=${selectedCounsellorId}&date=${selectedDate}`;
        
        console.log("Fetching booked slots from:", url);
        
        const res = await fetch(url);
        const data = await res.json();

        console.log("Booked slots response:", data);

        if (res.ok) {
          const slots = data.bookedSlots || [];
          console.log("Setting booked slots:", slots);
          setBookedSlots(slots);
        } else {
          console.error("Failed to fetch booked slots");
          setBookedSlots([]);
        }
      } catch (err) {
        console.error("Error fetching booked slots:", err);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedDate, selectedCounsellorId]);

  const progress = (step / 4) * 100;

  console.log("Sending:", {
    mood: moodData.mood,
    intensity: moodData.intensity,
    description: moodData.description
  });

  useEffect(() => {
    if (!selectedCounsellorId) {
      console.log("No counsellor selected, skipping availability fetch");
      return;
    }

    console.log("Fetching availability for counsellorId:", selectedCounsellorId);

    const fetchAvailability = async () => {
      try {
        const url = `http://localhost:3000/api/counsellor/availability/${selectedCounsellorId}`;
        console.log("Fetching from URL:", url);
        
        const res = await fetch(url);
        const data = await res.json();

        console.log("Availability response status:", res.status);
        console.log("Availability response data:", data);

        if (res.ok) {
          const slots = Array.isArray(data) ? data : (data || []);
          console.log("Setting availability with", slots.length, "slots");
          setAvailability(slots);
        } else {
          console.error("Failed to fetch availability. Status:", res.status);
          setAvailability([]);
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        setAvailability([]);
      }
    };

    fetchAvailability();
  }, [selectedCounsellorId]);

  const availableSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return availability
      .filter((slot) => slot.date === selectedDate)
      .filter((slot) => !isSlotInPast(slot.date, slot.startTime));
  }, [availability, selectedDate]);

  const formatTime = (time) => {
    const [hour, minute] = (time || "00:00").split(":");
    let h = parseInt(hour) || 0;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h.toString().padStart(2, "0")}:${minute || "00"} ${ampm}`;
  };

  const availableDates = useMemo(() => {
    const distinct = Array.from(
      new Set(availability.map((slot) => slot.date).filter(Boolean))
    );
    const futureOrToday = distinct.filter((d) => d >= todayStr);
    return futureOrToday.sort((a, b) => parseISODateToUTC(a) - parseISODateToUTC(b));
  }, [availability, todayStr]);

  // Clear selection if it becomes invalid (past date/slot)
  useEffect(() => {
    if (selectedDate && !availableDates.includes(selectedDate)) {
      setSelectedDate("");
      setSelectedSlot("");
    }
  }, [selectedDate, availableDates]);

  useEffect(() => {
    if (!selectedSlot || availableSlotsForDate.length === 0) return;
    const stillValid = availableSlotsForDate.some((s) => formatTime(s.startTime) === selectedSlot);
    if (!stillValid) setSelectedSlot("");
  }, [selectedSlot, availableSlotsForDate]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Progress Bar */}
        {!submitted && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Step {step} of 4</p>
                <h2 className="text-lg font-black text-slate-900">
                  {step === 1 ? "Mental Check-in" :
                    step === 2 ? "Select Specialist" :
                      step === 3 ? "Schedule Session" : "Finalize Booking"}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400">{Math.round(progress)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {submitted ? (
            <div className="p-8 text-center animate-scaleIn">
              <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-green-200 mb-6">
                <FaCheckCircle />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Appointment Secured!</h1>
              <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                Your session with Mr/Mrs/Miss.<span className="text-slate-900 font-bold">{selectedCounsellor?.name}</span> is being processed.
                You'll receive a confirmation email shortly.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-left max-w-md mx-auto grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                  <p className="font-mono text-sm font-bold text-slate-900 tracking-tighter">{bookingId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${getUrgency(aiResult?.urgency || 5).color}`}>
                    {getUrgency(aiResult?.urgency || 5).label}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-bold text-sm text-slate-900">{selectedDateLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                  <p className="font-bold text-sm text-slate-900">{selectedSlot}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md"
                >
                  Back to Home
                </button>
                <button
                  className="px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-slate-50 transition-all"
                >
                  Download Receipt
                </button>
              </div>
            </div>
          ) : (
            <>

              {/* STEP 1: AI MOOD CHECK */}
              {step === 1 && (
                <div className="p-6 md:p-8 animate-fadeIn">

                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                    How are you feeling today?
                  </h2>

                  <p className="text-slate-500 text-sm mb-6 font-medium">
                    Select your mood and tell us more about what you're experiencing.
                  </p>

                  {/* Emoji Mood Selector */}
                  <div className="grid grid-cols-5 gap-3 mb-6">
                    {MOODS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMoodData({ ...moodData, mood: m.value })}
                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all 
                          ${moodData.mood === m.value
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-100 hover:border-blue-200"
                          }`}
                      >
                        <div className={`text-2xl ${m.color}`}>
                          {m.icon}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Intensity Slider */}
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                      Emotion Intensity
                    </label>

                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={moodData.intensity}
                      onChange={(e) =>
                        setMoodData({ ...moodData, intensity: Number(e.target.value) })
                      }
                      className="w-full"
                    />

                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>Low</span>
                      <span className="font-bold text-blue-600">{moodData.intensity}</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="relative mb-8">
                    <textarea
                      value={moodData.description}
                      onChange={(e) =>
                        setMoodData({ ...moodData, description: e.target.value })
                      }
                      placeholder="Describe your situation... (e.g., I feel stressed about my exams)"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-300 transition-all outline-none min-h-32 shadow-sm"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                    )}

                    <div className="absolute top-4 right-4 text-slate-300 text-2xl">
                      <FaBrain />
                    </div>
                  </div>

                  {/* Analyze Button */}
                  <button
                    onClick={handleAnalyzeMood}
                    disabled={isAnalyzing || !moodData.mood}
                    className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 
                      ${isAnalyzing || !moodData.mood
                        ? "bg-blue-300 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Analyzing Mood...
                      </>
                    ) : (
                      <>
                        Analyze Mood <FaRobot />
                      </>
                    )}
                  </button>

                </div>
              )}

              {/* STEP 2: RECOMMENDATION & SELECTION */}
              {step === 2 && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <button onClick={prevStep} className="inline-flex items-center text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Retake Analysis
                  </button>

                  <div className="bg-blue-600 p-6 rounded-2xl mb-8 shadow-lg shadow-blue-200 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
                        <FaRobot />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">AI Recommendation</p>
                        <h3 className="text-xl font-black tracking-tight mb-1">You need {aiResult?.suggest}</h3>
                        <p className="text-blue-100 text-xs font-medium leading-relaxed opacity-90 max-w-sm">
                          Based on your reported feelings, we categorized your mood as <span className="text-white font-bold capitalize">{aiResult?.mood}</span> with an urgency score of {aiResult?.urgency}/10.
                          Our system recommends an expert specializing in {aiResult?.suggest?.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
                    {id ? "Selected Specialist" : suggestedCounsellors.length > 0
                      ? `Recommended Specialists (${aiResult?.suggest})`
                      : "Available Specialists"}
                  </h4>
                  <div className="space-y-3 mb-8">
                    {loadingCounsellors ? (
                      <p className="text-sm text-slate-500 text-center py-4">Loading specialists...</p>
                    ) : (
                      (id ? counsellors.filter(c => c.id === id) : suggestedCounsellors.length > 0 ? suggestedCounsellors : counsellors).map(c => (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCounsellorId(c.id)}
                          className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedCounsellorId === c.id || (id === c.id)
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                            : "bg-white border-slate-100 hover:border-blue-200"
                            }`}
                        >
                          <img src={c.image} alt={c.name} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                          <div className="flex-1">
                            <h5 className={`text-base font-black ${selectedCounsellorId === c.id || (id === c.id) ? 'text-white' : 'text-slate-900'}`}>{c.name}</h5>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${selectedCounsellorId === c.id || (id === c.id) ? 'text-slate-400' : 'text-slate-500'}`}>
                                <FaBriefcase /> {c.category}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${selectedCounsellorId === c.id || (id === c.id) ? 'text-slate-400' : 'text-slate-500'}`}>
                                <FaGraduationCap /> {c.experience}+ Yrs
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                              <div className="flex items-center justify-end text-yellow-400 gap-1 mb-0.5">
                                <FaStar className="w-3 h-3" /> <span className="font-bold text-xs">{c.rating}</span>
                              </div>
                              <p className={`text-[9px] font-black uppercase tracking-widest ${selectedCounsellorId === c.id || (id === c.id) ? 'text-slate-500' : 'text-slate-300'}`}>Reviews</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedCounsellorId === c.id || (id === c.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                              {(selectedCounsellorId === c.id || id === c.id) && <FaCheckCircle className="text-white text-xs" />}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {errors.counsellor && (
                      <p className="text-red-500 text-xs mb-4">{errors.counsellor}</p>
                    )}
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!selectedCounsellorId && !id}
                    className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${(selectedCounsellorId || id)
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    Select Scheduling Slots <FaArrowRight />
                  </button>
                </div>
              )}

              {/* STEP 3: SCHEDULING */}
              {step === 3 && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <button onClick={prevStep} className="inline-flex items-center text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Previous Step
                  </button>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Pick a convenient time</h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">Seeing {selectedCounsellor?.name} at {selectedCounsellor?.workplace}.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-600" /> Select Date
                      </h4>
                      {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        {availableDates.length === 0 ? (
                          <p className="text-sm text-slate-400 col-span-2">No dates available</p>
                        ) : (
                          availableDates.map((date) => (
                            <button
                              key={date}
                              onClick={() => { setSelectedDate(date); setSelectedSlot(""); }}
                              className={`p-3 text-xs rounded-xl border-2 font-bold transition-all ${
                                selectedDate === date
                                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                  : "bg-slate-50 border-slate-50 text-slate-600 hover:border-blue-100 hover:bg-white"
                              }`}
                            >
                              {formatDateLabel(date)}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-2">
                        <FaClock className="text-blue-600" /> Available Slots
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {availableSlotsForDate.length === 0 ? (
                          <p className="text-sm text-slate-400">No slots available</p>
                        ) : (
                          availableSlotsForDate.map((slot, index) => {
                            const formatted = `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
                            const timeOnly = formatTime(slot.startTime);

                            const isBooked = (bookedSlots || []).includes(timeOnly);

                            return (
                              <div key={slot.id || index} className="flex flex-col items-center">
                                <button
                                  onClick={() => !isBooked && setSelectedSlot(timeOnly)}
                                  disabled={isBooked}
                                  className={`p-3 text-xs rounded-xl border-2 font-bold transition-all w-full
            ${isBooked
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through"
                                      : selectedSlot === timeOnly
                                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                        : "bg-slate-50 border-slate-50 text-slate-600 hover:border-blue-100"
                                    }`}
                                >
                                  {formatted}
                                </button>

                                {isBooked && (
                                  <span className="mt-1 text-[9px] text-red-500 font-bold">Booked</span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-slate-900 rounded-2xl flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-blue-400">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Location</p>
                        <p className="font-bold text-sm">{selectedCounsellor?.workplace}</p>
                      </div>
                    </div>
                    {selectedDate && selectedSlot && (
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Selected</p>
                        <p className="font-bold text-sm">{selectedDateLabel} @ {selectedSlot}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={!selectedDate || !selectedSlot}
                    className={`w-full mt-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${selectedDate && selectedSlot
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    Continue to Summary <FaArrowRight />
                  </button>
                </div>
              )}

              {/* STEP 4: FINAL FORM */}
              {step === 4 && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <button onClick={prevStep} className="inline-flex items-center text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Previous Step
                  </button>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Review & Finalize</h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">Verify your details and complete your booking information.</p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-6 bg-linear-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl border border-slate-100 space-y-5 shadow-sm">
                      <div className="flex items-center gap-4 pb-5 border-b border-slate-100 rounded-xl p-3 bg-white shadow-sm">
                        <img src={selectedCounsellor?.image} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-black text-sm text-slate-900">{selectedCounsellor?.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedCounsellor?.category}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-sm font-black text-blue-600">{selectedDateLabel}</p>
                          <p className="text-[10px] font-bold text-slate-400">{selectedSlot}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step</p>
                          <p className="text-xs font-bold text-slate-700">Personal Details</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Validation</p>
                          <p className="text-xs font-bold text-slate-700">Real-time checks enabled</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security</p>
                          <p className="text-xs font-bold text-slate-700">Confidential handling</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Age (1-60)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            value={formData.age}
                            onChange={(e) => {
                              let digits = e.target.value.replace(/\D/g, "").slice(0, 2);
                              if (!digits) {
                                setFormData({ ...formData, age: "" });
                                return;
                              }
                              const num = Number(digits);
                              if (digits.length === 2 && num > 60) digits = "60";
                              if (num === 0) digits = "";
                              setFormData({ ...formData, age: digits });
                            }}
                            placeholder="Age"
                            className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs focus:border-blue-100 transition-all outline-none"
                          />
                          <p className="text-[10px] text-slate-400 px-1">Enter your current age.</p>
                          {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Contact Number</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={formData.contactNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })
                            }
                            placeholder="07XXXXXXXX"
                            className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs focus:border-blue-100 transition-all outline-none"
                          />
                          <p className="text-[10px] text-slate-400 px-1">Primary number for appointment updates.</p>
                          {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 mb-1">Guardian Phone</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            value={formData.guardianPhoneNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, guardianPhoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })
                            }
                            placeholder="07XXXXXXXX"
                            className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs focus:border-blue-100 transition-all outline-none"
                          />
                          <p className="text-[10px] text-slate-400 px-1">Emergency contact number.</p>
                          {errors.guardianPhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.guardianPhoneNumber}</p>}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Medical Prerequisites (Optional)</label>
                        <textarea
                          value={formData.medicalNotes}
                          onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                          placeholder="List any medical history or current medications..."
                          className="w-full bg-white border-2 border-slate-100 rounded-xl p-4 text-xs focus:border-blue-100 transition-all outline-none min-h-24"
                        />
                        <p className="text-[10px] text-slate-400 px-1">Optional, but helps your counselor prepare better.</p>
                      </div>

                      <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl text-center relative hover:border-blue-400 transition-colors">
                        <input type="file" name="report" accept=".pdf,.jpg,.png"
                          onChange={(e) => setFormData({ ...formData, report: e.target.files[0] })}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1.5">
                          <FaCalendarAlt className="text-slate-300 text-lg" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {formData.report ? formData.report.name : "Attach Medical Reports (PDF/JPG)"}
                          </span>
                          <span className="text-[10px] text-slate-400">Max 2MB • PDF, JPG, PNG</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <FaExclamationCircle className="text-orange-500 text-lg mt-0.5 shrink-0" />
                      <p className="text-orange-800 text-[10px] font-medium leading-relaxed">
                        By confirming, you agree to our <strong>Confidentiality Agreement</strong>. Sessions are private and your data is stored securely. Cancellations must be made 12 hours in advance.
                      </p>
                    </div>

                    <button type="submit"
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] tracking-tight"
                    >
                      Confirm Appointment
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
