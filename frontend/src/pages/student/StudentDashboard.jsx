import React, { useState, useEffect } from "react";
import {
  FaThLarge,
  FaCalendarCheck,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
} from "react-icons/fa";

// ✅ YOUR FEATURE
import MyEvents from "./MyEvents";

// ✅ TEAM FEATURES
import AppointmentsTab from "../../components/student/AppointmentsTab";
import MyWaitListTab from "../../components/student/MyWaitListTab";
import TreatmentPlanTab from "../../components/student/TreatmentPlanTab";

const TABS = [
  { id: "overview", label: "Overview", icon: <FaThLarge /> },
  { id: "appointments", label: "Appointments", icon: <FaCalendarCheck /> },
  { id: "waitlist", label: "Wait List", icon: <FaCalendarCheck /> },
  { id: "treatment", label: "Treatment Plan", icon: <FaCalendarCheck /> },
  { id: "reports", label: "My Reports", icon: <FaFileAlt /> },
  { id: "settings", label: "Settings", icon: <FaCog /> },
  { id: "events", label: "My Events", icon: <FaCalendarCheck /> }, // ✅ YOUR FEATURE
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser?.token) {
      window.location.href = "/login";
      return;
    }

    setUser(storedUser);
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
      <main className="flex-1">

        {/* HEADER */}
        <header className="h-16 bg-white flex justify-between items-center px-6">
          <input placeholder="Search..." className="border px-3 py-1 rounded" />
          <div>{user?.name}</div>
        </header>

        {/* CONTENT */}
        <div className="p-6">

          {activeTab === "events" && <MyEvents />}

          {activeTab === "appointments" && <AppointmentsTab />}
          {activeTab === "waitlist" && <MyWaitListTab />}
          {activeTab === "treatment" && <TreatmentPlanTab />}

          {activeTab === "overview" && <p>Overview coming soon...</p>}
          {activeTab === "reports" && <p>Reports coming soon...</p>}
          {activeTab === "settings" && <p>Settings coming soon...</p>}

        </div>
      </main>
    </div>
  );
}