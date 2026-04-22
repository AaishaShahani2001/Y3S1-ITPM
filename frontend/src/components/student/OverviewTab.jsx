import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    FaPlus, FaCalendarCheck, FaCheckCircle, FaClock,
    FaVideo, FaMapMarkerAlt, FaFileAlt, FaDownload, FaUserMd
} from "react-icons/fa";

const API_BASE = "http://localhost:3000";

export default function OverviewTab() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [waitlistEntries, setWaitlistEntries] = useState([]);

    const user = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        const loadOverview = async () => {
            if (!user?.token) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [apptRes, waitRes] = await Promise.all([
                    fetch(`${API_BASE}/api/appointments/student`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                    fetch(`${API_BASE}/api/appointments/waitlist/student`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                ]);

                const apptData = apptRes.ok ? await apptRes.json() : [];
                const waitData = waitRes.ok ? await waitRes.json() : [];
                setAppointments(Array.isArray(apptData) ? apptData : []);
                setWaitlistEntries(Array.isArray(waitData) ? waitData : []);
            } catch (err) {
                console.error("Failed to load student overview", err);
                toast.error("Failed to load overview");
                setAppointments([]);
                setWaitlistEntries([]);
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, [user?.token]);

    const todayStr = useMemo(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }, []);

    const upcomingAppointments = useMemo(() => {
        return appointments
            .filter((a) => {
                const st = (a.status || "").toLowerCase();
                if (st === "deleted" || st === "cancelled") return false;
                return (a.date || "") >= todayStr;
            })
            .sort((a, b) => `${a.date || ""} ${a.timeSlot || ""}`.localeCompare(`${b.date || ""} ${b.timeSlot || ""}`));
    }, [appointments, todayStr]);

    const nextAppointment = upcomingAppointments[0] || null;

    const recentReports = useMemo(() => {
        return appointments
            .filter((a) => (a.status || "").toLowerCase() === "completed")
            .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
            .slice(0, 3);
    }, [appointments]);

    const formatDate = (isoDate) => {
        if (!isoDate) return "—";
        const [y, m, d] = isoDate.split("-");
        const dt = new Date(Number(y), (Number(m) || 1) - 1, Number(d) || 1);
        return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="animate-fadeIn space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Welcome back, {user?.name || "Student"}! ☀️</h1>
                    <p className="text-slate-500 mt-2 font-medium">
                        {loading
                            ? "Loading your overview..."
                            : nextAppointment
                                ? `Your next session is on ${formatDate(nextAppointment.date)} at ${nextAppointment.timeSlot || "—"}.`
                                : "No upcoming sessions yet. Book your next appointment."}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/book-appointment")}
                    className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center gap-3"
                >
                    <FaPlus /> Book New Session
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/student-dashboard?tab=mood-tracker")}
                    className="bg-white text-blue-700 border border-blue-200 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3"
                >
                    <FaCheckCircle /> Mood Tracker
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Sessions" value={loading ? "—" : String(appointments.length)} icon={<FaCalendarCheck className="text-blue-600" />} color="bg-blue-600" />
                <StatCard label="Completed Sessions" value={loading ? "—" : String(appointments.filter((a) => (a.status || "").toLowerCase() === "completed").length)} icon={<FaCheckCircle className="text-green-600" />} color="bg-green-600" />
                <StatCard label="Wait List Entries" value={loading ? "—" : String(waitlistEntries.length)} icon={<FaClock className="text-orange-600" />} color="bg-orange-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-xl font-black mb-6">Upcoming Appointment</h3>
                    <div className="bg-slate-900 text-white rounded-4xl p-8 flex-1 flex flex-col justify-between">
                        {loading ? (
                            <p className="text-sm text-slate-300">Loading appointment details...</p>
                        ) : nextAppointment ? (
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/10 ring-4 ring-white/10 flex items-center justify-center text-blue-300">
                                        <FaUserMd className="text-2xl" />
                                    </div>
                                    <div>
                                        <h4 className="font-black">{nextAppointment.counselorName || "Assigned Counselor"}</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{nextAppointment.specialization || "Counseling Session"}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <FaCalendarCheck className="text-blue-400" /> {formatDate(nextAppointment.date)}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <FaClock className="text-blue-400" /> {nextAppointment.timeSlot || "—"}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <FaVideo className="text-blue-400" /> {nextAppointment.mode || "Session"}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-300">No upcoming appointment found.</p>
                        )}
                        <button
                            type="button"
                            onClick={() => navigate("/student-dashboard?tab=appointments")}
                            className="w-full bg-white text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-blue-50 transition-colors"
                        >
                            View Appointments
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black mb-6">Recent Reports</h3>
                    <div className="space-y-4">
                        {recentReports.length === 0 ? (
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-500">
                                No completed-session reports available yet.
                            </div>
                        ) : recentReports.map((item, index) => (
                            <div key={item.id || item.ID || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                        <FaFileAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{item.counselorName || "Counselor"} - Session Note</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            Completed {formatDate(item.date)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/student-dashboard?tab=appointments")}
                                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    <FaDownload />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/student-dashboard?tab=appointments")}
                        className="w-full py-4 text-blue-600 font-black text-xs uppercase tracking-widest mt-6 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        View All Documents
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-slate-50">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                    <p className="text-2xl font-black tracking-tight">{value}</p>
                </div>
            </div>
            <div className={`w-1.5 h-8 ${color} rounded-full`}></div>
        </div>
    );
}
