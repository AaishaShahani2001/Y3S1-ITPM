import React, { useState } from "react";
import { FaPlus, FaClock, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

/** Limits: 4 calendar days total, 4 slots per day. */
const MAX_DISTINCT_DATES = 4;
const MAX_SLOTS_PER_DATE = 4;

/** Normalize to YYYY-MM-DD so picker values always match stored slot dates. */
function normalizeDate(d) {
    if (d == null || d === "") return "";
    const s = String(d).trim();
    return s.length >= 10 ? s.slice(0, 10) : s;
}

/** Matches the “Upcoming Slots” list: excludes past rows so they don’t count toward the 4-date limit. */
function isFutureSlot(slot) {
    const now = new Date();
    const slotStart = new Date(`${normalizeDate(slot.date)}T${slot.startTime}`);
    const bufferTime = new Date(slotStart.getTime() + 30 * 60000);
    return bufferTime > now;
}

/** Demo slots for first paint (dates relative to today so “Upcoming” list works). */
function buildInitialSlots() {
    const d0 = new Date();
    const d1 = new Date(d0);
    d1.setDate(d1.getDate() + 1);
    const d2 = new Date(d0);
    d2.setDate(d2.getDate() + 2);
    const fmt = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };
    return [
        { id: 1, date: normalizeDate(fmt(d0)), startTime: "09:00", endTime: "10:00" },
        { id: 2, date: normalizeDate(fmt(d0)), startTime: "11:00", endTime: "12:30" },
        { id: 3, date: normalizeDate(fmt(d1)), startTime: "14:00", endTime: "15:30" },
    ];
}

export default function AvailabilityTab() {
    // --- Core data: all availability rows live in React state (no API). ---
    const [slots, setSlots] = useState(buildInitialSlots);

    // --- Add form: one date + up to four start/end pairs. ---
    const [newDate, setNewDate] = useState("");
    const [timeSlots, setTimeSlots] = useState([
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" },
    ]);

    // --- Edit panel: which slot id is being edited + field values. ---
    const [editingSlot, setEditingSlot] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editStartTime, setEditStartTime] = useState("");
    const [editEndTime, setEditEndTime] = useState("");

    // --- Inline validation message for the add form. ---
    const [error, setError] = useState("");

    // --- Expand/collapse per date in the upcoming list. ---
    const [expandedDates, setExpandedDates] = useState({});

    const toggleDate = (date) => {
        setExpandedDates((prev) => ({ ...prev, [date]: !prev[date] }));
    };

    // --- Group slots by calendar day (normalized keys). ---
    const groupedSlots = slots.reduce((acc, slot) => {
        const key = normalizeDate(slot.date);
        if (!acc[key]) acc[key] = [];
        acc[key].push(slot);
        return acc;
    }, {});

    // --- Add: validate rules, then append rows with generated ids. ---
    const handleAddSlot = () => {
        setError("");

        if (!newDate) {
            setError("Please select a date.");
            return;
        }

        const validSlots = timeSlots.filter((s) => s.startTime && s.endTime);

        if (validSlots.length === 0) {
            setError("Please fill in at least one time slot.");
            return;
        }

        const newDateKey = normalizeDate(newDate);
        // Count distinct days only among UPCOMING slots (same as the right-hand list). Past-only
        // days stay in state but must not block adding your 4th visible date.
        const distinctUpcomingDateCount = new Set(
            slots.filter(isFutureSlot).map((s) => normalizeDate(s.date)).filter(Boolean)
        ).size;
        const dateAlreadyHasSlots = slots.some((s) => normalizeDate(s.date) === newDateKey);
        if (!dateAlreadyHasSlots && distinctUpcomingDateCount >= MAX_DISTINCT_DATES) {
            setError(
                `You can add up to ${MAX_DISTINCT_DATES} different dates. Remove slots from another date first.`
            );
            return;
        }

        const existingSlotsForDate = groupedSlots[newDateKey] || [];
        if (existingSlotsForDate.length + validSlots.length > MAX_SLOTS_PER_DATE) {
            setError(`You can add up to ${MAX_SLOTS_PER_DATE} time slots per date.`);
            return;
        }

        for (let i = 0; i < validSlots.length; i++) {
            const slot = validSlots[i];
            const startHour = parseInt(slot.startTime.split(":")[0], 10);
            const startMin = parseInt(slot.startTime.split(":")[1], 10);
            const endHour = parseInt(slot.endTime.split(":")[0], 10);
            const endMin = parseInt(slot.endTime.split(":")[1], 10);

            const startTotalMinutes = startHour * 60 + startMin;
            const endTotalMinutes = endHour * 60 + endMin;
            const minimumStartMinutes = 8 * 60;
            const maximumEndMinutes = 17 * 60;

            if (startTotalMinutes < minimumStartMinutes || endTotalMinutes > maximumEndMinutes) {
                setError(`Slot ${i + 1} must be between 08:00 AM and 05:00 PM.`);
                return;
            }

            if (startTotalMinutes >= endTotalMinutes) {
                setError(`For Slot ${i + 1}, start time must be before end time.`);
                return;
            }

            const durationMinutes = endTotalMinutes - startTotalMinutes;
            if (durationMinutes < 60 || durationMinutes > 90) {
                setError(`Duration of Slot ${i + 1} must be between 60 and 90 minutes.`);
                return;
            }
        }

        const newAddedSlots = validSlots.map((slot, index) => ({
            id: Date.now() + index,
            date: newDateKey,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        setSlots((prev) => [...prev, ...newAddedSlots]);
        toast.success(`${newAddedSlots.length} slot(s) added successfully`);
        setNewDate("");
        setTimeSlots([
            { startTime: "", endTime: "" },
            { startTime: "", endTime: "" },
            { startTime: "", endTime: "" },
            { startTime: "", endTime: "" },
        ]);
    };

    // --- Edit: same time window / duration rules as add (client-side). ---
    const validateEditSlot = () => {
        const startHour = parseInt(editStartTime.split(":")[0], 10);
        const startMin = parseInt(editStartTime.split(":")[1], 10);
        const endHour = parseInt(editEndTime.split(":")[0], 10);
        const endMin = parseInt(editEndTime.split(":")[1], 10);
        const startTotalMinutes = startHour * 60 + startMin;
        const endTotalMinutes = endHour * 60 + endMin;
        const minimumStartMinutes = 8 * 60;
        const maximumEndMinutes = 17 * 60;

        if (!editDate || !editStartTime || !editEndTime) {
            toast.error("All edit fields are required");
            return false;
        }

        if (startTotalMinutes < minimumStartMinutes || endTotalMinutes > maximumEndMinutes) {
            toast.error("Edited slot must be between 08:00 AM and 05:00 PM.");
            return false;
        }

        if (startTotalMinutes >= endTotalMinutes) {
            toast.error("Start time must be before end time.");
            return false;
        }

        const durationMinutes = endTotalMinutes - startTotalMinutes;
        if (durationMinutes < 60 || durationMinutes > 90) {
            toast.error("Edited slot duration must be between 60 and 90 minutes.");
            return false;
        }

        if (editDate === new Date().toISOString().split("T")[0]) {
            const now = new Date();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            if (startTotalMinutes <= currentMinutes) {
                toast.error("Past time slots are not allowed for today.");
                return false;
            }
        }

        const otherSlots = slots.filter((s) => s.id !== editingSlot);
        const editDateKey = normalizeDate(editDate);

        // New calendar day: limit by upcoming distinct dates only (consistent with add form).
        const datesOthers = new Set(
            otherSlots.filter(isFutureSlot).map((s) => normalizeDate(s.date)).filter(Boolean)
        );
        if (!datesOthers.has(editDateKey) && datesOthers.size >= MAX_DISTINCT_DATES) {
            toast.error(`You can add up to ${MAX_DISTINCT_DATES} different dates.`);
            return false;
        }

        const slotsOnTargetDate = otherSlots.filter((s) => normalizeDate(s.date) === editDateKey).length;
        if (slotsOnTargetDate >= MAX_SLOTS_PER_DATE) {
            toast.error(`You can add up to ${MAX_SLOTS_PER_DATE} time slots per date.`);
            return false;
        }

        return true;
    };

    const handleUpdateSlot = () => {
        if (!validateEditSlot()) return;
        setSlots((prev) =>
            prev.map((slot) =>
                slot.id === editingSlot
                    ? { ...slot, date: normalizeDate(editDate), startTime: editStartTime, endTime: editEndTime }
                    : slot
            )
        );
        setEditingSlot(null);
        toast.success("Slot updated successfully");
    };

    // --- Delete: confirm, then filter out by id. ---
    const handleRemoveSlot = (id) => {
        if (!window.confirm("Delete this slot?")) return;
        setSlots((prev) => prev.filter((slot) => Number(slot.id) !== Number(id)));
        toast.success("Slot removed");
    };

    return (
        <div className="animate-fadeIn space-y-8">
            {/* Page title only  */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-800">Availability Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ---------- Left: add availability slots ---------- */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-black mb-2 flex items-center gap-2">
                        <FaPlus className="text-blue-500" /> Add Available Slot
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 mb-6 uppercase tracking-wide">
                        Up to 4 dates total · up to 4 time slots per date
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-start gap-3 border border-red-100">
                            <FaExclamationCircle />
                            <p>{error}</p>
                        </div>
                    )}

                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold"
                    />

                    <div className="space-y-4 mt-4">
                        {timeSlots.map((slot, index) => (
                            <div key={index} className="flex gap-4 items-center">
                                <span className="font-bold text-sm text-slate-500 whitespace-nowrap">Slot {index + 1}</span>
                                <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => {
                                        const newSlots = [...timeSlots];
                                        newSlots[index].startTime = e.target.value;
                                        setTimeSlots(newSlots);
                                    }}
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold"
                                />
                                <span className="font-bold text-slate-400">-</span>
                                <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => {
                                        const newSlots = [...timeSlots];
                                        newSlots[index].endTime = e.target.value;
                                        setTimeSlots(newSlots);
                                    }}
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleAddSlot}
                        className="w-full bg-slate-900 text-white py-4 mt-6 rounded-xl font-black"
                    >
                        Authorize Schedule Slot
                    </button>
                </div>

                {/* ---------- Right column: edit panel (when active) + upcoming list ---------- */}
                <div className="space-y-4">
                    {editingSlot && (
                        <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-200 shadow-md mb-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-indigo-500" />

                            <h4 className="font-black text-lg mb-5 flex items-center gap-2 text-slate-800">
                                <FaClock className="text-indigo-500" /> Edit Schedule Slot
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Date</label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 border border-slate-200 rounded-xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Start Time</label>
                                    <input
                                        type="time"
                                        value={editStartTime}
                                        onChange={(e) => setEditStartTime(e.target.value)}
                                        className="p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 border border-slate-200 rounded-xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">End Time</label>
                                    <input
                                        type="time"
                                        value={editEndTime}
                                        onChange={(e) => setEditEndTime(e.target.value)}
                                        className="p-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 border border-slate-200 rounded-xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleUpdateSlot}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditingSlot(null)}
                                    className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ---------- Upcoming slots grouped by date ---------- */}
                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                        <FaClock className="text-blue-500" />
                        Upcoming Slots
                    </h3>

                    {Object.keys(groupedSlots)
                        .filter((date) => groupedSlots[date].some(isFutureSlot))
                        .sort((a, b) => new Date(a) - new Date(b))
                        .map((date) => (
                            <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                                <div
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleDate(date)}
                                >
                                    <p className="font-bold text-lg">{new Date(date).toLocaleDateString()}</p>
                                    <button type="button" className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        {expandedDates[date] ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>

                                {expandedDates[date] && (
                                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                                        {groupedSlots[date]
                                            .filter(isFutureSlot)
                                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                            .map((s) => (
                                                <div
                                                    key={`${s.id}-${s.date}-${s.startTime}-${s.endTime}`}
                                                    className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm"
                                                >
                                                    <p className="font-semibold text-slate-700">
                                                        {s.startTime} - {s.endTime}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingSlot(s.id);
                                                                setEditDate(s.date);
                                                                setEditStartTime(s.startTime);
                                                                setEditEndTime(s.endTime);
                                                            }}
                                                            className="px-3 py-1 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveSlot(s.id);
                                                            }}
                                                            className="px-3 py-1 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}