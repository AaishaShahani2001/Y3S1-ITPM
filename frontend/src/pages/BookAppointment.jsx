import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaSmile, FaMeh, FaFrown, FaAngry, FaTired, FaBrain,
  FaStar, FaArrowRight, FaArrowLeft, FaCheckCircle,
  FaExclamationCircle, FaUserMd, FaCalendarAlt, FaClock,
  FaMapMarkerAlt, FaBriefcase, FaGraduationCap
} from "react-icons/fa";

const MOODS = [
  { id: "anxiety", label: "Anxiousness", icon: <FaBrain className="text-blue-500" />, suggest: "Academic Support" },
  { id: "depression", label: "Sadness", icon: <FaFrown className="text-indigo-500" />, suggest: "Mental Health Specialist" },
  { id: "stress", label: "Stress", icon: <FaTired className="text-orange-500" />, suggest: "Stress Management" },
  { id: "anger", label: "Anger", icon: <FaAngry className="text-red-500" />, suggest: "Emotional Regulation Expert" },
  { id: "neutral", label: "Neutral", icon: <FaMeh className="text-gray-500" />, suggest: "Personal Development" },
];

const COUNSELLORS = [
  { id: "1", name: "Dr. Nethmi Perera", category: "Stress Management", experience: 5, rating: 4.8, image: "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300", workplace: "New Building F1301" },
  { id: "2", name: "Mr. Dilan Fernando", category: "Academic Support", experience: 3, rating: 4.6, image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Main Building A202" },
  { id: "3", name: "Ms. Kavindi Silva", category: "Career Guidance", experience: 4, rating: 4.9, image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Wellness Center W101" },
  { id: "4", name: "Dr. Kamal Perera", category: "Mental Health Specialist", experience: 10, rating: 5.0, image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Medical Wing M10" },
  { id: "5", name: "Ms. Aruni Jay", category: "Emotional Regulation Expert", experience: 6, rating: 4.7, image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300&h=300", workplace: "Wellness Center W102" },
];

/** Must match keys in SCHEDULE_BY_DATE */
const BOOKING_DATE_OPTIONS = ["Tomorrow", "April 8, Wed", "April 9, Thu", "April 10, Fri"];

const SCHEDULE_BY_DATE = {
  Tomorrow: [
    { time: "09:00 AM", isBooked: true },
    { time: "10:30 AM", isBooked: false },
    { time: "01:00 PM", isBooked: true },
    { time: "03:30 PM", isBooked: false },
  ],
  "April 8, Wed": [
    { time: "09:00 AM", isBooked: false },
    { time: "10:30 AM", isBooked: true },
    { time: "01:00 PM", isBooked: false },
    { time: "03:30 PM", isBooked: true },
  ],
  "April 9, Thu": [
    { time: "09:00 AM", isBooked: false },
    { time: "10:30 AM", isBooked: false },
    { time: "01:00 PM", isBooked: true },
    { time: "03:30 PM", isBooked: false },
  ],
  "April 10, Fri": [
    { time: "09:00 AM", isBooked: true },
    { time: "10:30 AM", isBooked: true },
    { time: "01:00 PM", isBooked: false },
    { time: "03:30 PM", isBooked: false },
  ],
};

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [moodData, setMoodData] = useState({
    selectedMood: "",
    urgencyScore: 5,
    description: "",
  });

  const [selectedCounsellorId, setSelectedCounsellorId] = useState(id || "");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  /** True when the chosen time came from "Join Waitlist" on a booked slot (user can still finish booking). */
  const [scheduleViaWaitlist, setScheduleViaWaitlist] = useState(false);
  const [waitlistEntries, setWaitlistEntries] = useState([]);

  const [formData, setFormData] = useState({
    age: "",
    contactNumber: "",
    guardianPhoneNumber: "",
    medicalNotes: "",
    report: null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const randomId = "BK-" + Math.floor(100000 + Math.random() * 900000);
    setBookingId(randomId);
  }, []);

  const currentMoodObj = MOODS.find(m => m.id === moodData.selectedMood);
  const selectedCounsellor = COUNSELLORS.find(c => c.id === (selectedCounsellorId || id));

  const suggestedCounsellors = useMemo(() => {
    if (!currentMoodObj) return [];
    return COUNSELLORS.filter(c => c.category === currentMoodObj.suggest);
  }, [currentMoodObj]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return SCHEDULE_BY_DATE[selectedDate] || [];
  }, [selectedDate]);

  const getUrgency = (score) => {
    if (score <= 3) return { label: "Normal", color: "text-green-600 bg-green-50 border-green-100" };
    if (score <= 6) return { label: "Medium", color: "text-orange-600 bg-orange-50 border-orange-100" };
    return { label: "High Priority", color: "text-red-600 bg-red-50 border-red-100" };
  };

  const validateStep = (currentStep) => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!moodData.selectedMood) nextErrors.selectedMood = "Please select your mood to continue.";
    }

    if (currentStep === 2) {
      if (moodData.description && moodData.description.trim().length > 500) {
        nextErrors.description = "Description must be 500 characters or less.";
      }
    }

    if (currentStep === 3) {
      if (!selectedCounsellorId && !id) nextErrors.selectedCounsellor = "Please select a counsellor to proceed.";
    }

    if (currentStep === 4) {
      if (!selectedDate) nextErrors.selectedDate = "Please select a date.";
      if (!selectedSlot) {
        nextErrors.selectedSlot =
          "Select an available slot, or join the waitlist on a booked slot to continue.";
      }
    }

    if (currentStep === 5) {
      if (!formData.age) {
        nextErrors.age = "Age is required.";
      } else {
        const ageStr = String(formData.age).trim();
        if (!/^\d{1,2}$/.test(ageStr)) {
          nextErrors.age = "Enter age as 1 or 2 digits only.";
        } else {
          const ageNumber = Number(ageStr);
          if (Number.isNaN(ageNumber) || ageNumber < 1 || ageNumber > 60) {
            nextErrors.age = "Age must be between 1 and 60.";
          }
        }
      }

      if (!formData.contactNumber) {
        nextErrors.contactNumber = "Contact number is required.";
      } else if (!/^\d{10}$/.test(formData.contactNumber)) {
        nextErrors.contactNumber = "Contact number must be exactly 10 digits.";
      }

      if (!formData.guardianPhoneNumber) {
        nextErrors.guardianPhoneNumber = "Guardian phone number is required.";
      } else if (!/^\d{10}$/.test(formData.guardianPhoneNumber)) {
        nextErrors.guardianPhoneNumber = "Guardian phone number must be exactly 10 digits.";
      }

      if (formData.medicalNotes && formData.medicalNotes.trim().length > 500) {
        nextErrors.medicalNotes = "Medical notes must be 500 characters or less.";
      }

      if (formData.report) {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!allowedTypes.includes(formData.report.type)) {
          nextErrors.report = "Only PDF, JPG, and PNG files are allowed.";
        } else if (formData.report.size > 5 * 1024 * 1024) {
          nextErrors.report = "File size must be 5MB or less.";
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleJoinWaitlist = (slotTime) => {
    if (!selectedDate) {
      setErrors((prev) => ({ ...prev, selectedDate: "Please select a date first." }));
      toast.error("Please select a date first.");
      return;
    }

    const counsellorId = selectedCounsellorId || id;
    const alreadyJoined = waitlistEntries.some(
      (entry) =>
        entry.counsellorId === counsellorId &&
        entry.date === selectedDate &&
        entry.slot === slotTime
    );

    if (alreadyJoined) {
      toast.error("You are already in the waitlist for this slot.");
      return;
    }

    setWaitlistEntries((prev) => [
      ...prev,
      { counsellorId, date: selectedDate, slot: slotTime },
    ]);
    setSelectedSlot(slotTime);
    setScheduleViaWaitlist(true);
    setErrors((prev) => ({ ...prev, selectedSlot: "" }));
    toast.success(
      `Joined waitlist for ${selectedDate} at ${slotTime}. You can continue to complete your booking.`
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Login required");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser) {
        toast.error("Login required");
        return;
      }
    } catch {
      toast.error("Login required");
      return;
    }

    if (!validateStep(5)) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress = (step / 5) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Progress Bar */}
        {!submitted && (
          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Step {step} of 5</p>
                <h2 className="text-lg font-black text-slate-900">
                  {step === 1 ? "Mental Check-in" :
                    step === 2 ? "Provide Context" :
                      step === 3 ? "Select Specialist" :
                        step === 4 ? "Schedule Session" : "Finalize Booking"}
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
                Your session with <span className="text-slate-900 font-bold">{selectedCounsellor?.name}</span> is being processed.
                You'll receive a confirmation email shortly.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-left max-w-md mx-auto grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                  <p className="font-mono text-sm font-bold text-slate-900 tracking-tighter">{bookingId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${getUrgency(moodData.urgencyScore).color}`}>
                    {getUrgency(moodData.urgencyScore).label}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="font-bold text-sm text-slate-900">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                  <p className="font-bold text-sm text-slate-900">
                    {selectedSlot}
                    {scheduleViaWaitlist ? (
                      <span className="ml-1 text-[10px] font-black uppercase text-amber-700"> (Waitlist)</span>
                    ) : null}
                  </p>
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
              {/* STEP 1: MOOD & URGENCY */}
              {step === 1 && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">How are you feeling right now?</h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">Your emotional state helps us match you with the right specialist.</p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                    {MOODS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMoodData({ ...moodData, selectedMood: m.id })}
                        className={`group flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${moodData.selectedMood === m.id
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-1"
                          : "bg-slate-50 border-slate-50 text-slate-400 hover:border-blue-200 hover:-translate-y-1"
                          }`}
                      >
                        <div className={`text-3xl mb-3 transition-transform group-hover:scale-110 ${moodData.selectedMood === m.id ? "text-white" : ""}`}>
                          {m.icon}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center">
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.selectedMood && (
                    <p className="text-xs text-red-500 font-bold mb-6">{errors.selectedMood}</p>
                  )}

                  <div className="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h4 className="text-base font-black text-slate-900">Intensity Level</h4>
                        <p className="text-xs font-medium text-slate-500">How overwhelming are these feelings?</p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm ${moodData.urgencyScore > 7 ? 'bg-red-100 text-red-600' : moodData.urgencyScore > 4 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {moodData.urgencyScore}
                      </div>
                    </div>
                    <input
                      type="range" min="1" max="10"
                      value={moodData.urgencyScore}
                      onChange={(e) => setMoodData({ ...moodData, urgencyScore: parseInt(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-3"
                    />
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span>Mild</span>
                      <span>Moderate</span>
                      <span>Severe</span>
                    </div>
                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Continue <FaArrowRight />
                  </button>
                </div>
              )}

              {/* STEP 2: DESCRIPTION */}
              {step === 2 && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <button onClick={prevStep} className="inline-flex items-center text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Previous Step
                  </button>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Express yourself</h2>
                  <p className="text-slate-500 text-sm mb-6 font-medium">Briefly describe what you're experiencing. This helps your counsellor prepare for the session.</p>

                  <div className="relative mb-8">
                    <textarea
                      value={moodData.description}
                      onChange={(e) => setMoodData({ ...moodData, description: e.target.value })}
                      placeholder="Start typing here... (Optional)"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-6 text-sm font-medium text-slate-700 focus:bg-white focus:border-blue-100 transition-all outline-none min-h-32 shadow-sm"
                    />
                    <div className="absolute top-4 right-4 text-blue-100 text-3xl pointer-events-none">
                      <FaMeh />
                    </div>
                  </div>
                  {errors.description && (
                    <p className="text-xs text-red-500 font-bold mb-6">{errors.description}</p>
                  )}

                  <button
                    onClick={nextStep}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Match with Specialist <FaArrowRight />
                  </button>
                </div>
              )}

              {/* STEP 3: RECOMMENDATION & SELECTION */}
              {step === 3 && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <button onClick={prevStep} className="inline-flex items-center text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Previous Step
                  </button>

                  <div className="bg-blue-600 p-6 rounded-2xl mb-8 shadow-lg shadow-blue-200 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-xl" />
                    <div className="relative z-10 flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl">
                        <FaUserMd />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">System Recommendation</p>
                        <h3 className="text-xl font-black tracking-tight mb-1">You need a {currentMoodObj?.suggest}</h3>
                        <p className="text-blue-100 text-xs font-medium leading-relaxed opacity-90 max-w-sm">
                          Based on your reported <span className="text-white font-bold">{currentMoodObj?.label}</span> level {moodData.urgencyScore},
                          our triage system suggests an expert specializing in {currentMoodObj?.suggest.toLowerCase()}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Available Specialists</h4>
                  <div className="space-y-3 mb-8">
                    {(id ? COUNSELLORS.filter(c => c.id === id) : suggestedCounsellors.length > 0 ? suggestedCounsellors : COUNSELLORS).map(c => (
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
                    ))}
                  </div>
                  {errors.selectedCounsellor && (
                    <p className="text-xs text-red-500 font-bold mb-6">{errors.selectedCounsellor}</p>
                  )}

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

              {/* STEP 4: SCHEDULING */}
              {step === 4 && (
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
                      <div className="grid grid-cols-2 gap-2">
                        {BOOKING_DATE_OPTIONS.map(date => (
                          <button
                            key={date}
                            onClick={() => {
                              setSelectedDate(date);
                              setSelectedSlot("");
                              setScheduleViaWaitlist(false);
                              setErrors((prev) => ({ ...prev, selectedDate: "", selectedSlot: "" }));
                            }}
                            className={`p-3 text-xs rounded-xl border-2 font-bold transition-all ${selectedDate === date
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
                              : 'bg-slate-50 border-slate-50 text-slate-600 hover:border-blue-100 hover:bg-white'}`}
                          >
                            {date}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1 flex items-center gap-2">
                        <FaClock className="text-blue-600" /> Available Slots
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {(selectedDate ? slotsForSelectedDate : []).map((slotItem) => {
                          const slot = slotItem.time;
                          const joinedWaitlist = waitlistEntries.some(
                            (entry) =>
                              entry.counsellorId === (selectedCounsellorId || id) &&
                              entry.date === selectedDate &&
                              entry.slot === slot
                          );
                          return (
                            <div key={slot} className="space-y-1">
                              <button
                                onClick={() => {
                                  if (slotItem.isBooked) return;
                                  setSelectedSlot(slot);
                                  setScheduleViaWaitlist(false);
                                  setErrors((prev) => ({ ...prev, selectedSlot: "" }));
                                }}
                                className={`w-full p-3 text-xs rounded-xl border-2 font-bold transition-all ${
                                  slotItem.isBooked
                                    ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                    : selectedSlot === slot
                                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                                      : "bg-slate-50 border-slate-50 text-slate-600 hover:border-blue-100 hover:bg-white"
                                }`}
                              >
                                {slot} {slotItem.isBooked ? "• Booked" : ""}
                              </button>
                              {slotItem.isBooked && (
                                <button
                                  onClick={() => handleJoinWaitlist(slot)}
                                  disabled={joinedWaitlist}
                                  className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    joinedWaitlist
                                      ? "bg-emerald-100 text-emerald-700 cursor-not-allowed"
                                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                                  }`}
                                >
                                  {joinedWaitlist ? "Waitlisted" : "Join Waitlist"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                        {!selectedDate && (
                          <p className="col-span-2 text-xs text-slate-400 font-bold">
                            Select a date to view available and booked slots.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {(errors.selectedDate || errors.selectedSlot) && (
                    <p className="text-xs text-red-500 font-bold mt-4">
                      {errors.selectedDate || errors.selectedSlot}
                    </p>
                  )}

                  {scheduleViaWaitlist && selectedDate && selectedSlot && (
                    <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-900">
                      <span className="font-black uppercase tracking-widest text-amber-700">Waitlist</span>
                      <p className="mt-1 leading-relaxed">
                        You joined the waitlist for this time. Continue below to finish your appointment details—your slot will be confirmed if it opens.
                      </p>
                    </div>
                  )}

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
                        <p className="font-bold text-sm">
                          {selectedDate} @ {selectedSlot}
                          {scheduleViaWaitlist ? (
                            <span className="block text-[10px] font-black uppercase text-amber-300">Waitlist</span>
                          ) : null}
                        </p>
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

              {/* STEP 5: FINAL FORM */}
              {step === 5 && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <button onClick={prevStep} className="inline-flex items-center text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                    <FaArrowLeft className="mr-2" /> Previous Step
                  </button>
                  <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Review & Finalize</h2>
                  <p className="text-slate-500 text-sm mb-8 font-medium">Verify your details and add any last-minute information.</p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
                      <div className="flex items-center gap-4 pb-5 border-b border-white outline-1 outline-slate-100 rounded-xl p-3 bg-white">
                        <img src={selectedCounsellor?.image} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h4 className="font-black text-sm text-slate-900">{selectedCounsellor?.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedCounsellor?.category}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-sm font-black text-blue-600">{selectedDate}</p>
                          <p className="text-[10px] font-bold text-slate-400">
                            {selectedSlot}
                            {scheduleViaWaitlist ? (
                              <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-800">
                                Waitlist
                              </span>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Age (1–60)</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            autoComplete="off"
                            value={formData.age}
                            onChange={(e) => {
                              let digits = e.target.value.replace(/\D/g, "").slice(0, 2);
                              if (digits === "") {
                                setFormData({ ...formData, age: "" });
                                return;
                              }
                              // No leading zeros (ages are 1–60)
                              if (digits.startsWith("0")) {
                                digits = digits.replace(/^0+/, "") || "";
                                if (digits === "") {
                                  setFormData({ ...formData, age: "" });
                                  return;
                                }
                              }
                              const n = Number(digits);
                              if (digits.length === 1 && n === 0) {
                                setFormData({ ...formData, age: "" });
                                return;
                              }
                              // Two digits: never allow > 60 (e.g. 99 → 60, 61 → 60)
                              if (digits.length === 2 && n > 60) {
                                setFormData({ ...formData, age: "60" });
                                return;
                              }
                              setFormData({ ...formData, age: digits });
                            }}
                            placeholder="e.g. 21"
                            className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs focus:border-blue-100 transition-all outline-none"
                          />
                          {errors.age && (
                            <p className="text-xs text-red-500 font-bold">{errors.age}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Contact Number</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formData.contactNumber}
                            onChange={(e) => {
                              const filtered = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setFormData({ ...formData, contactNumber: filtered });
                            }}
                            placeholder="0771234567"
                            className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs focus:border-blue-100 transition-all outline-none"
                          />
                          {errors.contactNumber && (
                            <p className="text-xs text-red-500 font-bold">{errors.contactNumber}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Guardian Phone Number</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formData.guardianPhoneNumber}
                            onChange={(e) => {
                              const filtered = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setFormData({ ...formData, guardianPhoneNumber: filtered });
                            }}
                            placeholder="0712345678"
                            className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs focus:border-blue-100 transition-all outline-none"
                          />
                          {errors.guardianPhoneNumber && (
                            <p className="text-xs text-red-500 font-bold">{errors.guardianPhoneNumber}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Medical Prerequisites (Optional)</label>
                        <textarea
                          value={formData.medicalNotes}
                          onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                          placeholder="List any medical history or current medications..."
                          className="w-full bg-white border-2 border-slate-100 rounded-xl p-4 text-xs focus:border-blue-100 transition-all outline-none min-h-20"
                        />
                        {errors.medicalNotes && (
                          <p className="text-xs text-red-500 font-bold">{errors.medicalNotes}</p>
                        )}
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
                        </div>
                      </div>
                      {errors.report && (
                        <p className="text-xs text-red-500 font-bold">{errors.report}</p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                      <FaExclamationCircle className="text-orange-500 text-lg mt-0.5 shrink-0" />
                      <p className="text-orange-800 text-[10px] font-medium leading-relaxed">
                        By confirming, you agree to our <strong>Confidentiality Agreement</strong>. Sessions are private and your data is stored securely. Cancellations must be made 12 hours in advance.
                      </p>
                    </div>

                    <button type="submit"
                      className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98] tracking-tight"
                    >
                      Confirm Booking
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
