import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthCursor, setMonthCursor] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    });

    const user = JSON.parse(localStorage.getItem("user"));

    const fetchAppointments = async () => {
        if (!user?.token) {
            setAppointments([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/appointments/counselor", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!res.ok) {
                toast.error("Failed to load calendar appointments");
                setAppointments([]);
                return;
            }
            const data = await res.json();
            const normalized = Array.isArray(data) ? data : [];
            setAppointments(normalized.filter((a) => (a.status || "").toLowerCase() !== "deleted"));
        } catch (err) {
            console.error("Failed to load counselor calendar", err);
            toast.error("Failed to load calendar appointments");
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user?.token]);

    const appointmentsByDate = useMemo(() => {
        const map = new Map();
        for (const appt of appointments) {
            const dateKey = appt.date;
            if (!dateKey) continue;
            if (!map.has(dateKey)) map.set(dateKey, []);
            map.get(dateKey).push(appt);
        }
        for (const list of map.values()) {
            list.sort((a, b) => (a.timeSlot || "").localeCompare(b.timeSlot || ""));
        }
        return map;
    }, [appointments]);

    const monthTitle = useMemo(
        () => monthCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        [monthCursor]
    );

    const calendarDays = useMemo(() => {
        const year = monthCursor.getFullYear();
        const month = monthCursor.getMonth();
        const firstDayWeekIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const cells = [];
        for (let i = 0; i < firstDayWeekIndex; i += 1) cells.push(null);
        for (let day = 1; day <= daysInMonth; day += 1) {
            const yyyy = year;
            const mm = String(month + 1).padStart(2, "0");
            const dd = String(day).padStart(2, "0");
            cells.push(`${yyyy}-${mm}-${dd}`);
        }
        return cells;
    }, [monthCursor]);

    const selectedAppointments = appointmentsByDate.get(selectedDate) || [];

    const goPrevMonth = () => {
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    const goNextMonth = () => {
        setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "confirmed") return "bg-blue-100 text-blue-700 border border-blue-200/60";
        if (s === "completed") return "bg-indigo-100 text-indigo-700 border border-indigo-200/60";
        if (s === "cancelled") return "bg-rose-100 text-rose-700 border border-rose-200/60";
        return "bg-slate-100 text-slate-700 border border-slate-200/60";
    };

    return (
        <div className="animate-fadeIn space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent pb-1">
                        <FaCalendarAlt className="text-blue-500" /> Appointment Calendar
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Manage your schedule and student appointments</p>
                </div>
                <button
                    onClick={fetchAppointments}
                    className="px-5 py-2.5 rounded-xl border border-blue-200 text-xs font-black uppercase tracking-widest text-blue-700 hover:bg-blue-50 hover:shadow-md hover:shadow-blue-500/10 transition-all duration-300 active:scale-95 bg-white"
                >
                    Refresh Calendar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar View */}
                <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl border border-blue-100/60 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={goPrevMonth}
                            className="w-10 h-10 rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 active:scale-95 bg-white"
                        >
                            <FaChevronLeft className="text-sm" />
                        </button>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">{monthTitle}</h3>
                        <button
                            onClick={goNextMonth}
                            className="w-10 h-10 rounded-2xl border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 active:scale-95 bg-white"
                        >
                            <FaChevronRight className="text-sm" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {weekdayLabels.map((d) => (
                            <div key={d} className="text-center text-[11px] font-black uppercase tracking-widest text-blue-600/70 py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 md:gap-3">
                        {calendarDays.map((dateKey, idx) => {
                            if (!dateKey) {
                                return <div key={`empty-${idx}`} className="h-24 md:h-28 bg-blue-50/30 rounded-2xl border border-dashed border-blue-100/50" />;
                            }
                            const dayNum = Number(dateKey.slice(-2));
                            const count = (appointmentsByDate.get(dateKey) || []).length;
                            const isSelected = selectedDate === dateKey;
                            
                            // Check if date is today
                            const isToday = new Date().toISOString().split('T')[0] === dateKey;

                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => setSelectedDate(dateKey)}
                                    className={`relative flex flex-col h-24 md:h-28 rounded-2xl border p-3 text-left transition-all duration-300 overflow-hidden group ${
                                        isSelected
                                            ? "border-blue-500 bg-blue-500 shadow-md shadow-blue-500/20 text-white"
                                            : "border-blue-100 bg-white hover:border-blue-300 hover:shadow-sm hover:-translate-y-0.5"
                                    }`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className={`text-sm md:text-base font-black ${isSelected ? "text-white" : "text-slate-700 group-hover:text-blue-700"}`}>
                                            {dayNum}
                                        </span>
                                        {isToday && !isSelected && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                        )}
                                        {isToday && isSelected && (
                                            <span className="w-2 h-2 rounded-full bg-white"></span>
                                        )}
                                    </div>
                                    
                                    <div className="mt-auto w-full">
                                        {count > 0 && (
                                            <div className={`inline-flex items-center w-full justify-center px-2 py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-colors ${
                                                isSelected 
                                                    ? "bg-white/20 text-white backdrop-blur-sm" 
                                                    : "bg-blue-50 text-blue-700 group-hover:bg-blue-100"
                                            }`}>
                                                {count} Appt{count !== 1 ? 's' : ''}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Details View */}
                <div className="bg-white/80 backdrop-blur-xl border border-blue-100/60 rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 flex flex-col h-150 lg:h-auto">
                    <div className="mb-6 pb-4 border-b border-blue-100/60">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            Daily Schedule
                        </h3>
                        <p className="text-sm font-medium text-blue-600 mt-1">
                            {selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "Select a date"}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-blue-600 space-y-3">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                <p className="text-sm font-bold uppercase tracking-widest">Loading...</p>
                            </div>
                        ) : selectedAppointments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-300">
                                    <FaCalendarAlt className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-600">No Appointments</p>
                                    <p className="text-xs text-slate-400 mt-1">Your schedule is clear for this date.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedAppointments.map((a) => {
                                    const apptId = a.id || a.ID || a.bookingId;
                                    return (
                                        <div key={apptId} className="group rounded-2xl border border-blue-100/80 bg-white p-4 hover:shadow-md hover:shadow-blue-500/5 hover:border-blue-300 transition-all duration-300">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <p className="text-sm font-black text-slate-800 flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                        <FaUser className="text-[10px]" />
                                                    </div>
                                                    {a.studentName || "Unknown Student"}
                                                </p>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusBadge(a.status)}`}>
                                                    {a.status || "Pending"}
                                                </span>
                                            </div>
                                            
                                            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                                                <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                                    <span className="text-slate-400">@</span> {a.studentEmail || "No email available"}
                                                </p>
                                                <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                                    <FaClock className="text-blue-400" /> {a.timeSlot || "-"}
                                                </p>
                                            </div>

                                            {(a.counselorCancelNote || a.studentCancelNote) && (
                                                <div className="mt-3 space-y-2">
                                                    {a.counselorCancelNote && (
                                                        <div className="text-[11px] text-rose-700 bg-rose-50/50 border border-rose-100 rounded-xl p-2.5">
                                                            <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5 opacity-70">Counselor Note</span>
                                                            {a.counselorCancelNote}
                                                        </div>
                                                    )}
                                                    {a.studentCancelNote && (
                                                        <div className="text-[11px] text-orange-700 bg-orange-50/50 border border-orange-100 rounded-xl p-2.5">
                                                            <span className="font-bold uppercase tracking-wider text-[9px] block mb-0.5 opacity-70">Student Note</span>
                                                            {a.studentCancelNote}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #dbeafe; /* hover:bg-blue-100 equivalent */
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #bfdbfe; /* hover:bg-blue-200 equivalent */
                }
            `}</style>
        </div>
    );
}

