import React, { useState, useEffect } from "react";
import { FaPlus, FaClock, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AvailabilityTab() {

    // Logged user payload is saved in localStorage after auth.
    const user = JSON.parse(localStorage.getItem("user"));
    const API_BASE = "http://localhost:3000";

    // Raw availability slots returned by /api/counsellor/availability/:id
    const [slots, setSlots] = useState([]);
    // A fast lookup set: "YYYY-MM-DD|HH:mm" for booked appointment starts.
    // Using Set gives O(1) checks while rendering each slot row.
    const [bookedSlotKeys, setBookedSlotKeys] = useState(new Set());


    // Add form state (date + up to 4 candidate slot rows).
    const [newDate, setNewDate] = useState("");
    const [timeSlots, setTimeSlots] = useState([
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" }
    ]);

    // Edit modal state: selected slot id + editable fields.
    const [editingSlot, setEditingSlot] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editStartTime, setEditStartTime] = useState("");
    const [editEndTime, setEditEndTime] = useState("");

    // User-facing validation text for add form.
    const [error, setError] = useState("");

    // Controls expand/collapse per date group in upcoming slot list.
    // Shape: { "2026-04-26": true, "2026-04-27": false, ... }
    const [expandedDates, setExpandedDates] = useState({});

    // Delete confirmation modal state.
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // UI filters to quickly focus slot management by booking state.
    const [slotViewFilter, setSlotViewFilter] = useState("all"); // all | available | booked
    const [hideFullyBookedDates, setHideFullyBookedDates] = useState(false);

    // Toggle a date card between expanded and collapsed states.
    const toggleDate = (date) => {
        setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
    };

    // Group all availability rows by date for easy section rendering.
    // Result: { [date]: CounsellorAvailability[] }
    const groupedSlots = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    const distinctDates = Object.keys(groupedSlots);


    // Load counselor availability rows from backend.
    // This list is the base source for date/slot UI.
    const loadSlots = async () => {

        try {

            const res = await fetch(
                `${API_BASE}/api/counsellor/availability/${user.id}`
            );

            const data = await res.json();

            // Keep raw rows as-is and derive grouped/booked views in render/helpers.
            setSlots(data);

        } catch (err) {

            console.error("Failed to load slots", err);
        }
    };

    // Normalize all times to "HH:mm" so appointment and availability
    // values can be matched even if backend returns mixed formats.
    // Supported inputs:
    // - "09:30", "09:30:00"
    // - "9:30 AM", "03:15 PM"
    const normalizeTimeTo24Hour = (timeValue) => {
        const value = String(timeValue || "").trim();
        if (!value) return "";

        const hhmmssMatch = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
        if (hhmmssMatch) {
            return `${hhmmssMatch[1]}:${hhmmssMatch[2]}`;
        }

        const amPmMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!amPmMatch) return "";

        let hour = Number(amPmMatch[1]);
        const minute = amPmMatch[2];
        const period = amPmMatch[3].toUpperCase();

        if (period === "AM" && hour === 12) hour = 0;
        if (period === "PM" && hour !== 12) hour += 12;

        return `${String(hour).padStart(2, "0")}:${minute}`;
    };

    // Build booked slot index from counselor appointments.
    // A slot is treated as booked when an appointment is Pending/Confirmed.
    const loadBookedSlots = async () => {
        if (!user?.token) {
            // No token means no protected call; fallback to empty booked set.
            setBookedSlotKeys(new Set());
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/appointments/counselor`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            if (!res.ok) {
                // Keep UI usable even if appointment API fails.
                setBookedSlotKeys(new Set());
                return;
            }

            const data = await res.json();
            const appointments = Array.isArray(data) ? data : [];

            const bookedKeys = new Set(
                appointments
                    // Only states that occupy the slot are considered booked.
                    .filter((a) => {
                        const status = (a?.status || "").toLowerCase();
                        return status === "pending" || status === "confirmed";
                    })
                    .map((a) => {
                        // Match by appointment date + normalized timeslot start.
                        const normalized = normalizeTimeTo24Hour(a?.timeSlot);
                        if (!a?.date || !normalized) return null;
                        return `${a.date}|${normalized}`;
                    })
                    .filter(Boolean)
            );

            setBookedSlotKeys(bookedKeys);
        } catch (err) {
            console.error("Failed to load booked slots", err);
            setBookedSlotKeys(new Set());
        }
    };


    // Initial load when tab mounts.
    // 1) availability rows
    // 2) appointment-based booked index
    useEffect(() => {

        loadSlots();
        loadBookedSlots();

    }, []);


    // ADD SLOT:
    // - validates input rows
    // - enforces business rules (time range, duration, max per date)
    // - creates each valid row in backend
    const handleAddSlot = async () => {

        setError("");

        if (!newDate) {
            setError("Please select a date.");
            return;
        }

        // Keep only rows where both start and end are provided.
        const validSlots = timeSlots.filter(s => s.startTime && s.endTime);

        if (validSlots.length === 0) {
            setError("Please fill in at least one time slot.");
            return;
        }

        for (let i = 0; i < validSlots.length; i++) {
            const slot = validSlots[i];
            // Convert HH:mm to total minutes for reliable numeric comparisons.
            const startHour = parseInt(slot.startTime.split(":")[0]);
            const startMin = parseInt(slot.startTime.split(":")[1]);

            const endHour = parseInt(slot.endTime.split(":")[0]);
            const endMin = parseInt(slot.endTime.split(":")[1]);

            const startTotalMinutes = startHour * 60 + startMin;
            const endTotalMinutes = endHour * 60 + endMin;

            const minimumStartMinutes = 8 * 60;
            const maximumEndMinutes = 17 * 60;

            // Allowed working window: 08:00 to 17:00.
            if (startTotalMinutes < minimumStartMinutes || endTotalMinutes > maximumEndMinutes) {
                setError(`Slot ${i + 1} must be between 08:00 AM and 05:00 PM.`);
                return;
            }

            // Start must be earlier than end.
            if (startTotalMinutes >= endTotalMinutes) {
                setError(`For Slot ${i + 1}, start time must be before end time.`);
                return;
            }

            // Slot duration must be between 60 and 90 minutes.
            const durationMinutes = endTotalMinutes - startTotalMinutes;

            if (durationMinutes < 60 || durationMinutes > 90) {
                setError(`Duration of Slot ${i + 1} must be between 60 and 90 minutes.`);
                return;
            }

            // Prevent more than 4 availability rows on the selected date.
            const existingSlotsForDate = groupedSlots[newDate] || [];

            if (existingSlotsForDate.length + validSlots.length > 4) {
                toast.error("Maximum 4 slots allowed per date");
                return;
            }
        }

        try {
            const newAddedSlots = [];
            // Create each valid slot separately; if one fails we stop.
            for (const slot of validSlots) {
                const res = await fetch(
                    `http://localhost:3000/api/counsellor/availability`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            counsellorId: user.id,
                            date: newDate,
                            startTime: slot.startTime,
                            endTime: slot.endTime
                        })
                    }
                );

                if (!res.ok) {
                    const errData = await res.json();
                    toast.error(errData.error || "Failed to add slot");
                    return; //  STOP execution immediately
                }

                const data = await res.json();
                newAddedSlots.push(data);
            }

            if (newAddedSlots.length > 0) {
                // Append server-created rows to local state (keeps existing rows).
                setSlots(prev => [...prev, ...newAddedSlots]);
                toast.success(`${newAddedSlots.length} slot(s) added successfully`);
                // Reset form to fresh 4-row template.
                setNewDate("");
                setTimeSlots([
                    { startTime: "", endTime: "" },
                    { startTime: "", endTime: "" },
                    { startTime: "", endTime: "" },
                    { startTime: "", endTime: "" }
                ]);
            }
        } catch (err) {
            console.error("Failed to add slots", err);
            setError("An error occurred while adding slots.");
        }
    };

    // EDIT SLOT:
    // Sends updated date/start/end for currently selected slot id.
    const handleUpdateSlot = async () => {
        try {
            const res = await fetch(
                `http://localhost:3000/api/counsellor/availability/${editingSlot}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        date: editDate,
                        startTime: editStartTime,
                        endTime: editEndTime
                    })
                }
            );

            const data = await res.json();

            // If backend validation fails, keep edit panel open for correction.
            if (!res.ok) {
                toast.error(data.error || "Update failed");
                return;
            }

            // Replace only edited row; functional update avoids stale closure issues.
            setSlots(prev =>
                prev.map(slot =>
                    slot.id === editingSlot ? data : slot
                )
            );

            setEditingSlot(null);
            toast.success("Slot updated successfully");

        } catch (err) {
            console.error("Update failed", err);
            toast.error("Something went wrong");
        }
    };


    const slotPendingDelete =
        deleteConfirmId != null
            ? slots.find((s) => Number(s.id) === Number(deleteConfirmId))
            : null;

    // REMOVE SLOT:
    // Executes only after user confirms in modal.
    const handleConfirmRemoveSlot = async () => {
        if (deleteConfirmId == null) return;

        const id = deleteConfirmId;
        setIsDeleting(true);

        try {
            const res = await fetch(
                `http://localhost:3000/api/counsellor/availability/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Delete failed");
                return;
            }

            // Remove deleted row from in-memory list.
            setSlots((prev) =>
                prev.filter((slot) => Number(slot.id) !== Number(id))
            );

            setDeleteConfirmId(null);
            toast.success("Slot removed");
        } catch (err) {
            console.error("Failed to delete slot", err);
            toast.error("Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    };

    // Show only future/upcoming slots.
    // 30-minute buffer hides slots that are very near/past current time.
    const isFutureSlot = (slot) => {
        const now = new Date();

        const slotStart = new Date(`${slot.date}T${slot.startTime}`);

        // Add 30-minute grace offset before comparing with "now".
        const bufferTime = new Date(slotStart.getTime() + 30 * 60000);

        return bufferTime > now;
    };

    // A slot is "booked" if:
    // 1) availability row already has status=booked, OR
    // 2) matching appointment exists in bookedSlotKeys index.
    const isBookedSlot = (slot) => {
        const statusBooked = (slot?.status || "").toLowerCase() === "booked";
        const key = `${slot?.date}|${normalizeTimeTo24Hour(slot?.startTime)}`;
        return statusBooked || bookedSlotKeys.has(key);
    };

    const upcomingSlots = slots.filter(isFutureSlot);
    const bookedUpcomingCount = upcomingSlots.filter(isBookedSlot).length;
    const availableUpcomingCount = Math.max(upcomingSlots.length - bookedUpcomingCount, 0);
    const utilizationPct =
        upcomingSlots.length > 0
            ? Math.round((bookedUpcomingCount / upcomingSlots.length) * 100)
            : 0;

    const slotMatchesFilter = (slot) => {
        const booked = isBookedSlot(slot);
        if (slotViewFilter === "booked") return booked;
        if (slotViewFilter === "available") return !booked;
        return true;
    };

    const focusNextDate = () => {
        const nextDate = Object.keys(groupedSlots)
            .filter((date) => groupedSlots[date].some((s) => isFutureSlot(s) && slotMatchesFilter(s)))
            .sort((a, b) => new Date(a) - new Date(b))[0];

        if (!nextDate) return;
        setExpandedDates((prev) => ({ ...prev, [nextDate]: true }));
    };


    return (
        <div className="animate-fadeIn space-y-8">

            <h2 className="text-2xl font-black tracking-tight text-slate-800">
                Availability Settings
            </h2>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                {/* ADD SLOT FORM */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">

                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <FaPlus className="text-blue-500" /> Add Available Slot
                    </h3>


                    {/* Error message */}
                    {error && (

                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-start gap-3 border border-red-100">

                            <FaExclamationCircle />

                            <p>{error}</p>

                        </div>
                    )}



                    {/* Date */}
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold"
                    />


                    {/* Time Slots */}
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


                    {/* Submit button */}
                    <button
                        onClick={handleAddSlot}
                        className="w-full bg-slate-900 text-white py-4 mt-6 rounded-xl font-black"
                    >
                        Authorize Schedule Slot
                    </button>

                </div>

                {/* Edit Form UI */}
                {editingSlot && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-200 shadow-md mb-8 relative overflow-hidden">

                        {/* Decorative Top Line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-400 to-indigo-500"></div>

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


                {/* SLOT LIST */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Upcoming Slots</p>
                            <p className="text-2xl font-black text-slate-800 mt-1">{upcomingSlots.length}</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Booked</p>
                            <p className="text-2xl font-black text-amber-700 mt-1">{bookedUpcomingCount}</p>
                        </div>
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Available</p>
                            <p className="text-2xl font-black text-emerald-700 mt-1">{availableUpcomingCount}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black text-slate-700">Schedule Utilization</p>
                                <p className="text-xs text-slate-500">{utilizationPct}% of upcoming slots are already booked</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSlotViewFilter("all")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${slotViewFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                >
                                    All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSlotViewFilter("available")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${slotViewFilter === "available" ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                >
                                    Available
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSlotViewFilter("booked")}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${slotViewFilter === "booked" ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                >
                                    Booked
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setHideFullyBookedDates((prev) => !prev)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${hideFullyBookedDates ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                >
                                    {hideFullyBookedDates ? "Showing Open Dates" : "Hide Full Dates"}
                                </button>
                                <button
                                    type="button"
                                    onClick={focusNextDate}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
                                >
                                    Focus Next Date
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 transition-all"
                                style={{ width: `${utilizationPct}%` }}
                            />
                        </div>
                    </div>

                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">

                        <FaClock className="text-blue-500" />

                        Upcoming Slots

                    </h3>

                    {Object.keys(groupedSlots)
                        .filter(date =>
                            groupedSlots[date].some((s) => isFutureSlot(s) && slotMatchesFilter(s)) // only keep visible future slots
                        )
                        .filter((date) => {
                            if (!hideFullyBookedDates) return true;
                            const futureForDate = groupedSlots[date].filter(isFutureSlot);
                            if (futureForDate.length === 0) return false;
                            return futureForDate.some((s) => !isBookedSlot(s));
                        })
                        .sort((a, b) => new Date(a) - new Date(b))
                        .map((date) => (
                            <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                                {/* Date Header */}
                                <div
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleDate(date)}
                                >
                                    <p className="font-bold text-lg">
                                        {new Date(date).toLocaleDateString()}
                                    </p>
                                    <button className="text-slate-400 hover:text-blue-500 focus:outline-none">
                                        {expandedDates[date] ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>

                                {/* Expanded Slots */}
                                {expandedDates[date] && (
                                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                                        {groupedSlots[date]
                                            .filter(isFutureSlot) // hide past slots
                                            .filter(slotMatchesFilter)
                                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                            .map(s => (
                                                <div key={`${s.id}-${s.date}-${s.startTime}-${s.endTime}`}
                                                    className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-semibold text-slate-700">
                                                            {s.startTime} - {s.endTime}
                                                        </p>
                                                        {isBookedSlot(s) && (
                                                            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-amber-700 bg-amber-100 rounded-full border border-amber-200">
                                                                Booked
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            disabled={isBookedSlot(s)}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isBookedSlot(s)) return;
                                                                setEditingSlot(s.id);
                                                                setEditDate(s.date);
                                                                setEditStartTime(s.startTime);
                                                                setEditEndTime(s.endTime);
                                                            }}
                                                            className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${isBookedSlot(s)
                                                                ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                                                : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                                                }`}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isBookedSlot(s)}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isBookedSlot(s)) return;
                                                                setDeleteConfirmId(s.id);
                                                            }}
                                                            className={`px-3 py-1 text-sm font-bold rounded-lg transition-colors ${isBookedSlot(s)
                                                                ? "text-slate-400 bg-slate-100 cursor-not-allowed"
                                                                : "text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"
                                                                }`}
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

            {deleteConfirmId != null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="delete-slot-title"
                    onClick={() => !isDeleting && setDeleteConfirmId(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            id="delete-slot-title"
                            className="text-lg font-black text-slate-800"
                        >
                            Remove this slot?
                        </h3>
                        {slotPendingDelete && (
                            <p className="text-sm text-slate-600">
                                {new Date(slotPendingDelete.date).toLocaleDateString()}{" "}
                                · {slotPendingDelete.startTime} –{" "}
                                {slotPendingDelete.endTime}
                            </p>
                        )}
                        <p className="text-sm text-slate-500">
                            This slot will no longer be available for booking.
                        </p>
                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-5 py-2.5 rounded-xl font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleConfirmRemoveSlot}
                                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isDeleting ? "Removing…" : "Remove slot"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}