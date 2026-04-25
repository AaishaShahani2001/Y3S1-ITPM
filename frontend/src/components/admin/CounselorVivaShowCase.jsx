import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaSearch, FaVideo } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:3000";

// Safe parser because some backend failures may return plain text/HTML.
const parseResponseBody = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

export default function CounselorVivaShowCase() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [schedulingId, setSchedulingId] = useState(null);
  const [form, setForm] = useState({ interviewDate: "", interviewMode: "online", interviewNote: "" });
  const minInterviewDateTime = useMemo(() => {
    // Prevent scheduling viva in the past.
    return new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16);
  }, []);

  const loadApplications = async () => {
    // Admin-only source list used to schedule viva dates for pending applications.
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await parseResponseBody(res);
      if (!res.ok) {
        toast.error(data?.error || `Failed to load applications (${res.status})`);
        setApplications([]);
        return;
      }
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load applications", err);
      toast.error("Failed to load applications");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const pendingApplications = useMemo(() => {
    // Interview scheduling applies only to pending counselor applications.
    return applications
      .filter((a) => (a.status || "").toLowerCase() === "pending")
      .filter((a) => {
        const key = `${a.fullName || ""} ${a.email || ""} ${a.specialization || ""}`.toLowerCase();
        return key.includes(search.toLowerCase());
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [applications, search]);

  const scheduledCount = useMemo(
    () => pendingApplications.filter((a) => (a.interviewStatus || "").toLowerCase() === "scheduled").length,
    [pendingApplications]
  );

  const openSchedule = (app) => {
    // Pre-fill modal with existing interview values for rescheduling/editing.
    setSchedulingId(app.id);
    const defaultDate = app.interviewDate
      ? new Date(app.interviewDate).toISOString().slice(0, 16)
      : "";
    setForm({
      interviewDate: defaultDate,
      interviewMode: app.interviewMode || "online",
      interviewNote: app.interviewNote || "",
    });
  };

  const closeSchedule = () => {
    setSchedulingId(null);
    setForm({ interviewDate: "", interviewMode: "online", interviewNote: "" });
  };

  const submitSchedule = async () => {
    if (!schedulingId) return;
    if (!form.interviewDate) {
      toast.error("Please select interview date and time");
      return;
    }
    const selectedDate = new Date(form.interviewDate);
    if (Number.isNaN(selectedDate.getTime())) {
      toast.error("Invalid interview date selected");
      return;
    }
    if (selectedDate.getTime() < Date.now()) {
      toast.error("Interview date/time cannot be in the past");
      return;
    }

    try {
      // Dedicated interview scheduling endpoint added for admin workflow.
      const res = await fetch(`${API_BASE}/api/admin/applications/${schedulingId}/interview`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await parseResponseBody(res);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Interview API not found (404). Restart backend after pulling latest route changes.");
          return;
        }
        if (res.status === 401 || res.status === 403) {
          toast.error("Unauthorized request. Please login again as admin.");
          return;
        }
        toast.error(data?.error || `Failed to schedule interview (${res.status})`);
        return;
      }
      toast.success("Interview scheduled successfully");
      closeSchedule();
      loadApplications();
    } catch (err) {
      console.error("Failed to schedule interview", err);
      toast.error("Failed to schedule interview");
    }
  };

  const updateInterviewStatus = async (applicationId, action) => {
    if (!applicationId) return;
    const endpoint =
      action === "complete"
        ? `${API_BASE}/api/admin/applications/${applicationId}/interview/complete`
        : `${API_BASE}/api/admin/applications/${applicationId}/interview/cancel`;

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await parseResponseBody(res);
      if (!res.ok) {
        toast.error(data?.error || `Failed to ${action} interview`);
        return;
      }
      toast.success(action === "complete" ? "Interview marked completed" : "Interview cancelled");
      loadApplications();
    } catch (err) {
      console.error(`Failed to ${action} interview`, err);
      toast.error(`Failed to ${action} interview`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FaVideo className="text-blue-600" /> Counselor Viva Showcase
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review applied/pending counselors and schedule viva interviews.
          </p>
        </div>
        <button
          type="button"
          onClick={loadApplications}
          className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Pending Applications</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{pendingApplications.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Interviews Scheduled</p>
          <p className="text-2xl font-black text-blue-700 mt-1">{scheduledCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-500">Awaiting Schedule</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{Math.max(pendingApplications.length - scheduledCount, 0)}</p>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, specialization..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-500 text-sm font-semibold">Loading applications...</div>
      ) : (
        <div className="space-y-3">
          {pendingApplications.map((app) => {
            const interviewDate = app.interviewDate ? new Date(app.interviewDate).toLocaleString() : "Not scheduled";
            const isScheduled = (app.interviewStatus || "").toLowerCase() === "scheduled";
            const isCompleted = (app.interviewStatus || "").toLowerCase() === "completed";
            const isCancelled = (app.interviewStatus || "").toLowerCase() === "cancelled";
            return (
              <div key={app.id} className="border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">{app.fullName}</p>
                  <p className="text-xs text-slate-500">{app.email} · {app.specialization}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold">Pending</span>
                    <span className={`px-2 py-1 rounded-full font-bold ${isScheduled ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                      {isCompleted ? "Interview Completed" : isCancelled ? "Interview Cancelled" : isScheduled ? "Interview Scheduled" : "Unscheduled"}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center gap-1">
                      <FaCalendarAlt /> {interviewDate}
                    </span>
                    {app.interviewMode && (
                      <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase">
                        {app.interviewMode}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto lg:min-w-[180px] lg:items-stretch">
                  <button
                    type="button"
                    onClick={() => openSchedule(app)}
                    className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 text-center"
                  >
                    {isScheduled ? "Reschedule Viva" : "Schedule Viva"}
                  </button>
                  {isScheduled && (
                    <>
                    <button
                      type="button"
                      onClick={() => updateInterviewStatus(app.id, "complete")}
                      className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 text-center"
                    >
                      Mark Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => updateInterviewStatus(app.id, "cancel")}
                      className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 text-center"
                    >
                      Cancel Viva
                    </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {pendingApplications.length === 0 && (
            <div className="py-10 text-center text-slate-500 text-sm font-semibold border border-dashed border-slate-300 rounded-xl">
              No pending counselor applications found.
            </div>
          )}
        </div>
      )}

      {schedulingId != null && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 border border-slate-100 shadow-xl">
            <h3 className="text-lg font-black text-slate-800">Schedule Viva Interview</h3>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Interview date & time</label>
              <input
                type="datetime-local"
                value={form.interviewDate}
                onChange={(e) => setForm((prev) => ({ ...prev, interviewDate: e.target.value }))}
                min={minInterviewDateTime}
                className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Mode</label>
              <select
                value={form.interviewMode}
                onChange={(e) => setForm((prev) => ({ ...prev, interviewMode: e.target.value }))}
                className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                <option value="online">Online</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Instruction note (optional)</label>
              <textarea
                value={form.interviewNote}
                onChange={(e) => setForm((prev) => ({ ...prev, interviewNote: e.target.value }))}
                rows={3}
                className="w-full mt-1 p-2.5 rounded-lg border border-slate-200 bg-slate-50 resize-none"
                placeholder="Meeting link, room details, required documents..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeSchedule}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSchedule}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
