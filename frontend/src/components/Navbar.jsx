import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown, FaCalendarCheck, FaClipboardList, FaUsers } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    return () => {
      window.removeEventListener("storage", checkUser);
    };
  }, [location.pathname]);

  // Close dropdowns on route change
  useEffect(() => {
    setIsOpen(false);
    setIsServicesOpen(false);
  }, [location.pathname]);

  const handleProfileClick = () => {
    if (!user) return;
    if (user.role === "student") {
      navigate("/student-dashboard");
    } else if (user.role === "counselor") {
      navigate("/counselor-dashboard");
    } else if (user.role === "admin") {
      navigate("/admin-dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-999 bg-white/70 backdrop-blur-3xl border-b border-white/40 shadow-[0_1px_15px_rgba(37,99,235,0.05)]">

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="text-2xl font-black text-blue-600 flex items-center gap-2 tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <FaUsers className="text-sm" />
          </div>
          MindBridge
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex gap-8 text-slate-600 font-bold items-center text-sm uppercase tracking-wider">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/counsellors" className="hover:text-blue-600 transition-colors">Counsellors</Link>

          {/* SERVICES DROPDOWN */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setIsServicesOpen(true)}
            onMouseLeave={() => setIsServicesOpen(false)}
          >
            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors focus:outline-none">
              Services <FaChevronDown className={`text-[10px] transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 w-72 bg-white/80 backdrop-blur-3xl rounded-4xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white/60 p-3 mt-2 transition-all duration-500 transform ${isServicesOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'}`}>

              <Link
                to="/book-appointment"
                className="flex items-center gap-4 p-4 hover:bg-blue-50 rounded-xl transition-all group/item"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all">
                  <FaCalendarCheck />
                </div>
                <div>
                  <p className="text-slate-900 font-bold normal-case tracking-normal">Counselling Booking</p>
                  <p className="text-slate-500 text-[10px] normal-case tracking-normal font-medium">Mood-based triage system</p>
                </div>
              </Link>

              <Link
                to="/services"
                className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all group/item"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 group-hover/item:bg-slate-200 transition-all">
                  <FaClipboardList />
                </div>
                <div>
                  <p className="text-slate-900 font-bold normal-case tracking-normal">Other Services</p>
                  <p className="text-slate-500 text-[10px] normal-case tracking-normal font-medium">Explore all amenities</p>
                </div>
              </Link>

                 {/* Event FEATURE */}
              <Link to="/events" className="flex items-center gap-4 p-4 hover:bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <FaUsers />
                </div>
                <div>
                  <p className="text-slate-900 font-bold normal-case tracking-normal">Wellbeing Events</p>
                  <p className="text-slate-500 text-[10px] normal-case tracking-normal font-medium">Register for events</p>
                </div>
              </Link>

            </div>
          </div>

          <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
              <div
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer font-bold uppercase hover:shadow-lg hover:shadow-blue-200 transition-all"
              >
                {user.name?.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:text-red-700 font-bold"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="relative group overflow-hidden bg-linear-to-r from-blue-600 to-indigo-600 text-white px-10 py-3.5 rounded-full hover:shadow-2xl hover:shadow-blue-500/40 transition-all font-black text-xs uppercase tracking-[0.2em]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10">Login</span>
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-slate-800 focus:outline-none text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-2xl border-t border-slate-100 transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"}`}
      >
        <div className="flex flex-col p-6 gap-2 text-slate-600 font-bold uppercase tracking-widest text-sm">
          <Link to="/" className="p-4 hover:bg-slate-50 rounded-xl" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/counsellors" className="p-4 hover:bg-slate-50 rounded-xl" onClick={() => setIsOpen(false)}>Counsellors</Link>

          <div className="border-t border-slate-50 mt-2 pt-2">
            <p className="px-4 py-2 text-[10px] text-slate-400">Services</p>
            <Link to="/book-appointment" className="p-4 hover:bg-blue-50 flex items-center justify-between rounded-xl text-blue-600" onClick={() => setIsOpen(false)}>
              Counselling Booking <FaCalendarCheck />
            </Link>
            <Link to="/services" className="p-4 hover:bg-slate-50 flex items-center justify-between rounded-xl" onClick={() => setIsOpen(false)}>
              Other Services <FaClipboardList />
            </Link>
            {/* Event FEATURE */}
            <Link to="/events" onClick={() => setIsOpen(false)}>
              Wellbeing Events
            </Link>
          </div>

          <Link to="/about" className="p-4 hover:bg-slate-50 rounded-xl" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/contact" className="p-4 hover:bg-slate-50 rounded-xl" onClick={() => setIsOpen(false)}>Contact</Link>

          {!user && (
            <Link
              to="/auth"
              className="bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg text-center mt-4"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
