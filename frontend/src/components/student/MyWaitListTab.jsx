import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserMd } from "react-icons/fa";
import { toast } from "react-toastify";

const DUMMY_WAITLIST = [
    {
        id: 901,
        counselorName: "Dr. Nethmi Perera",
        counsellorId: 1,
        specialization: "Stress Management",
        date: "2026-03-26",
        timeSlot: "09:00 AM - 10:00 AM",
        queuePosition: 2,
        status: "Waiting",
        notifiedAtText: "",
        remainingMinutes: 0,
    },
    {
        id: 902,
        counselorName: "Mr. Dilan Fernando",
        counsellorId: 2,
        specialization: "Academic Support",
        date: "2026-03-26",
        timeSlot: "01:00 PM - 02:00 PM",
        queuePosition: 1,
        status: "Notified",
        notifiedAtText: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        remainingMinutes: 6,
    },
    {
        id: 903,
        counselorName: "Ms. Kavindi Silva",
        counsellorId: 3,
        specialization: "Career Guidance",
        date: "2026-03-27",
        timeSlot: "11:00 AM - 12:00 PM",
        queuePosition: 1,
        status: "Booked",
        notifiedAtText: "",
        remainingMinutes: 0,
    },
];

export default function MyWaitListTab() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leavingId, setLeavingId] = useState(null);
    const [nowMs, setNowMs] = useState(Date.now());
    const navigate = useNavigate();

    const loadWaitlist = async () => {
        setLoading(true);
        try {
            setEntries(DUMMY_WAITLIST);
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
    }, []);

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
        if ((entry.status || "").toLowerCase() === "booked") {
            toast.error("You cannot leave queue for a booked appointment.");
            return;
        }
        try {
            setLeavingId(id);
            setEntries((prev) => prev.filter((e) => (e.id || e.ID) !== id));
            toast.success("You left the queue");
        } catch (err) {
            console.error("Failed to leave queue", err);
            toast.error("Failed to leave queue");
        } finally {
            setLeavingId(null);
        }
    };

    const goBookNow = (entry) => {
        const statusLower = (entry.status || "").toLowerCase();
        if (statusLower !== "notified") {
            toast.error("Book Now is only available for notified entries.");
            return;
        }
        const remainingSeconds = getRemainingSeconds(entry);
        if (remainingSeconds <= 0) {
            toast.error("Your booking window has expired.");
            return;
        }
        const counselorId = entry.counsellorId || entry.counsellorID || "";
        if (!counselorId) {
            toast.error("Counselor details are missing.");
            return;
        }
        toast.success("Redirecting to booking page...");
        navigate(`/book-appointment/${counselorId}`);
    };

    const statusClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "waiting") return "bg-yellow-100 text-yellow-700 border-yellow-200";
        if (s === "notified") return "bg-blue-100 text-blue-700 border-blue-200";
        if (s === "booked") return "bg-green-100 text-green-700 border-green-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    const getRemainingSeconds = (entry) => {
        const statusLower = (entry.status || "").toLowerCase();
        if (statusLower !== "notified") return 0;

        if (entry.notifiedAtText) {
            const notifiedAt = new Date(entry.notifiedAtText).getTime();
            if (Number.isFinite(notifiedAt)) {
                const expiresAt = notifiedAt + 8 * 60 * 1000;
                return Math.max(0, Math.floor((expiresAt - nowMs) / 1000));
            }
        }
        return Math.max(0, Math.floor((entry.remainingMinutes || 0) * 60));
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
                <div className="bg-white border border-slate-100 rounded-3xl p-6 text-sm text-slate-500">No waiting list entries.</div>
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
                                                <FaUserMd /> {entry.specialization || "General Counseling"}
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
                                            Status: {entry.status}
                                        </div>
                                        {isNotified && (
                                            <p className="text-xs font-bold text-blue-700 mt-1">
                                                {canBookNow
                                                    ? `Time left: ${formatMMSS(remainingSeconds)}`
                                                    : "Notification expired"}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => goBookNow(entry)}
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
        </div>
    );
}
