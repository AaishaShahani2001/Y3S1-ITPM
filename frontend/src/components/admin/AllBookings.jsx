import React, { useEffect, useMemo, useState } from "react";
import {
    FaTimes,
    FaCalendarAlt,
    FaClock,
    FaUserGraduate,
    FaUserMd,
    FaNotesMedical,
    FaHeartbeat,
    FaExclamationCircle,
    FaCommentAlt,
    FaUserFriends,
    FaClipboardList,
} from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:3000";

const urgencyLabel = (u) => {
    if (u == null || u === "") return "—";
    const n = Number(u);
    if (Number.isNaN(n)) return String(u);
    if (n >= 3) return "High";
    if (n === 2) return "Medium";
    return "Low";
};

const AllBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [viewDetails, setViewDetails] = useState(null);

    const user = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    useEffect(() => {
        const load = async () => {
            if (!user?.token) {
                setBookings([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/admin/appointments`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    toast.error(err.error || "Failed to load bookings");
                    setBookings([]);
                    return;
                }
                const data = await res.json();
                setBookings(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load bookings");
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.token]);

    const filteredBookings = useMemo(() => {
        return bookings.filter((b) => {
            const st = (b.status || "").toLowerCase();
            if (statusFilter !== "all" && st !== statusFilter.toLowerCase()) return false;
            if (dateFilter && (b.date || "") !== dateFilter) return false;
            return true;
        });
    }, [bookings, statusFilter, dateFilter]);

    const formatDate = (iso) => {
        if (!iso) return "—";
        const [y, m, d] = iso.split("-");
        const dt = new Date(Number(y), (Number(m) || 1) - 1, Number(d) || 1);
        return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getStatusBadge = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "confirmed") return "bg-emerald-100 text-emerald-800 ring-emerald-200";
        if (s === "pending") return "bg-amber-100 text-amber-900 ring-amber-200";
        if (s === "completed") return "bg-blue-100 text-blue-800 ring-blue-200";
        if (s === "cancelled") return "bg-rose-100 text-rose-800 ring-rose-200";
        if (s === "deleted") return "bg-slate-200 text-slate-700 ring-slate-300";
        return "bg-gray-100 text-gray-800 ring-gray-200";
    };

    const rowKey = (b) => b.id ?? b.ID ?? b.bookingId;

    const hasAnyCancelContent = (b) =>
        Boolean((b.studentCancelNote || "").trim()) || Boolean((b.counselorCancelNote || "").trim());

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
                <div className="flex flex-wrap gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Deleted">Deleted</option>
                    </select>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                            <th className="px-6 py-4 font-medium">Booking ID</th>
                            <th className="px-6 py-4 font-medium">Student</th>
                            <th className="px-6 py-4 font-medium">Counselor</th>
                            <th className="px-6 py-4 font-medium">Date &amp; Time</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-sm text-gray-500 text-center">
                                    Loading bookings...
                                </td>
                            </tr>
                        ) : filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-sm text-gray-500 text-center">
                                    No bookings match your filters.
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => {
                                const id = rowKey(booking);
                                const cancelHint = hasAnyCancelContent(booking);
                                return (
                                    <tr key={id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {booking.bookingId || id || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{booking.studentName || "—"}</td>
                                        <td className="px-6 py-4 text-gray-700">{booking.counselorName || "—"}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-800">{formatDate(booking.date)}</div>
                                            <div className="text-sm text-gray-500">{booking.timeSlot || "—"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${getStatusBadge(booking.status)}`}
                                            >
                                                {booking.status || "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            <button
                                                type="button"
                                                onClick={() => setViewDetails(booking)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-700 transition hover:bg-indigo-100"
                                            >
                                                View
                                                {cancelHint && (
                                                    <span
                                                        className="rounded-full bg-amber-100 px-1.5 py-0 text-[9px] font-black text-amber-800 ring-1 ring-amber-200"
                                                        title="Includes cancellation notes"
                                                    >
                                                        Notes
                                                    </span>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {viewDetails && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="booking-view-title"
                >
                    <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20">
                        {/* Header */}
                        <div className="relative overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 px-6 py-5 text-white">
                            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/10" />
                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">
                                        Read-only booking
                                    </p>
                                    <h3 id="booking-view-title" className="mt-1 text-xl font-black tracking-tight">
                                        Session details
                                    </h3>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="rounded-lg bg-white/15 px-2.5 py-1 font-mono text-xs font-semibold backdrop-blur-sm">
                                            {viewDetails.bookingId || rowKey(viewDetails) || "—"}
                                        </span>
                                        <span
                                            className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${getStatusBadge(viewDetails.status)} bg-white/95`}
                                        >
                                            {viewDetails.status || "—"}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setViewDetails(null)}
                                    className="rounded-xl bg-white/10 p-2.5 text-white transition hover:bg-white/20"
                                    title="Close"
                                >
                                    <FaTimes className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto p-6">
                            {/* Schedule + people */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                                    <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <FaCalendarAlt className="text-indigo-500" />
                                        Schedule
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-800">
                                            <FaClock className="shrink-0 text-slate-400" />
                                            <span className="font-semibold">{formatDate(viewDetails.date)}</span>
                                        </div>
                                        <div className="pl-7 text-slate-600">{viewDetails.timeSlot || "—"}</div>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                                    <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <FaUserFriends className="text-indigo-500" />
                                        People
                                    </p>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                                <FaUserGraduate />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">Student</p>
                                                <p className="font-semibold text-slate-800">{viewDetails.studentName || "—"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                                                <FaUserMd />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-slate-400">Counselor</p>
                                                <p className="font-semibold text-slate-800">{viewDetails.counselorName || "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical */}
                            <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                                <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <FaClipboardList className="text-indigo-500" />
                                    Clinical snapshot
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                                        <FaHeartbeat className="mt-0.5 text-rose-400" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Mood</p>
                                            <p className="font-medium capitalize text-slate-800">{viewDetails.mood || "—"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                                        <FaExclamationCircle className="mt-0.5 text-amber-500" />
                                        <div>
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Urgency</p>
                                            <p className="font-medium text-slate-800">{urgencyLabel(viewDetails.urgency)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                                        <FaNotesMedical className="text-emerald-500" />
                                        Medical notes
                                    </p>
                                    <div className="rounded-lg border border-slate-100 bg-slate-50/90 p-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                                        {viewDetails.medicalNotes?.trim() ? viewDetails.medicalNotes : (
                                            <span className="text-slate-400 italic">No medical notes provided.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation: show student + counselor blocks whenever that data exists */}
                            {(() => {
                                const st = (viewDetails.status || "").toLowerCase();
                                const studentNote = (viewDetails.studentCancelNote || "").trim();
                                const counselorNote = (viewDetails.counselorCancelNote || "").trim();
                                const showSection =
                                    studentNote || counselorNote || st === "cancelled";
                                if (!showSection) return null;
                                return (
                                    <div className="mt-5 space-y-3">
                                        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <FaCommentAlt className="text-slate-600" />
                                            Cancellation &amp; requests
                                        </p>

                                        {studentNote ? (
                                            <div className="overflow-hidden rounded-xl border border-amber-200/80 bg-linear-to-br from-amber-50 to-orange-50/50 shadow-sm ring-1 ring-amber-100">
                                                <div className="flex flex-wrap items-center gap-2 border-b border-amber-200/60 bg-amber-100/50 px-4 py-2.5">
                                                    <FaUserGraduate className="text-amber-700" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                                                            Student
                                                        </p>
                                                        <p className="text-[11px] font-medium text-amber-900/90">
                                                            Cancellation request or note from the student
                                                        </p>
                                                    </div>
                                                    {st === "confirmed" && (
                                                        <span className="shrink-0 rounded-full bg-amber-200/80 px-2 py-0.5 text-[9px] font-black uppercase text-amber-900">
                                                            Pending action
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="px-4 py-3 text-sm leading-relaxed text-amber-950/90 whitespace-pre-wrap">
                                                    {studentNote}
                                                </p>
                                            </div>
                                        ) : st === "cancelled" ? (
                                            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                                No student cancellation note on this record.
                                            </p>
                                        ) : null}

                                        {counselorNote ? (
                                            <div className="overflow-hidden rounded-xl border border-rose-200/80 bg-linear-to-br from-rose-50 to-red-50/40 shadow-sm ring-1 ring-rose-100">
                                                <div className="flex items-center gap-2 border-b border-rose-200/60 bg-rose-100/50 px-4 py-2.5">
                                                    <FaUserMd className="text-rose-700" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-wider text-rose-800">
                                                            Counselor
                                                        </p>
                                                        <p className="text-[11px] font-medium text-rose-900/90">
                                                            Counselor cancellation message
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="px-4 py-3 text-sm leading-relaxed text-rose-950/90 whitespace-pre-wrap">
                                                    {counselorNote}
                                                </p>
                                            </div>
                                        ) : st === "cancelled" ? (
                                            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                                                No counselor cancellation note on this record.
                                            </p>
                                        ) : null}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-3">
                            <button
                                type="button"
                                onClick={() => setViewDetails(null)}
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllBookings;
