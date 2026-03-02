import React, { useState, useEffect  } from "react";
import { Link, useNavigate, useLocation   } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
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


  const handleProfileClick = () => {
    if (!user) return;

    if (user.role === "student") {
      navigate("/student-dashboard");
    } else if (user.role === "counselor") {
      navigate("/counselor-dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };


  return (
    <nav className="sticky top-0 z-999 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          MindBridge
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex gap-8 text-slate-600 font-medium items-center">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/counsellors" className="hover:text-blue-600 transition-colors">Counsellors</Link>
          <Link to="/services" className="hover:text-blue-600 transition-colors">Services</Link>
          <Link to="/about" className="hover:text-blue-600 transition-colors">About</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>

          {/* <Link
            to="/auth"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 font-semibold"
          >
            Login
          </Link> */}

          {/* IF USER LOGGED IN */}
          {user ? (
            <div className="flex items-center gap-4">

              {/* Profile Circle */}
              <div
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer font-bold uppercase hover:bg-blue-700 transition"
              >
                {user.name?.charAt(0)}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition shadow-lg font-semibold"
            >
              Login
            </Link>
          )}

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-slate-600 focus:outline-none text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 transition-all duration-300 ease-in-out ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5 pointer-events-none"
          }`}
      >
        <div className="flex flex-col p-6 gap-4 text-slate-600 font-medium text-center">
          <Link
            to="/"
            className="hover:text-blue-600 py-2 border-b border-slate-50"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/counsellors"
            className="hover:text-blue-600 py-2 border-b border-slate-50"
            onClick={() => setIsOpen(false)}
          >
            Counsellors
          </Link>
          <Link
            to="/services"
            className="hover:text-blue-600 py-2 border-b border-slate-50"
            onClick={() => setIsOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/about"
            className="hover:text-blue-600 py-2 border-b border-slate-50"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hover:text-blue-600 py-2"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="/auth"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition shadow-md mx-auto w-full max-w-xs"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
