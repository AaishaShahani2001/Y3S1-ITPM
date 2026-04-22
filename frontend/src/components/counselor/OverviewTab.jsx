import React, { useEffect, useMemo, useState } from "react";
import {
    FaClipboardList, FaBrain, FaCheckCircle, FaVideo,
    FaMapMarkerAlt, FaChevronRight, FaCalendarPlus, FaStethoscope, FaStar, FaBell
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const API_BASE = "http://localhost:3000";

export default function OverviewTab() {
    // Router helper for tab navigation actions.
    const navigate = useNavigate();
    // Base datasets/state used by all overview widgets.
    const [appointments, setAppointments] = useState([]);
    const [assignedWorkplace, setAssignedWorkplace] = useState("");
    const [loading, setLoading] = useState(true);
    // Week selector for mood distribution chart.
    const [moodWeekView, setMoodWeekView] = useState("current");

    // Read logged-in counselor details from local storage.
    const user = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        // Loads counselor appointments + assigned location in parallel.
        const loadOverview = async () => {
            if (!user?.token) {
                setLoading(false);
                setAppointments([]);
                setAssignedWorkplace("");
                return;
            }
            setLoading(true);
            try {
                const [apptRes, locRes] = await Promise.all([
                    fetch(`${API_BASE}/api/appointments/counselor`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                    fetch(`${API_BASE}/api/counsellor/location/me`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                ]);

                const apptData = apptRes.ok ? await apptRes.json() : [];
                const locData = locRes.ok ? await locRes.json() : {};
                const list = Array.isArray(apptData) ? apptData : [];
                // Keep a normalized list for downstream cards/sections.
                setAppointments(list);
                // Prefer dedicated location endpoint, fallback to appointment join field.
                setAssignedWorkplace(
                    String(locData.workplace ?? locData.assignLocation ?? list[0]?.assignLocation ?? "").trim()
                );
            } catch (err) {
                console.error("Failed to load counselor overview", err);
                toast.error("Failed to load counselor overview");
                setAppointments([]);
                setAssignedWorkplace("");
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, [user?.token]);

    // Normalized YYYY-MM-DD used for date comparisons.
    const todayStr = useMemo(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    // Excludes cancelled/deleted rows from active queue metrics.
    const activeAppointments = useMemo(() => {
        return appointments.filter((a) => {
            const status = (a.status || "").toLowerCase();
            return status !== "deleted" && status !== "cancelled";
        });
    }, [appointments]);

    // Today schedule ordered by start time.
    const todaySchedule = useMemo(() => {
        return activeAppointments
            .filter((a) => (a.date || "") === todayStr)
            .sort((a, b) => (a.timeSlot || "").localeCompare(b.timeSlot || ""));
    }, [activeAppointments, todayStr]);

    // Top card: pending queue count.
    const pendingCount = useMemo(
        () => activeAppointments.filter((a) => (a.status || "").toLowerCase() === "pending").length,
        [activeAppointments]
    );

    // Top card: completed sessions count.
    const completedCount = useMemo(
        () => appointments.filter((a) => (a.status || "").toLowerCase() === "completed").length,
        [appointments]
    );

    // Derived high-priority indicator for quick overview.
    const highPriorityCount = useMemo(
        () => activeAppointments.filter((a) => Number(a.urgency || 0) >= 7).length,
        [activeAppointments]
    );

    // Top card: average urgency across active sessions.
    const averageUrgency = useMemo(() => {
        if (activeAppointments.length === 0) return "0.0";
        const sum = activeAppointments.reduce((acc, a) => acc + Number(a.urgency || 0), 0);
        return (sum / activeAppointments.length).toFixed(1);
    }, [activeAppointments]);

    // Friendly formatter for appointment time slot.
    const formatTime = (slot) => {
        if (!slot) return "—";
        return slot;
    };

    // Friendly formatter for YYYY-MM-DD dates.
    const formatDate = (isoDate) => {
        if (!isoDate) return "—";
        const [y, m, d] = isoDate.split("-");
        const dt = new Date(Number(y), (Number(m) || 1) - 1, Number(d) || 1);
        return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    // Converts numeric urgency into UI pill labels.
    const getUrgencyLabel = (urgency) => {
        if (Number(urgency) >= 7) return "High Priority";
        if (Number(urgency) >= 4) return "Medium";
        return "Normal";
    };

    // Snapshot of the earliest session for the day.
    const nextSession = todaySchedule[0];

    // Left column: pending requests only (today/future), limited to top 5.
    const appointmentRequests = useMemo(
        () =>
            appointments
                .filter((a) => (a.status || "").trim().toLowerCase() === "pending")
                .filter((a) => (a.date || "") >= todayStr)
                .sort((a, b) => `${a.date || ""} ${a.timeSlot || ""}`.localeCompare(`${b.date || ""} ${b.timeSlot || ""}`))
                .slice(0, 5),
        [appointments, todayStr]
    );

    // Right column: week-based mood distribution pie chart.
    const moodPieChart = useMemo(() => {
        const referenceDate = new Date();
        const currentDay = referenceDate.getDay();
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        const weekStart = new Date(referenceDate);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(referenceDate.getDate() + mondayOffset + (moodWeekView === "previous" ? -7 : 0));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const buckets = {
            happy: 0,
            neutral: 0,
            sad: 0,
            stressed: 0,
            angry: 0,
            other: 0,
        };

        activeAppointments.forEach((row) => {
            if (!row.date) return;
            const d = new Date(row.date);
            d.setHours(0, 0, 0, 0);
            if (d < weekStart || d >= weekEnd) return;
            const mood = String(row.mood || "").trim().toLowerCase();
            if (!mood) return;

            if (mood.includes("happy") || mood.includes("calm")) buckets.happy += 1;
            else if (mood.includes("neutral") || mood.includes("ok")) buckets.neutral += 1;
            else if (mood.includes("sad") || mood.includes("depress")) buckets.sad += 1;
            else if (mood.includes("stress") || mood.includes("anx")) buckets.stressed += 1;
            else if (mood.includes("angry")) buckets.angry += 1;
            else buckets.other += 1;
        });

        const dataPoints = [
            buckets.happy,
            buckets.neutral,
            buckets.sad,
            buckets.stressed,
            buckets.angry,
            buckets.other,
        ];

        return {
            hasData: dataPoints.some((v) => v > 0),
            data: {
                labels: ["Happy", "Neutral", "Sad", "Stressed", "Angry", "Other"],
                datasets: [
                    {
                        label: "Mood Distribution",
                        data: dataPoints,
                        backgroundColor: [
                            "rgba(34,197,94,0.8)",
                            "rgba(100,116,139,0.8)",
                            "rgba(59,130,246,0.8)",
                            "rgba(234,179,8,0.8)",
                            "rgba(239,68,68,0.8)",
                            "rgba(168,85,247,0.8)",
                        ],
                        borderColor: "#ffffff",
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { boxWidth: 10, color: "#475569" },
                    },
                },
            },
        };
    }, [activeAppointments, moodWeekView]);

    // Notification feed combines high-priority + cancellation-note events.
    const notifications = useMemo(() => {
        const items = [];
        const highPriority = activeAppointments.filter((a) => Number(a.urgency || 0) >= 7).slice(0, 2);
        for (const row of highPriority) {
            items.push({
                id: `high-${row.id || row.ID || row.bookingId}`,
                text: `${row.studentName || "Student"} marked as high priority (${formatDate(row.date)} ${row.timeSlot || ""}).`,
            });
        }
        const cancelRequests = activeAppointments
            .filter((a) => (a.status || "").toLowerCase() === "confirmed" && a.studentCancelNote)
            .slice(0, 2);
        for (const row of cancelRequests) {
            items.push({
                id: `cancel-${row.id || row.ID || row.bookingId}`,
                text: `Cancellation note submitted by ${row.studentName || "student"} for ${formatDate(row.date)}.`,
            });
        }
        if (items.length === 0 && todaySchedule.length > 0) {
            items.push({
                id: "today",
                text: `You have ${todaySchedule.length} session(s) scheduled today.`,
            });
        }
        return items.slice(0, 4);
    }, [activeAppointments, todaySchedule]);

    // Bottom section: latest completed sessions for quick history.
    const sessionHistory = useMemo(
        () =>
            appointments
                .filter((a) => (a.status || "").toLowerCase() === "completed")
                .sort((a, b) => `${b.date || ""} ${b.timeSlot || ""}`.localeCompare(`${a.date || ""} ${a.timeSlot || ""}`))
                .slice(0, 6),
        [appointments]
    );

    return (
        <div className="animate-fadeIn space-y-8">
            {/* Dashboard heading with dynamic counselor summary text. */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Counselor Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">
                        {loading
                            ? "Loading your schedule..."
                            : `Welcome back, ${user?.name || "Counselor"}. You have ${todaySchedule.length} session(s) today.`}
                    </p>
                </div>
            </div>

            {/* Top Stats cards row. */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Sessions" value={loading ? "—" : String(appointments.length)} icon={<FaClipboardList className="text-blue-600" />} color="bg-blue-600" />
                <StatCard label="Pending Queue" value={loading ? "—" : String(pendingCount)} icon={<FaBrain className="text-purple-600" />} color="bg-purple-600" />
                <StatCard label="Completed Sessions" value={loading ? "—" : String(completedCount)} icon={<FaCheckCircle className="text-green-600" />} color="bg-green-600" />
                <StatCard label="Avg Urgency" value={loading ? "—" : averageUrgency} icon={<FaStar className="text-yellow-600" />} color="bg-yellow-600" />
            </div>

            {/* Middle area: left operational queues + right analytics and alerts. */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    {/* Left panel: today schedule with quick review action. */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black mb-4">Today&apos;s Schedule</h3>
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading schedule...</p>
                            ) : todaySchedule.length === 0 ? (
                                <p className="text-sm text-slate-500">No sessions scheduled for today.</p>
                            ) : todaySchedule.map((session, i) => (
                                <div key={session.id || session.ID || i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center w-16">
                                            <p className="text-xs font-black">{formatTime(session.timeSlot)}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">{session.date || "Today"}</p>
                                        </div>
                                        <div className="h-8 w-0.5 bg-slate-200"></div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900">{session.studentName || "Student"}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                                                    {(session.mode || "").toLowerCase().includes("video") ? <FaVideo /> : <FaMapMarkerAlt />} {session.mode || "Session"}
                                                </span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${getUrgencyLabel(session.urgency) === "High Priority" ? "bg-red-100 text-red-600" : getUrgencyLabel(session.urgency) === "Medium" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                                                    {getUrgencyLabel(session.urgency)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => navigate("/counselor-dashboard?tab=appointments")} className="p-2.5 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                        <FaChevronRight className="text-xs" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Left panel: pending appointment requests only. */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-lg font-black mb-4">Appointment Requests</h3>
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading requests...</p>
                            ) : appointmentRequests.length === 0 ? (
                                <p className="text-sm text-slate-500">No pending requests.</p>
                            ) : appointmentRequests.map((item) => (
                                <div key={item.id || item.ID || item.bookingId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{item.studentName || "Student"}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            {formatDate(item.date)} • {item.timeSlot || "—"}
                                        </p>
                                    </div>
                                    <button type="button" onClick={() => navigate("/counselor-dashboard?tab=appointments")} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
                                        Review
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Right panel: weekly mood distribution with week selector. */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-4 gap-3">
                            <h3 className="text-lg font-black">Mood Analytics</h3>
                            <select
                                value={moodWeekView}
                                onChange={(e) => setMoodWeekView(e.target.value)}
                                className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600"
                            >
                                <option value="current">Current Week</option>
                                <option value="previous">Previous Week</option>
                            </select>
                        </div>
                        <div className="h-72">
                            {loading ? (
                                <p className="text-sm text-slate-500">Loading mood distribution...</p>
                            ) : !moodPieChart.hasData ? (
                                <p className="text-sm text-slate-500">No mood entries found for this week.</p>
                            ) : (
                                <Pie data={moodPieChart.data} options={moodPieChart.options} />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom section: session history + notifications side by side. */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-black mb-4">Session History</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-sm text-slate-500">Loading session history...</p>
                        ) : sessionHistory.length === 0 ? (
                            <p className="text-sm text-slate-500">No completed sessions yet.</p>
                        ) : sessionHistory.map((s) => (
                            <div key={s.id || s.ID || s.bookingId} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-sm font-bold text-slate-900">{s.studentName || "Student"}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {formatDate(s.date)} • {s.timeSlot || "—"} • {s.mood || "No mood"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm">
                    <h3 className="text-lg font-black mb-4">Notifications</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-sm text-slate-300">Loading notifications...</p>
                        ) : notifications.length === 0 ? (
                            <p className="text-sm text-slate-300">No new notifications.</p>
                        ) : notifications.map((n) => (
                            <div key={n.id} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                                <FaBell className="mt-0.5 text-blue-300 shrink-0" />
                                <p className="text-xs text-slate-200">{n.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable top stats card.
function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-50`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
                    <p className="text-2xl font-black tracking-tighter text-slate-900">{value}</p>
                </div>
            </div>
            <div className={`w-1.5 h-8 ${color} rounded-full`}></div>
        </div>
    );
}

