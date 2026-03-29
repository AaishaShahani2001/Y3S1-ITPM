import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaBriefcase, FaGraduationCap, FaEnvelope, FaMapMarkerAlt, FaStar, FaAward, FaUserCheck, FaClock, FaTimes, FaInfoCircle } from "react-icons/fa";
import { DUMMY_COUNSELLORS } from "../data/dummyCounsellors";

export default function CounsellorDetails() {
  const { id } = useParams();
  const [showBookInfoModal, setShowBookInfoModal] = useState(false);

  useEffect(() => {
    if (!showBookInfoModal) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showBookInfoModal]);

  const counsellor = useMemo(() => {
    const listRow = DUMMY_COUNSELLORS.find((c) => String(c.id) === String(id));
    const imgLarge = listRow?.image
      ? listRow.image.replace("w=200&h=200", "w=300&h=300")
      : undefined;

    const available = listRow ? listRow.available : true;

    return {
      id,
      name:
        listRow?.name ??
        (id === "1"
          ? "Dr. Nethmi Perera"
          : id === "2"
            ? "Mr. Dilan Fernando"
            : "Ms. Kavindi Silva"),
      category:
        listRow?.category ??
        (id === "1" ? "Stress Management" : id === "2" ? "Academic Support" : "Career Guidance"),
      experience: listRow?.experience ?? (id === "1" ? 5 : id === "2" ? 3 : 4),
      workplace:
        listRow?.workplace ??
        (id === "1" ? "New Building F1301" : id === "2" ? "Main Building A202" : "Wellness Center W101"),
      bio:
        listRow?.bio ??
        "I am a dedicated professional with extensive experience in providing mental health support tailored to the unique challenges of university life. My approach is compassionate, evidence-based, and focused on empowering students to achieve their full potential.",
      education: "Ph.D. in Clinical Psychology, University of Colombo",
      specialties: [
        "Anxiety & Depression",
        "Academic Pressure",
        "Relationship Issues",
        "Self-Esteem Building",
        "Crisis Intervention",
        "Cognitive Behavioral Therapy",
      ],
      image:
        imgLarge ??
        (id === "1"
          ? "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300"
          : id === "2"
            ? "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300"
            : "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=300&h=300"),
      rating: listRow?.rating ?? 4.9,
      reviews: 124,
      languages: ["English", "Sinhala"],
      available,
      availableText: available ? "Available" : "Fully Booked",
      nextAvailable: "Tomorrow, 10:00 AM",
    };
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* HEADER SECTION */}
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

              <div className="mb-4">
                <button
                  type="button"
                  disabled={!counsellor.available}
                  onClick={() => counsellor.available && setShowBookInfoModal(true)}
                  className={`w-full py-4 rounded-2xl font-black text-center text-sm uppercase tracking-widest transition-all ${
                    counsellor.available
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                      : "cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700 opacity-90"
                  }`}
                  aria-disabled={!counsellor.available}
                >
                  Book Appointment
                </button>
                {!counsellor.available && (
                  <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-red-400/90">
                    Fully booked — try again later
                  </p>
                )}
              </div>

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

      {showBookInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="book-info-title"
          onClick={() => setShowBookInfoModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowBookInfoModal(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <FaTimes className="text-lg" />
            </button>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <FaInfoCircle className="text-xl" />
            </div>
            <h2 id="book-info-title" className="pr-10 text-xl font-black tracking-tight text-slate-900">
              Book through Services
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
              To make an appointment, go to <span className="font-bold text-slate-800">Services</span> in the main menu, open{" "}
              <span className="font-bold text-slate-800">Counselling Booking</span>, and share how you are feeling. That flow matches you with support and completes your booking.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowBookInfoModal(false)}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-700 transition-colors hover:bg-slate-50"
              >
                Got it
              </button>
              <Link
                to="/book-appointment"
                onClick={() => setShowBookInfoModal(false)}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700"
              >
                Go to booking
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}