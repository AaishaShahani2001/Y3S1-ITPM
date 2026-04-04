import React, { useState, useEffect } from "react";
import {
  FaUserCircle, FaCalendarPlus, FaClipboardList, FaCalendar,
  FaStethoscope, FaChartLine, FaSignOutAlt, FaBell, FaSearch
} from "react-icons/fa";

const API_BASE = "http://localhost:3000";
import OverviewTab from "../../components/counselor/OverviewTab";
import Calendar from "../../components/counselor/Calendar";
import ProfileTab from "../../components/counselor/ProfileTab";
import AvailabilityTab from "../../components/counselor/AvailabilityTab";
import AppointmentsTab from "../../components/counselor/AppointmentsTab";
import ManagePlansTab from "../../components/counselor/ManagePlansTab";

const TABS = [
  { id: "overview", label: "Overview", icon: <FaChartLine /> },
  { id: "calendar", label: "Calendar", icon: <FaCalendar /> },
  { id: "profile", label: "My Profile", icon: <FaUserCircle /> },
  { id: "availability", label: "Manage Availability", icon: <FaCalendarPlus /> },
  { id: "appointments", label: "Student Appointments", icon: <FaClipboardList /> },
  { id: "manage-plans", label: "Manage Treatment Plans", icon: <FaStethoscope /> },
];

export default function CounselorDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [headerProfile, setHeaderProfile] = useState(() => ({
    fullName: user?.name || "",
    specialization: "",
    profileImage: "",
  }));

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/counsellor/profile/${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setHeaderProfile({
          fullName: data.fullName || user.name || "Counselor",
          specialization: data.specialization || "",
          profileImage: data.profileImage || "",
        });
      } catch {
        /* keep localStorage name */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.name]);

  const avatarUrl = headerProfile.profileImage
    ? `${API_BASE}/${headerProfile.profileImage}`
    : null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen transition-all duration-300">
        <div className="p-4 md:p-8 flex items-center justify-center md:justify-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-lg font-black">M</div>
          <span className="hidden md:block text-lg font-black tracking-tighter">MindBridge</span>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-center md:justify-start gap-3 p-3.5 rounded-xl transition-all group ${activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden md:block font-bold text-xs tracking-wide">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 md:p-8 border-t border-slate-800">
          <button className="w-full flex items-center justify-center md:justify-start gap-3 text-slate-400 hover:text-red-400 transition-colors">
            <FaSignOutAlt className="text-lg" />
            <span className="hidden md:block font-bold text-xs">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-x-hidden">

        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 md:px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="relative hidden md:block w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search appointments, students, cases..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="relative w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block min-w-0">
                <p className="text-xs font-black tracking-tight truncate max-w-50">
                  {headerProfile.fullName || user?.name || "Counselor"}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-50">
                  {headerProfile.specialization || "Counselor"}
                </p>
              </div>
              <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-200 overflow-hidden ring-2 ring-slate-50 ring-offset-1 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-2xl text-slate-500" aria-hidden />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* TAB CONTENT */}
        <div className="p-6 md:md:p-10 max-w-6xl w-full mx-auto">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "appointments" && <AppointmentsTab />}
          {activeTab === "calendar" && <Calendar />}
          {activeTab === "availability" && <AvailabilityTab />}
          {activeTab === "manage-plans" && <ManagePlansTab />}
        </div>

      </main>
    </div>
  );
}