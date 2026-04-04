import React, { useState, useEffect } from "react";
import {
  FaThLarge,
  FaCalendarCheck,
  FaFileAlt,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";

const API_BASE = "http://localhost:3000";

import MyEvents from "./MyEvents";
import AppointmentsTab from "../../components/student/AppointmentsTab";
import MyWaitListTab from "../../components/student/MyWaitListTab";
import TreatmentPlanTab from "../../components/student/TreatmentPlanTab";
import MyReportView from "../../components/student/MyReportView";
import OverviewTab from "../../components/student/OverviewTab";

const TABS = [
  { id: "overview", label: "Overview", icon: <FaThLarge /> },
  { id: "appointments", label: "Appointments", icon: <FaCalendarCheck /> },
  { id: "waitlist", label: "Wait List", icon: <FaCalendarCheck /> },
  { id: "treatment", label: "Treatment Plan", icon: <FaCalendarCheck /> },
  { id: "reports", label: "My Reports", icon: <FaFileAlt /> },
  { id: "events", label: "My Events", icon: <FaCalendarCheck /> },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [headerProfile, setHeaderProfile] = useState({
    displayName: "",
    subtitle: "Student",
  });

  const handleViewReport = () => {
    setReportUnlocked(true);
    setActiveTab("reports");
  };

  useEffect(() => {
    let raw;
    try {
      raw = localStorage.getItem("user");
    } catch {
      window.location.href = "/login";
      return;
    }
    const storedUser = raw ? JSON.parse(raw) : null;

    if (!storedUser?.token) {
      window.location.href = "/login";
      return;
    }

    setUser(storedUser);
    setHeaderProfile((prev) => ({
      ...prev,
      displayName: storedUser.name || "",
    }));

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/validate`, {
          headers: { Authorization: `Bearer ${storedUser.token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const u = data.user;
        if (!u || cancelled) return;
        const roleLabel =
          typeof u.role === "string" && u.role
            ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
            : "Student";
        setHeaderProfile({
          displayName: u.name || storedUser.name || "Student",
          subtitle: roleLabel,
        });
      } catch {
        /* keep name from localStorage */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-4 md:p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black">
            M
          </div>
          <span className="hidden md:block font-black">MindBridge</span>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {tab.icon}
              <span className="hidden md:block">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex gap-2 text-red-400">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-x-hidden">

        {/* HEADER — same pattern as CounselorDashboard (name + role; no student profile image in API) */}
        <header className="h-16 bg-white border-b border-slate-100 px-6 md:px-10 flex items-center justify-between sticky top-0 z-10">
          <div className="relative hidden md:block w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search appointments, resources..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-xs focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-5 ml-auto md:ml-0">
            <button
              type="button"
              className="relative w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
              aria-label="Notifications"
            >
              <FaBell className="text-sm" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-100 mx-1 hidden md:block" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block min-w-0">
                <p className="text-xs font-black tracking-tight truncate max-w-50">
                  {headerProfile.displayName || user?.name || "Student"}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-50">
                  {headerProfile.subtitle}
                </p>
              </div>
              <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-200 overflow-hidden ring-2 ring-slate-50 ring-offset-1 flex items-center justify-center">
                <FaUserCircle className="text-2xl text-slate-500" aria-hidden />
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-6">

          {activeTab === "events" && <MyEvents />}

          {activeTab === "appointments" && <AppointmentsTab />}
          {activeTab === "waitlist" && <MyWaitListTab />}
          {activeTab === "treatment" && (
            <TreatmentPlanTab onViewReport={handleViewReport} />
          )}
          {activeTab === "reports" && (
            <MyReportView reportUnlocked={reportUnlocked} />
          )}

          {activeTab === "overview" && <OverviewTab />}

        </div>
      </main>
    </div>
  );
}