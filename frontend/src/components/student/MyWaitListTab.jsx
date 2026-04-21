import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserMd } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmationModel from "../ConfirmationModel";

const API_BASE = "http://localhost:3000";

const displayStatus = (s) => {
    const x = (s || "").toLowerCase();
    if (x === "waiting") return "Waiting";
    if (x === "notified") return "Notified";
    if (x === "fulfilled") return "Booked";
    return s || "—";
};

export default function MyWaitListTab() {
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leavingId, setLeavingId] = useState(null);
    const [nowMs, setNowMs] = useState(Date.now());
    const [bookConfirmEntry, setBookConfirmEntry] = useState(null);

    const user = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const loadWaitlist = async () => {
        if (!user?.token) {
            setEntries([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/appointments/waitlist/student`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                toast.error(err.error || "Failed to load wait list");
                setEntries([]);
                return;
            }
            const data = await res.json();
            setEntries(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load waiting list", err);
            toast.error("Failed to load waiting list");
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWaitlist();
    }, [user?.token]);

    useEffect(() => {
        const interval = setInterval(() => setNowMs(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const leaveQueue = async (entry) => {
        const id = entry.id || entry.ID;
        if (!id) {
            toast.error("Invalid queue entry.");
            return;
        }
        const statusLower = (entry.status || "").toLowerCase();
        if (statusLower === "fulfilled") {
            toast.error("This entry is already completed.");
            return;
        }
        if (!user?.token) return;
        try {
            setLeavingId(id);
            const res = await fetch(`${API_BASE}/api/appointments/waitlist/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast.error(data.error || "Failed to leave queue");
                return;
            }
            setEntries((prev) => prev.filter((e) => (e.id || e.ID) !== id));
            toast.success("You left the queue");
        } catch (err) {
            console.error("Failed to leave queue", err);
            toast.error("Failed to leave queue");
        } finally {
            setLeavingId(null);
        }
    };

    const handleBookNowClick = (entry) => {
        const statusLower = (entry.status || "").toLowerCase();
        if (statusLower !== "notified") {
            toast.error("Book Now is only available after you are notified that a slot opened.");
            return;
        }
        const remainingSeconds = getRemainingSeconds(entry);
        if (remainingSeconds <= 0) {
            toast.error("Your booking window has expired — rejoin the waitlist if needed.");
            return;
        }
        const cid = entry.counsellorId || entry.counsellorID;
        if (!cid) {
            toast.error("Counselor details are missing.");
            return;
        }
        setBookConfirmEntry(entry);
    };

    const handleConfirmBooking = () => {
        if (!bookConfirmEntry) return;
        const cid = bookConfirmEntry.counsellorId || bookConfirmEntry.counsellorID;
        sessionStorage.setItem(
            "mindbridge_waitlist_booking",
            JSON.stringify({
                counsellorId: cid,
                date: bookConfirmEntry.date,
                timeSlot: bookConfirmEntry.timeSlot,
            })
        );
        setBookConfirmEntry(null);
        navigate("/book-appointment");
        toast.info("Complete your details to confirm this session.");
    };

    const handleCloseBookModal = () => {
        setBookConfirmEntry(null);
    };

    const statusClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "waiting") return "bg-yellow-100 text-yellow-700 border-yellow-200";
        if (s === "notified") return "bg-blue-100 text-blue-700 border-blue-200";
        if (s === "fulfilled") return "bg-green-100 text-green-700 border-green-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    const getRemainingSeconds = (entry) => {
        const statusLower = (entry.status || "").toLowerCase();
        if (statusLower !== "notified") return 0;
        const raw = entry.notifiedAt;
        if (raw) {
            const notifiedAt = new Date(raw).getTime();
            if (Number.isFinite(notifiedAt)) {
                const expiresAt = notifiedAt + 8 * 60 * 1000;
                return Math.max(0, Math.floor((expiresAt - nowMs) / 1000));
            }
        }
        return 0;
    };

    const formatMMSS = (seconds) => {
        const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
        const ss = String(seconds % 60).padStart(2, "0");
        return `${mm}:${ss}`;
    };

    const sortedEntries = useMemo(() => {
        return [...entries].sort((a, b) => {
            const aDate = (a.date || "") + (a.timeSlot || "");
            const bDate = (b.date || "") + (b.timeSlot || "");
            return aDate.localeCompare(bDate);
        });
    }, [entries]);

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">My Wait List</h2>
                <button
                    onClick={async () => {
                        await loadWaitlist();
                        toast.success("Wait list refreshed");
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 text-sm text-slate-500">Loading waiting list...</div>
            ) : sortedEntries.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-6 text-sm text-slate-500">
                    No waiting list entries. When a time slot is full during booking, you can join the waitlist — you will be notified when a
                    spot opens.
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedEntries.map((entry) => {
                        const id = entry.id || entry.ID;
                        const statusLower = (entry.status || "").toLowerCase();
                        const isNotified = statusLower === "notified";
                        const remainingSeconds = getRemainingSeconds(entry);
                        const canBookNow = isNotified && remainingSeconds > 0;
                        return (
                            <div key={id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-sm font-black text-slate-900">{entry.counselorName || "Counselor"}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <FaUserMd /> {entry.specialization || "Counseling"}
                                            </p>
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 flex items-center gap-2">
                                            <FaCalendarAlt className="text-slate-400" /> Date: {entry.date}
                                        </p>
                                        <p className="text-xs font-medium text-slate-700 flex items-center gap-2">
                                            <FaClock className="text-slate-400" /> Time: {entry.timeSlot}
                                        </p>
                                        <p className="text-xs font-black text-slate-600 flex items-center gap-2">
                                            <FaMapMarkerAlt className="text-slate-400" /> Position: #{entry.queuePosition || 1} in queue
                                        </p>
                                        <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusClass(entry.status)}`}>
                                            Status: {displayStatus(entry.status)}
                                        </div>
                                        {isNotified && (
                                            <p className="text-xs font-bold text-blue-700 mt-1">
                                                {canBookNow
                                                    ? `Time left to book: ${formatMMSS(remainingSeconds)}`
                                                    : "Booking window expired"}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => handleBookNowClick(entry)}
                                            disabled={!canBookNow}
                                            className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Book Now
                                        </button>
                                        <button
                                            onClick={() => leaveQueue(entry)}
                                            disabled={leavingId === id}
                                            className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {leavingId === id ? "Leaving..." : "Leave Queue"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmationModel
                isOpen={Boolean(bookConfirmEntry)}
                title="Confirm booking"
                message={
                    bookConfirmEntry
                        ? `You will complete booking for ${bookConfirmEntry.counselorName || "your counselor"} on ${bookConfirmEntry.date || "—"} at ${bookConfirmEntry.timeSlot || "—"}.`
                        : ""
                }
                confirmText="Continue"
                cancelText="Cancel"
                onConfirm={handleConfirmBooking}
                onCancel={handleCloseBookModal}
            >
                {bookConfirmEntry && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                        <p className="font-bold text-slate-800">{bookConfirmEntry.specialization || "Counseling"}</p>
                        <p className="mt-1 text-slate-500">Queue position #{bookConfirmEntry.queuePosition || 1}</p>
                    </div>
                )}
            </ConfirmationModel>
        </div>
    );
}
