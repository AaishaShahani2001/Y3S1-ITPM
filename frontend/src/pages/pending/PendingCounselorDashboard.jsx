import React from "react";
import { FaClipboardCheck, FaSignOutAlt } from "react-icons/fa";
import PendingCounselorInterviewStatus from "../../components/pending/PendingCounselorInterviewStatus";

export default function PendingCounselorDashboard() {
  // Dedicated shell for users with counselorApplication.status === "pending".
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-[#fff9ee] border-r border-[#e8dcc3] p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <FaClipboardCheck />
          </div>
          <p className="font-black text-slate-800">MindBridge</p>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
          <p className="text-xs font-bold uppercase text-blue-600">Pending Counselor</p>
          <p className="text-sm font-semibold text-slate-700 mt-1 truncate">
            {user?.name || user?.email || "User"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 text-sm font-bold text-rose-600 border border-rose-200 rounded-xl px-3 py-2 hover:bg-rose-50"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <main className="flex-1 p-5 md:p-8">
        {/* Interview timeline card section (status, date, notes, process steps). */}
        <PendingCounselorInterviewStatus />
      </main>
    </div>
  );
}
