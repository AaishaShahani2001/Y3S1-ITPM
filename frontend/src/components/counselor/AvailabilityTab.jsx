import React, { useState } from "react";
import { FaPlus, FaClock, FaSignOutAlt, FaExclamationCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";

export default function AvailabilityTab() {
    // Dummy frontend data.
    const [slots, setSlots] = useState([
        { id: 1, date: "2026-03-28", startTime: "09:00", endTime: "10:00" },
        { id: 2, date: "2026-03-28", startTime: "11:00", endTime: "12:30" },
        { id: 3, date: "2026-03-29", startTime: "14:00", endTime: "15:30" },
    ]);
    // Add-slot form state (single date with up to 4 time ranges).
    const [newDate, setNewDate] = useState("");
    const [timeSlots, setTimeSlots] = useState([
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" },
        { startTime: "", endTime: "" }
    ]);

    // Edit modal state for an existing slot.
    const [editingSlot, setEditingSlot] = useState(null);
    const [editDate, setEditDate] = useState("");
    const [editStartTime, setEditStartTime] = useState("");
    const [editEndTime, setEditEndTime] = useState("");

    // Inline form error shown in the add-slot card.
    const [error, setError] = useState("");

    // Track expand/collapse for each date group in "Upcoming Slots".
    const [expandedDates, setExpandedDates] = useState({});

    const toggleDate = (date) => {
        setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
    };

    // Group slots by date to render date headers with nested time slots.
    const groupedSlots = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    // Add slots after validating all entered time ranges.
    const handleAddSlot = () => {

        setError("");

        if (!newDate) {
            setError("Please select a date.");
            return;
        }

        const validSlots = timeSlots.filter(s => s.startTime && s.endTime);

        if (validSlots.length === 0) {
            setError("Please fill in at least one time slot.");
            return;
        }

        for (let i = 0; i < validSlots.length; i++) {
            const slot = validSlots[i];
            const startHour = parseInt(slot.startTime.split(":")[0]);
            const startMin = parseInt(slot.startTime.split(":")[1]);

            const endHour = parseInt(slot.endTime.split(":")[0]);
            const endMin = parseInt(slot.endTime.split(":")[1]);

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

            // Prevent more than 4 slots per date.
            const existingSlotsForDate = groupedSlots[newDate] || [];

            if (existingSlotsForDate.length + validSlots.length > 4) {
                toast.error("Maximum 4 slots allowed per date");
                return;
            }
        }

        const newAddedSlots = validSlots.map((slot, index) => ({
            id: Date.now() + index,
            date: newDate,
            startTime: slot.startTime,
            endTime: slot.endTime,
        }));

        if (newAddedSlots.length > 0) {
            setSlots(prev => [...prev, ...newAddedSlots]);
            toast.success(`${newAddedSlots.length} slot(s) added successfully`);
            setNewDate("");
            setTimeSlots([
                { startTime: "", endTime: "" },
                { startTime: "", endTime: "" },
                { startTime: "", endTime: "" },
                { startTime: "", endTime: "" }
            ]);
        }
    };

    // Persist edited values to local state.
    const handleUpdateSlot = () => {
        setSlots(prev =>
            prev.map(slot =>
                slot.id === editingSlot
                    ? { ...slot, date: editDate, startTime: editStartTime, endTime: editEndTime }
                    : slot
            )
        );

        setEditingSlot(null);
        toast.success("Slot updated successfully");
    };

    // Remove a slot from local state after confirmation.
    const handleRemoveSlot = (id) => {

        //  confirm delete (optional but good)
        if (!window.confirm("Delete this slot?")) return;

        setSlots(prev => prev.filter(slot => Number(slot.id) !== Number(id)));
        toast.success("Slot removed");
        console.log("Deleting ID:", id);
    };

    // Hide slots that are effectively in the past (with 30-minute buffer).
    const isFutureSlot = (slot) => {
        const now = new Date();

        const slotStart = new Date(`${slot.date}T${slot.startTime}`);

        // Add 30 minutes buffer
        const bufferTime = new Date(slotStart.getTime() + 30 * 60000);

        return bufferTime > now;
    };

    // Validate edited slot with same business rules used for adding.
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

        return true;
    };


    return (
        <div className="animate-fadeIn space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-800">
                    Availability Settings
                </h2>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left panel: add availability slots */}
                <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col">

                    <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                        <FaPlus className="text-blue-500" /> Add Available Slot
                    </h3>


                    {/* Add-form validation message */}
                    {error && (

                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-start gap-3 border border-red-100">

                            <FaExclamationCircle />

                            <p>{error}</p>

                        </div>
                    )}
                    {/* Date picker (cannot pick past dates). */}
                    <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold"
                    />

                    {/* Up to four time slot rows for the selected date. */}
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

                    {/* Adds all valid rows as new slots. */}
                    <button
                        onClick={handleAddSlot}
                        className="w-full bg-slate-900 text-white py-4 mt-6 rounded-xl font-black"
                    >
                        Authorize Schedule Slot
                    </button>

                </div>

                {/* Inline edit panel for selected slot */}
                {editingSlot && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-200 shadow-md mb-8 relative overflow-hidden">

                        {/* Visual accent line */}
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
                                onClick={() => {
                                    if (validateEditSlot()) {
                                        handleUpdateSlot();
                                    }
                                }}
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


                {/* Right panel: upcoming slots grouped by date */}
                <div className="space-y-4">

                    <h3 className="text-lg font-black mb-4 flex items-center gap-2">

                        <FaClock className="text-blue-500" />

                        Upcoming Slots

                    </h3>

                    {Object.keys(groupedSlots)
                        .filter(date =>
                            groupedSlots[date].some(isFutureSlot) // keep dates that still have valid future slots
                        )
                        .sort((a, b) => new Date(a) - new Date(b))
                        .map((date) => (
                            <div key={date} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
                                {/* Date row with show/hide toggle */}
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

                                {/* Expanded list of slots for this date */}                                {expandedDates[date] && (
                                    <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                                        {groupedSlots[date]
                                            .filter(isFutureSlot) // hide past slots
                                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                            .map(s => (
                                                <div key={`${s.id}-${s.date}-${s.startTime}-${s.endTime}`}
                                                    className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                                                    <p className="font-semibold text-slate-700">
                                                        {s.startTime} - {s.endTime}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <button
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