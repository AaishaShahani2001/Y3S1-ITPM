import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUserTie, FaGraduationCap, FaMapMarkerAlt, FaBriefcase, FaStar } from "react-icons/fa";
import BecomeCounsellorModal from "../components/BecomeCounsellorModal";
import groupDoctors from "../assets/groupDoctors.jpg";

// Category filter options shown as chips.
const CATEGORIES = [
  "Stress Management",
  "Academic Support",
  "Career Guidance",
  "Personal Development",
  "Mental Health Specialist",
  "Emotional Regulation Expert"
];

// Frontend dummy counsellor records.
const DUMMY_COUNSELLORS = [
  {
    id: "1",
    name: "Dr. Nethmi Perera",
    category: "Stress Management",
    experience: 5,
    workplace: "New Building F1301",
    available: true,
    rating: 4.9,
    bio: "Specializes in stress recovery plans, burnout prevention, and practical coping strategies for students.",
    image: "https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "2",
    name: "Mr. Dilan Fernando",
    category: "Academic Support",
    experience: 3,
    workplace: "Main Building A202",
    available: true,
    rating: 4.7,
    bio: "Supports students with study structure, academic pressure, and exam confidence.",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "3",
    name: "Ms. Kavindi Silva",
    category: "Career Guidance",
    experience: 4,
    workplace: "Wellness Center W101",
    available: false,
    rating: 4.8,
    bio: "Guides students through career planning, CV building, and interview readiness.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "4",
    name: "Dr. Kamal Perera",
    category: "Mental Health Specialist",
    experience: 10,
    workplace: "Medical Wing M10",
    available: true,
    rating: 5.0,
    bio: "Experienced in anxiety, depression, and long-term therapeutic mental health support.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "5",
    name: "Ms. Aruni Jay",
    category: "Emotional Regulation Expert",
    experience: 6,
    workplace: "Wellness Center W102",
    available: true,
    rating: 4.6,
    bio: "Focuses on emotional control techniques, resilience building, and healthy communication patterns.",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    id: "6",
    name: "Mr. Sahan Wijesinghe",
    category: "Personal Development",
    experience: 7,
    workplace: "Student Hub H12",
    available: false,
    rating: 4.5,
    bio: "Helps students with confidence building, goal setting, and self-growth routines.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
  },
];

export default function Counsellors() {
  // Search query state.
  const [q, setQ] = useState("");
  // Selected category chip.
  const [cat, setCat] = useState("All");
  // Modal visibility state for "Become a Counsellor".
  const [openApply, setOpenApply] = useState(false);
  // Data source for counsellor cards.
  const [counsellors, setCounsellors] = useState([]);
  // Loader state to keep the same loading UI.
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate async load using dummy data to keep existing UX.
  useEffect(() => {
    const timer = setTimeout(() => {
      setCounsellors(DUMMY_COUNSELLORS);
      setLoading(false);
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  // Combined filter: category first, then search by name/specialization.
  const filtered = useMemo(() => {
    const byCat =
      cat === "All"
        ? counsellors
        : counsellors.filter((c) => c.category === cat);

    const bySearch = q.trim()
      ? byCat.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.category.toLowerCase().includes(q.toLowerCase())
      )
      : byCat;

    return bySearch;
  }, [q, cat, counsellors]);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">

      {/* ================= HERO SECTION ================= */}
      <section className="relative h-80 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${groupDoctors})` }}
        >
          <div className="absolute inset-0 bg-slate-900/70" />
        </div>

        <div className="relative z-10 h-full max-w-6xl mx-auto px-6 flex flex-col justify-center items-center text-center">
          <span className="text-blue-400 font-black tracking-widest uppercase text-[10px] mb-3">
            Professional Support Network
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
            Find the Right <span className="text-blue-400">Support</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed mb-6 font-medium">
            Connect with our certified professionals dedicated to supporting your mental wellbeing and success.
          </p>

          <button
            onClick={() => setOpenApply(true)}
            className="px-6 py-3 font-black text-white transition-all duration-200 bg-blue-600 rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            Become a Counsellor
          </button>
        </div>
      </section>

      {/* ================= SEARCH & FILTER SECTION ================= */}
      <section className="relative -mt-10 z-20 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6 border border-slate-100/50">
          <div className="flex flex-col md:flex-row gap-3 items-center mb-5">
            <div className="relative w-full">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or specialization..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <FilterButton label="All" active={cat} setCat={setCat} />
            {CATEGORIES.map((c) => (
              <FilterButton
                key={c}
                label={c}
                active={cat}
                setCat={setCat}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= GRID SECTION ================= */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 p-12 text-center text-slate-600 rounded-4xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-xl text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight">No counsellors found</h3>
            <p className="text-xs mt-1 font-medium">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="group bg-white rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Header/Image Area */}
                <div className="relative h-40 bg-slate-100">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md uppercase tracking-wider ${c.available
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                        }`}
                    >
                      {c.available ? "Available" : "Fully Booked"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 grow flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h2 className="text-xl font-black text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                        {c.name}
                      </h2>
                      <div className="flex items-center text-blue-600 font-bold text-[10px] uppercase tracking-wider">
                        <FaBriefcase className="mr-1.5" />
                        {c.category}
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-100">
                      <FaStar className="text-yellow-400 text-[10px] mr-1" />
                      <span className="text-yellow-700 font-black text-[10px]">{c.rating}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed mb-5 font-medium line-clamp-2">
                    {c.bio}
                  </p>

                  <div className="space-y-2 mt-auto pt-4 border-t border-slate-50">
                    <div className="flex items-center text-[10px] font-bold text-slate-500">
                      <FaGraduationCap className="w-4 text-blue-400 mr-2" />
                      {c.experience}+ years experience
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                      <FaMapMarkerAlt className="w-4 text-red-400 mr-2" />
                      {c.workplace}
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => navigate(`/counsellor/${c.id}`)}
                    className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 bg-slate-900 text-white hover:bg-blue-600 shadow-md active:scale-[0.98]"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= MODAL ================= */}
      {openApply && (
        <BecomeCounsellorModal onClose={() => setOpenApply(false)} />
      )}

    </main>
  );
}

/* ================= FILTER BUTTON ================= */
function FilterButton({ label, active, setCat }) {
  const isActive = active === label;
  return (
    <button
      onClick={() => setCat(label)}
      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
        }`}
    >
      {label}
    </button>
  );
}