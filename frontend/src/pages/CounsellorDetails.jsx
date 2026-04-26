import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaBriefcase, FaGraduationCap, FaEnvelope, FaMapMarkerAlt, FaStar, FaAward, FaUserCheck, FaClock, FaTimes, FaCalendarCheck } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function CounsellorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [counsellor, setCounsellor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  useEffect(() => {
    const fetchCounsellor = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/counsellor/all");
        if (res.ok) {
          const data = await res.json();
          const found = data.find(c => c.id.toString() === id);

          if (found) {
            setCounsellor({
              id: found.id.toString(),
              name: found.fullName,
              category: found.specialization,
              experience: found.experience,
              workplace: found.workplace,
              bio: found.about || "I am a dedicated professional with extensive experience in providing mental health support tailored to the unique challenges of university life. My approach is compassionate, evidence-based, and focused on empowering students to achieve their full potential.",
              education: found.qualification || "Information Not Available",
              specialties: [found.specialization], // Fallback if no detailed specialties array exists
              image: found.profileImage
                ? `http://localhost:3000/${found.profileImage}`
                : "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300", 
              rating: 4.8,
              reviews: 124,
              languages: ["English", "Sinhala"],
              available: true, // Always available for booking purposes
              availableText: "Available",
              nextAvailable: "Tomorrow, 10:00 AM",
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch counsellor details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounsellor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF3E0] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!counsellor) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-linear-to-b from-[#fdf7ea] via-[#f9f0dd] to-[#f5ead3] px-4 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Counsellor Not Found</h2>
        <p className="text-slate-500 mb-6 font-medium">The specialist you are looking for does not exist or has been removed.</p>
        <Link to="/counsellors" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Back to Directory</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-[#fdf7ea] via-[#f9f0dd] to-[#f5ead3] pb-16">
      {/* HEADER SECTION - PREMIUM GRADIENT */}
      <div className="bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 pt-8 pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[50%] bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 relative z-10">
          <Link
            to="/counsellors"
            className="inline-flex items-center text-blue-100 hover:text-white transition-all hover:-translate-x-1 mb-6 text-sm font-bold uppercase tracking-widest"
          >
            <FaArrowLeft className="mr-2" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <img
                src={counsellor.image}
                alt={counsellor.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-white shadow-2xl relative z-10"
              />
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white z-20 flex items-center justify-center text-white text-[10px] ${counsellor.available ? 'bg-green-500' : 'bg-red-500'}`}>
                <FaUserCheck />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                  <FaAward className="text-yellow-300" /> Top Rated Specialist
                </span>
                <span className="bg-blue-500/30 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-white/10">
                  Verified Profile
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
                {counsellor.name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-blue-50">
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/5 text-xs">
                  <FaBriefcase className="mr-2 text-blue-200" />
                  <span className="font-bold">{counsellor.category}</span>
                </div>
                <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/5 text-xs">
                  <FaStar className="mr-2 text-yellow-400" />
                  <span className="font-bold">{counsellor.rating} <span className="text-blue-200 font-medium">({counsellor.reviews})</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-4xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Biography</h2>
                <div className="hidden md:flex gap-1.5">
                  {counsellor.languages.map(lang => (
                    <span key={lang} className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg border border-slate-100 uppercase tracking-widest">{lang}</span>
                  ))}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-base font-medium">
                {counsellor.bio}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 mt-8 border-t border-slate-50">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Background</h3>
                  <div className="flex items-start bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shrink-0 mr-4 shadow-sm">
                      <FaGraduationCap className="text-lg" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-sm leading-tight mb-0.5">{counsellor.education}</p>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Education</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Location</h3>
                  <div className="flex items-start bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shrink-0 mr-4 shadow-sm">
                      <FaMapMarkerAlt className="text-lg" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-sm leading-tight mb-0.5">{counsellor.workplace}</p>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Office</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-4xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2.5">
                {counsellor.specialties.map(spec => (
                  <span key={spec} className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold border border-slate-100 text-xs shadow-sm">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 p-8 rounded-4xl shadow-xl sticky top-20 border border-slate-800">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20">
                  <FaEnvelope className="text-2xl" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Ready to talk?</h3>
                <p className="text-slate-400 font-medium text-xs leading-relaxed">Our mood-based booking system ensures you get matched with the right support.</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-300 bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-blue-400">
                    <FaClock className="text-sm" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Wait Time</p>
                    <p className="text-xs font-bold">Less than 24h</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookModalOpen(true)}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] mb-4"
              >
                Book Appointment
              </button>

              <button className="w-full py-3 bg-white/5 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10">
                Contact Office
              </button>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Confidential & Professional</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {bookModalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={() => setBookModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">
            <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-100 bg-linear-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <FaCalendarCheck className="text-xl" />
                </div>
                <div>
                  <h2 id="book-modal-title" className="text-lg font-black tracking-tight">
                    How to book an appointment
                  </h2>
                  <p className="text-blue-100 text-xs font-medium mt-1 leading-relaxed">
                    Follow these steps before you continue to the booking page.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookModalOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                aria-label="Close"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <ol className="space-y-4 text-sm text-slate-600 font-medium leading-relaxed list-decimal list-inside marker:font-black marker:text-blue-600">
                <li>
                  <span className="font-bold text-slate-800">Use Services in the menu.</span>{" "}
                  Open <strong className="text-slate-900">Services</strong> in the top navigation, then choose{" "}
                  <strong className="text-slate-900">Counselling Booking</strong> anytime you want to start from the main booking entry.
                </li>
                <li>
                  <span className="font-bold text-slate-800">Share how you feel.</span>{" "}
                  On the booking flow you will describe your <strong className="text-slate-900">mood, feelings, and current condition</strong> so we can match support to what you need.
                </li>
                <li>
                  <span className="font-bold text-slate-800">Confirm your session.</span>{" "}
                  Select a counsellor (you can keep <strong className="text-slate-900">{counsellor.name}</strong>), pick a time, and complete your appointment.
                </li>
              </ol>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setBookModalOpen(false);
                    navigate(`/book-appointment/${id}`);
                  }}
                  className="flex-1 py-3.5 px-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                >
                  Go to book appointment
                </button>
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="py-3.5 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}