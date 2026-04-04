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
        if (s === "confirmed") return "bg-blue-100 text-blue-700";
        if (s === "completed") return "bg-green-100 text-green-700";
        if (s === "cancelled") return "bg-orange-100 text-orange-700";
        return "bg-slate-100 text-slate-700";
    };

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <FaCalendarAlt className="text-blue-500" /> Appointment Calendar
                </h2>
                <button
                    onClick={fetchAppointments}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={goPrevMonth}
                            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                        >
                            <FaChevronLeft />
                        </button>
                        <h3 className="font-black text-slate-900">{monthTitle}</h3>
                        <button
                            onClick={goNextMonth}
                            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                        >
                            <FaChevronRight />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekdayLabels.map((d) => (
                            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((dateKey, idx) => {
                            if (!dateKey) {
                                return <div key={`empty-${idx}`} className="h-24 bg-slate-50 rounded-xl border border-slate-100" />;
                            }
                            const dayNum = Number(dateKey.slice(-2));
                            const count = (appointmentsByDate.get(dateKey) || []).length;
                            const isSelected = selectedDate === dateKey;
                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => setSelectedDate(dateKey)}
                                    className={`h-24 rounded-xl border p-2 text-left transition-all ${
                                        isSelected
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-slate-100 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div className="text-sm font-black text-slate-800">{dayNum}</div>
                                    {count > 0 && (
                                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white">
                                            {count} booked
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-5">
                    <h3 className="font-black text-slate-900 mb-1">Booked Details</h3>
                    <p className="text-xs text-slate-500 mb-4">
                        {selectedDate ? new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "No date selected"}
                    </p>

                    {loading ? (
                        <p className="text-sm text-slate-500">Loading...</p>
                    ) : selectedAppointments.length === 0 ? (
                        <p className="text-sm text-slate-500">No booked appointments for this date.</p>
                    ) : (
                        <div className="space-y-3 max-h-115 overflow-auto pr-1">
                            {selectedAppointments.map((a) => {
                                const apptId = a.id || a.ID || a.bookingId;
                                return (
                                    <div key={apptId} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                                                <FaUser className="text-slate-400" /> {a.studentName || "Unknown Student"}
                                            </p>
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusBadge(a.status)}`}>
                                                {a.status || "Pending"}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">{a.studentEmail || "No email available"}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                            <FaClock /> {a.timeSlot || "-"}
                                        </p>
                                        {a.counselorCancelNote && (
                                            <p className="mt-2 text-[11px] text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-2 py-1">
                                                Counselor note: {a.counselorCancelNote}
                                            </p>
                                        )}
                                        {a.studentCancelNote && (
                                            <p className="mt-2 text-[11px] text-red-700 bg-red-50 border border-red-100 rounded-lg px-2 py-1">
                                                Student note: {a.studentCancelNote}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
