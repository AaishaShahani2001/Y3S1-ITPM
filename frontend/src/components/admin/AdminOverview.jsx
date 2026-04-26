import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaClock, FaExclamationTriangle, FaUserMd } from "react-icons/fa";
import { toast } from "react-toastify";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

const API_BASE = "http://localhost:3000";

const AdminOverview = () => {
  // Core datasets used to build cards, charts, and tables.
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // Convert booking date/time fields into one comparable timestamp.
  const toBookingTime = (date, timeSlot) => {
    const datePart = String(date || "").trim();
    const timePart = String(timeSlot || "00:00").split("-")[0].trim();
    const parsed = new Date(`${datePart} ${timePart}`);
    return Number.isNaN(parsed.getTime()) ? NaN : parsed.getTime();
  };

  // Load admin overview sources in parallel.
  useEffect(() => {
    const load = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [appointmentsRes, applicationsRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/appointments`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${API_BASE}/api/admin/applications`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${API_BASE}/api/events`),
        ]);

        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          setAppointments(Array.isArray(data) ? data : []);
        } else {
          setAppointments([]);
        }

        if (applicationsRes.ok) {
          const data = await applicationsRes.json();
          setApplications(Array.isArray(data) ? data : []);
        } else {
          setApplications([]);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(Array.isArray(data) ? data : []);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard overview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.token]);

  // Top row stats cards.
  const stats = useMemo(() => {
    const pendingBookings = appointments.filter(
      (a) => (a.status || "").toLowerCase() === "pending"
    ).length;
    const appointmentWaitlist = appointments.filter((a) => {
      const st = (a.status || "").toLowerCase();
      return st === "waitlist" || st === "waitlisted";
    }).length;
    const approvedDoctors = applications.filter(
      (a) => (a.status || "").toLowerCase() === "approved"
    ).length;
    const pendingApprovals = applications.filter(
      (a) => (a.status || "").toLowerCase() === "pending"
    ).length;
    return {
      totalBookings: appointments.length,
      pendingBookings,
      appointmentWaitlist,
      approvedDoctors,
      pendingApprovals,
      totalEvents: events.length,
    };
  }, [appointments, applications, events]);

  // Recent feed: last 3 bookings + last 3 applications, merged by newest.
  const recentActivity = useMemo(() => {
    const appointmentItems = appointments.slice(0, 3).map((a) => ({
      key: `appt-${a.id ?? a.ID ?? a.bookingId}`,
      title: `Booking ${a.bookingId || a.id || "—"} • ${(a.status || "unknown").toUpperCase()}`,
      subtitle: `${a.studentName || "Student"} with ${a.counselorName || "Counselor"}`,
      date: a.date || "",
      icon: <FaCalendarAlt className="text-blue-600" />,
    }));

    const applicationItems = applications.slice(0, 3).map((a) => ({
      key: `app-${a.id}`,
      title: `Counselor application • ${(a.status || "pending").toUpperCase()}`,
      subtitle: `${a.fullName || "Unknown"} • ${a.specialization || "N/A"}`,
      date: a.createdAt || a.created_at || "",
      icon: <FaUserMd className="text-purple-600" />,
    }));

    return [...appointmentItems, ...applicationItems].sort(
      (x, y) => new Date(y.date).getTime() - new Date(x.date).getTime()
    );
  }, [appointments, applications]);

  // Weekly line graph: pending/confirmed bookings only.
  const weeklyBookingChart = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const day = now.getDay(); // 0 Sun ... 6 Sat
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() + mondayOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    appointments.forEach((a) => {
      if (!a.date) return;
      const status = (a.status || "").toLowerCase();
      if (status !== "pending" && status !== "confirmed") return;
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      if (d < weekStart || d >= weekEnd) return;
      const index = Math.floor((d.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      if (index >= 0 && index < 7) counts[index] += 1;
    });

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Bookings",
            data: counts,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.18)",
            fill: true,
            tension: 0.35,
            pointRadius: 3.5,
            pointHoverRadius: 5,
            pointBackgroundColor: "#1d4ed8",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: "#64748b" },
            grid: { color: "rgba(148, 163, 184, 0.2)" },
          },
          x: {
            ticks: { color: "#64748b" },
            grid: { display: false },
          },
        },
      },
    };
  }, [appointments]);

  // Event booking graph: registrations per weekday for the current week.
  const eventBookingChart = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() + mondayOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    events.forEach((ev) => {
      const rawDate = ev.date || ev.Date || ev.eventDate || ev.EventDate || ev.createdAt || ev.created_at;
      if (!rawDate) return;
      const d = new Date(rawDate);
      d.setHours(0, 0, 0, 0);
      if (d < weekStart || d >= weekEnd) return;
      const index = Math.floor((d.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
      if (index >= 0 && index < 7) {
        counts[index] += Number(ev.registered || ev.Registered || 0);
      }
    });

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Event Bookings",
            data: counts,
            borderColor: "#7c3aed",
            backgroundColor: "rgba(124, 58, 237, 0.18)",
            fill: true,
            tension: 0.35,
            pointRadius: 3.5,
            pointHoverRadius: 5,
            pointBackgroundColor: "#6d28d9",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: "#64748b" },
            grid: { color: "rgba(148, 163, 184, 0.2)" },
          },
          x: {
            ticks: { color: "#64748b" },
            grid: { display: false },
          },
        },
      },
    };
  }, [events]);

  // Mood analytics graph: pending/confirmed bookings only.
  const moodAnalysisChart = useMemo(() => {
    const moodMap = {
      happy: 0,
      neutral: 0,
      sad: 0,
      stressed: 0,
      angry: 0,
      other: 0,
    };

    appointments.forEach((a) => {
      const status = (a.status || "").toLowerCase();
      if (status !== "pending" && status !== "confirmed") return;
      const mood = String(a.mood || "").trim().toLowerCase();
      if (!mood) return;
      if (Object.prototype.hasOwnProperty.call(moodMap, mood)) {
        moodMap[mood] += 1;
      } else {
        moodMap.other += 1;
      }
    });

    return {
      data: {
        labels: ["Happy", "Neutral", "Sad", "Stressed", "Angry", "Other"],
        datasets: [
          {
            label: "Bookings by Mood",
            data: [
              moodMap.happy,
              moodMap.neutral,
              moodMap.sad,
              moodMap.stressed,
              moodMap.angry,
              moodMap.other,
            ],
            backgroundColor: [
              "rgba(34,197,94,0.75)",
              "rgba(100,116,139,0.75)",
              "rgba(59,130,246,0.75)",
              "rgba(234,179,8,0.75)",
              "rgba(239,68,68,0.75)",
              "rgba(168,85,247,0.75)",
            ],
            borderRadius: 8,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: "#64748b" },
            grid: { color: "rgba(148, 163, 184, 0.2)" },
          },
          x: {
            ticks: { color: "#64748b" },
            grid: { display: false },
          },
        },
      },
    };
  }, [appointments]);

  // Upcoming appointments: future pending/confirmed items (top 3).
  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter((a) => {
        const st = (a.status || "").toLowerCase();
        if (st !== "pending" && st !== "confirmed") return false;
        const t = toBookingTime(a.date, a.timeSlot);
        return Number.isFinite(t) && t >= now;
      })
      .sort((a, b) => {
        const da = toBookingTime(a.date, a.timeSlot);
        const db = toBookingTime(b.date, b.timeSlot);
        return da - db;
      })
      .slice(0, 3);
  }, [appointments]);

  // Alerts: future high-urgency pending/confirmed bookings only.
  const highPriorityAlerts = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter((a) => {
        const st = (a.status || "").toLowerCase();
        const urgency = Number(a.urgency);
        if ((st !== "pending" && st !== "confirmed") || Number.isNaN(urgency) || urgency < 3) {
          return false;
        }
        const t = toBookingTime(a.date, a.timeSlot);
        return Number.isFinite(t) && t >= now;
      })
      .sort((a, b) => Number(b.urgency || 0) - Number(a.urgency || 0))
      .slice(0, 5);
  }, [appointments]);

  // Performance table: grouped counselor metrics from booking records.
  const counselorPerformance = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      const key = a.counselorName || "Unknown Counselor";
      if (!map.has(key)) {
        map.set(key, {
          counselorName: key,
          total: 0,
          confirmed: 0,
          completed: 0,
          pending: 0,
          urgencySum: 0,
          urgencyCount: 0,
        });
      }
      const row = map.get(key);
      row.total += 1;
      const st = (a.status || "").toLowerCase();
      if (st === "confirmed") row.confirmed += 1;
      if (st === "completed") row.completed += 1;
      if (st === "pending") row.pending += 1;
      const urg = Number(a.urgency);
      if (!Number.isNaN(urg)) {
        row.urgencySum += urg;
        row.urgencyCount += 1;
      }
    });
    return Array.from(map.values())
      .map((r) => ({
        ...r,
        avgUrgency: r.urgencyCount ? (r.urgencySum / r.urgencyCount).toFixed(1) : "—",
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [appointments]);

  // Waitlist summary: event waitlist + appointment waitlist + pending approvals.
  const waitlistSummary = useMemo(() => {
    const totalEventWaitlist = events.reduce((sum, ev) => sum + Number(ev.waitlist || 0), 0);
    const appointmentWaitlistCount = appointments.filter((a) => {
      const st = (a.status || "").toLowerCase();
      return st === "waitlist" || st === "waitlisted";
    }).length;
    const pendingApplications = applications.filter(
      (a) => (a.status || "").toLowerCase() === "pending"
    ).length;
    return {
      totalEventWaitlist,
      appointmentWaitlistCount,
      pendingApplications,
      eventsWithWaitlist: events.filter((ev) => Number(ev.waitlist || 0) > 0).length,
    };
  }, [events, applications, appointments]);

  // Shared date formatter for list/table rows.
  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
          <p className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Total Bookings</p>
          <h3 className="text-3xl font-bold text-blue-900 mt-2">{loading ? "—" : stats.totalBookings}</h3>
        </div>
        <div className="bg-cyan-50 p-5 rounded-xl border border-cyan-100">
          <p className="text-cyan-700 text-xs font-semibold uppercase tracking-wider">Pending Bookings</p>
          <h3 className="text-3xl font-bold text-cyan-900 mt-2">{loading ? "—" : stats.pendingBookings}</h3>
        </div>
        <div className="bg-green-50 p-5 rounded-xl border border-green-100">
          <p className="text-green-700 text-xs font-semibold uppercase tracking-wider">Approved Doctors</p>
          <h3 className="text-3xl font-bold text-green-900 mt-2">{loading ? "—" : stats.approvedDoctors}</h3>
        </div>
        <div className="bg-amber-50 p-5 rounded-xl border border-amber-100">
          <p className="text-amber-700 text-xs font-semibold uppercase tracking-wider">Appt Waitlist</p>
          <h3 className="text-3xl font-bold text-amber-900 mt-2">{loading ? "—" : stats.appointmentWaitlist}</h3>
        </div>
        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
          <p className="text-orange-700 text-xs font-semibold uppercase tracking-wider">Pending Approvals</p>
          <h3 className="text-3xl font-bold text-orange-900 mt-2">{loading ? "—" : stats.pendingApprovals}</h3>
        </div>
        <div className="bg-violet-50 p-5 rounded-xl border border-violet-100">
          <p className="text-violet-700 text-xs font-semibold uppercase tracking-wider">Total Events</p>
          <h3 className="text-3xl font-bold text-violet-900 mt-2">{loading ? "—" : stats.totalEvents}</h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading recent activity...</p>
          ) : recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity found.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((item) => (
                <li key={item.key} className="bg-white border border-gray-100 rounded-lg p-3 flex items-start gap-3">
                  <div className="mt-0.5">{item.icon}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
                    <FaClock />
                    {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Appointment Booking</h3>
            <span className="text-xs text-slate-500 font-medium">Current week</span>
          </div>
          <div className="h-72">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading chart...</p>
            ) : (
              <Line data={weeklyBookingChart.data} options={weeklyBookingChart.options} />
            )}
          </div>

          <div className="flex items-center justify-between mb-3 mt-6">
            <h3 className="text-lg font-semibold text-gray-700">Event Booking</h3>
            <span className="text-xs text-slate-500 font-medium">Current week</span>
          </div>
          <div className="h-56">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading event chart...</p>
            ) : (
              <Line data={eventBookingChart.data} options={eventBookingChart.options} />
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Mood Analytics</h3>
            <span className="text-xs text-slate-500 font-medium">Pending + Confirmed bookings</span>
          </div>
          <div className="h-72">
            {loading ? (
              <p className="text-gray-500 text-sm">Loading mood graph...</p>
            ) : (
              <Bar data={moodAnalysisChart.data} options={moodAnalysisChart.options} />
            )}
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Upcoming Appointments</h3>
            <span className="text-xs text-slate-500 font-medium">Top 3</span>
          </div>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading upcoming appointments...</p>
          ) : upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming appointments.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingAppointments.map((a) => (
                <li key={a.id ?? a.ID ?? a.bookingId} className="bg-white rounded-lg border border-gray-100 p-3">
                  <p className="text-sm font-semibold text-gray-800">
                    {a.studentName || "Student"} with {a.counselorName || "Counselor"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(a.date)} • {a.timeSlot || "—"} • {(a.status || "").toUpperCase()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Alerts</h3>
            <span className="text-xs text-slate-500 font-medium">High priority bookings</span>
          </div>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading alerts...</p>
          ) : highPriorityAlerts.length === 0 ? (
            <p className="text-gray-500 text-sm">No high-priority booking alerts.</p>
          ) : (
            <ul className="space-y-3">
              {highPriorityAlerts.map((a) => (
                <li
                  key={`alert-${a.id ?? a.ID ?? a.bookingId}`}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3"
                >
                  <FaExclamationTriangle className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      {a.studentName || "Student"} • Urgency {a.urgency ?? "—"}
                    </p>
                    <p className="text-xs text-amber-800">
                      {formatDate(a.date)} • {a.timeSlot || "—"} • {a.counselorName || "Counselor"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Counselor Performance Table</h3>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading performance data...</p>
          ) : counselorPerformance.length === 0 ? (
            <p className="text-gray-500 text-sm">No counselor performance data.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="py-2 pr-3">Counselor</th>
                    <th className="py-2 pr-3">Total</th>
                    <th className="py-2 pr-3">Confirmed</th>
                    <th className="py-2 pr-3">Completed</th>
                    <th className="py-2 pr-3">Pending</th>
                    <th className="py-2">Avg Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {counselorPerformance.map((r) => (
                    <tr key={r.counselorName}>
                      <td className="py-2 pr-3 font-medium text-gray-800">{r.counselorName}</td>
                      <td className="py-2 pr-3">{r.total}</td>
                      <td className="py-2 pr-3">{r.confirmed}</td>
                      <td className="py-2 pr-3">{r.completed}</td>
                      <td className="py-2 pr-3">{r.pending}</td>
                      <td className="py-2">{r.avgUrgency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Waitlist Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Event Waitlist Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "—" : waitlistSummary.totalEventWaitlist}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Appointment Waitlist</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "—" : waitlistSummary.appointmentWaitlistCount}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Events with Waitlist</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "—" : waitlistSummary.eventsWithWaitlist}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Pending Approvals</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {loading ? "—" : waitlistSummary.pendingApplications}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Waitlist values are aggregated from events data and current pending approval workload.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
