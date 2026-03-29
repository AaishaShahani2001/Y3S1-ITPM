import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaUser } from "react-icons/fa";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toIsoDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const buildDummyAppointments = () => {
    const now = new Date();
    const makeDate = (offsetDays) => {
        const d = new Date(now);
        d.setDate(now.getDate() + offsetDays);
        return toIsoDate(d);
    };

    return [
        {
            id: 701,
            bookingId: "MB-CAL-701",
            studentName: "Liam Santos",
            studentEmail: "liam.santos@student.local",
            date: makeDate(0),
            timeSlot: "09:00 AM - 10:00 AM",
            status: "Confirmed",
            counselorCancelNote: "",
            studentCancelNote: "",
        },
        {
            id: 702,
            bookingId: "MB-CAL-702",
            studentName: "Maya Perera",
            studentEmail: "maya.perera@student.local",
            date: makeDate(0),
            timeSlot: "02:00 PM - 03:00 PM",
            status: "Pending",
            counselorCancelNote: "",
            studentCancelNote: "",
        },
        {
            id: 703,
            bookingId: "MB-CAL-703",
            studentName: "Noah Reyes",
            studentEmail: "noah.reyes@student.local",
            date: makeDate(1),
            timeSlot: "10:30 AM - 11:30 AM",
            status: "Cancelled",
            counselorCancelNote: "Emergency offsite consultation.",
            studentCancelNote: "",
        },
        {
            id: 704,
            bookingId: "MB-CAL-704",
            studentName: "Ava Cruz",
            studentEmail: "ava.cruz@student.local",
            date: makeDate(3),
            timeSlot: "11:00 AM - 12:00 PM",
            status: "Confirmed",
            counselorCancelNote: "",
            studentCancelNote: "Family emergency. Please reschedule.",
        },
        {
            id: 705,
            bookingId: "MB-CAL-705",
            studentName: "Ethan Lim",
            studentEmail: "ethan.lim@student.local",
            date: makeDate(6),
            timeSlot: "01:00 PM - 02:00 PM",
            status: "Completed",
            counselorCancelNote: "",
            studentCancelNote: "",
        },
    ];
};

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

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const dummy = buildDummyAppointments();
            setAppointments(dummy.filter((a) => (a.status || "").toLowerCase() !== "deleted"));
        } catch (err) {
            console.error("Failed to load counselor calendar", err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

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
