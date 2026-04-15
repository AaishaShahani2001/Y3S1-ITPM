import React, { useEffect, useMemo, useState } from "react";
import { FaExclamationCircle, FaFrown, FaCheckCircle, FaCalendarAlt, FaEye, FaTimes, FaFlag, FaMapPin } from "react-icons/fa";
import { toast } from "react-toastify";
import ApproveModel from "../ApproveModel";
import ConfirmationModel from "../ConfirmationModel";

export default function AppointmentsTab() {
    // Top-level filters and UI states.
    const [activeTab, setActiveTab] = useState("pending");
    const [dateFilter, setDateFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [approveModalAppt, setApproveModalAppt] = useState(null);
    const [approvedCancellationIds, setApprovedCancellationIds] = useState([]);
    const [cancelModalAppt, setCancelModalAppt] = useState(null);
    const [cancelNote, setCancelNote] = useState("");
    const [assignedWorkplace, setAssignedWorkplace] = useState("");
    const [assignedLocationNote, setAssignedLocationNote] = useState("");
    const [locationLoading, setLocationLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));

    // Load counselor appointments + assigned location (appointments include assignLocation from join; /location/me is fallback).
    const fetchAppointments = async () => {
        if (!user?.token) {
            setAppointments([]);
            setAssignedWorkplace("");
            setAssignedLocationNote("");
            setLoading(false);
            setLocationLoading(false);
            return;
        }
        setLoading(true);
        setLocationLoading(true);
        try {
            const [apptRes, locRes] = await Promise.all([
                fetch("http://localhost:3000/api/appointments/counselor", {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
                fetch("http://localhost:3000/api/counsellor/location/me", {
                    headers: { Authorization: `Bearer ${user.token}` },
                }),
            ]);

            let list = [];
            if (apptRes.ok) {
                const data = await apptRes.json();
                list = Array.isArray(data) ? data : [];
                setAppointments(list);
            } else {
                setAppointments([]);
                toast.error("Failed to load appointments");
            }

            let wMe = "";
            let nMe = "";
            if (locRes.ok) {
                const loc = await locRes.json();
                wMe = String(loc.workplace ?? loc.assignLocation ?? "").trim();
                nMe = String(loc.locationReason ?? loc.locationNote ?? "").trim();
            }
            const first = list[0];
            const wAppt = first ? String(first.assignLocation ?? "").trim() : "";
            const nAppt = first ? String(first.locationNote ?? "").trim() : "";
            // Prefer /location/me, then values joined on appointment rows (same data if Scan works).
            setAssignedWorkplace(wMe || wAppt || "Not Assigned");
            setAssignedLocationNote(nMe || nAppt);
        } catch (err) {
            console.error("Failed to fetch appointments", err);
            toast.error("Failed to load appointments");
            setAppointments([]);
            setAssignedWorkplace("Not Assigned");
            setAssignedLocationNote("");
        } finally {
            setLoading(false);
            setLocationLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [user?.token]);

    // Generic status update request helper.
    const updateAppointmentStatus = async (appointmentId, status) => {
        const res = await fetch(`http://localhost:3000/api/appointments/${appointmentId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ status }),
        });
        return res;
    };

    // Handles status flow: Pending -> Confirmed -> Completed.
    const handleStatusUpdate = async (appointment) => {
        const current = appointment.status || "";
        if (!user?.token || current === "Completed") return;
        const appointmentId = appointment.id || appointment.ID;
        const nextStatus = current === "Pending" ? "Confirmed" : current === "Confirmed" ? "Completed" : "";
        if (!nextStatus) return;

        try {
            setUpdatingId(appointmentId);

            if (nextStatus === "Completed") {
                const ok = window.confirm("Mark this appointment as completed?");
                if (!ok) return;
            }

            const res = await updateAppointmentStatus(appointmentId, nextStatus);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || `Failed to mark as ${nextStatus.toLowerCase()}`);
                return;
            }

            toast.success(
                nextStatus === "Confirmed"
                    ? "Appointment marked as confirmed"
                    : "Appointment marked as completed"
            );
            await fetchAppointments();
        } catch (err) {
            console.error("Failed to update appointment status", err);
            toast.error("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleApproveCancellation = async (appointment) => {
        const appointmentId = appointment.id || appointment.ID;
        if (!appointmentId || !user?.token) return;

        try {
            setUpdatingId(appointmentId);
            const res = await fetch(`http://localhost:3000/api/appointments/${appointmentId}/cancellation/approve`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || "Failed to approve cancellation");
                return;
            }
            toast.success("Cancellation approved and slot released");
            setApprovedCancellationIds((prev) => (prev.includes(appointmentId) ? prev : [...prev, appointmentId]));
            setApproveModalAppt(null);
        } catch (err) {
            console.error("Failed to approve cancellation", err);
            toast.error("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleCancelByCounselor = async () => {
        if (!cancelModalAppt) return;
        const appointmentId = cancelModalAppt.id || cancelModalAppt.ID;
        if (!appointmentId || !user?.token) return;
        if (!cancelNote.trim()) {
            toast.error("Please add a cancellation note");
            return;
        }
        try {
            setUpdatingId(appointmentId);
            const res = await fetch(`http://localhost:3000/api/appointments/${appointmentId}/counselor-cancel`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ note: cancelNote.trim() }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || "Failed to cancel appointment");
                return;
            }
            toast.success("Appointment cancelled with note");
            setCancelModalAppt(null);
            setCancelNote("");
            await fetchAppointments();
            if (selectedAppt && (selectedAppt.id || selectedAppt.ID) === appointmentId) {
                setSelectedAppt({ ...selectedAppt, status: "Cancelled", counselorCancelNote: cancelNote.trim() });
            }
        } catch (err) {
            console.error("Failed to cancel appointment", err);
            toast.error("Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    };

    // Converts YYYY-MM-DD to readable label.
    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        const [y, m, d] = isoDate.split("-");
        const date = new Date(y, (m || 1) - 1, d || 1);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getReportUrl = (reportPath) => {
        if (!reportPath) return "";
        if (/^https?:\/\//i.test(reportPath)) return reportPath;
        const normalizedPath = reportPath.startsWith("/") ? reportPath : `/${reportPath}`;
        return `${window.location.origin}${normalizedPath}`;
    };

    // Maps numeric urgency to UI label.
    const getUrgencyLabel = (urgency) => {
        if (urgency <= 3) return "Normal";
        if (urgency <= 6) return "Medium";
        return "High Priority";
    };

    // Displays a quick mood indicator icon.
    const getMoodIcon = (mood) => {
        const m = (mood || "").toLowerCase();
        if (m.includes("stress") || m.includes("anxious")) return <FaExclamationCircle className="text-orange-500" />;
        if (m.includes("sad") || m.includes("depress")) return <FaFrown className="text-blue-500" />;
        return <FaExclamationCircle className="text-slate-500" />;
    };

    // Today's date in YYYY-MM-DD for comparisons.
    const todayStr = useMemo(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    // For confirmed appointments, completion is allowed only on/after booked date.
    const canCompleteByDate = (appointmentDate) => (appointmentDate || "") <= todayStr;

    const getStudentHistory = (appointment) => {
        if (!appointment) return [];
        const selectedId = appointment.id || appointment.ID;
        const selectedStudentId = appointment.studentId || appointment.studentID || appointment.StudentID;
        const selectedStudentEmail = (appointment.studentEmail || "").toLowerCase();

        const sameStudent = appointments.filter((a) => {
            const rowStudentId = a.studentId || a.studentID || a.StudentID;
            const rowStudentEmail = (a.studentEmail || "").toLowerCase();
            if (selectedStudentId && rowStudentId) return Number(selectedStudentId) === Number(rowStudentId);
            if (selectedStudentEmail && rowStudentEmail) return selectedStudentEmail === rowStudentEmail;
            return false;
        });

        return sameStudent
            .filter((a) => (a.id || a.ID) !== selectedId)
            .sort((a, b) => {
                const aKey = `${a.date || ""} ${a.timeSlot || ""}`;
                const bKey = `${b.date || ""} ${b.timeSlot || ""}`;
                return bKey.localeCompare(aKey);
            })
            .slice(0, 5);
    };

    // Applies tab/date/priority filters and hides past appointments.
    const filteredAppointments = useMemo(() => {
        return appointments
            // Safety guard: never show student-deleted appointments.
            .filter((a) => (a.status || "").toLowerCase() !== "deleted")
            // In Confirmed tab, also keep approved cancellations visible.
            .filter((a) => {
                const statusLower = (a.status || "").toLowerCase();
                if (activeTab === "confirmed") return statusLower === "confirmed" || statusLower === "cancelled";
                return statusLower === activeTab;
            })
            // Hide past appointments globally
            .filter((a) => (a.date || "") >= todayStr)
            // Date filter: today/upcoming
            .filter((a) => {
                if (dateFilter === "today") return a.date === todayStr;
                if (dateFilter === "upcoming") return (a.date || "") > todayStr;
                return true;
            })
            // Priority filter
            .filter((a) => {
                if (priorityFilter === "high") return getUrgencyLabel(a.urgency) === "High Priority";
                return true;
            });
    }, [appointments, activeTab, todayStr, dateFilter, priorityFilter]);

    const studentHistory = useMemo(
        () => getStudentHistory(selectedAppt),
        [selectedAppt, appointments]
    );

    return (
        <div className="animate-fadeIn space-y-8">
            {/* Counselor assigned location + admin note (from API) */}
            <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-slate-50 p-5 shadow-sm md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                            <FaMapPin className="text-xl" aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                Assigned location
                            </p>
                            <p className="mt-1 wrap-break-words text-lg font-black tracking-tight text-slate-900">
                                {locationLoading ? "…" : assignedWorkplace || "Not Assigned"}
                            </p>
                            <p className="mt-2 text-xs font-medium text-slate-500">
                                Sessions default to this room unless an appointment specifies otherwise below.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 rounded-xl border border-slate-100 bg-white/90 p-4 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
                        {locationLoading
                            ? "…"
                            : assignedLocationNote ||
                              "No admin note for your location yet. Contact admin if you need a room change."}
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight">Appointments Queue</h2>
                <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                    <TabButton label="Pending" active={activeTab} set={setActiveTab} id="pending" />
                    <TabButton label="Confirmed" active={activeTab} set={setActiveTab} id="confirmed" />
                    <TabButton label="Completed" active={activeTab} set={setActiveTab} id="completed" />
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <FilterButton label="All Dates" active={dateFilter === "all"} onClick={() => setDateFilter("all")} />
                <FilterButton label="Today" active={dateFilter === "today"} onClick={() => setDateFilter("today")} />
                <FilterButton label="Upcoming" active={dateFilter === "upcoming"} onClick={() => setDateFilter("upcoming")} />
                <FilterButton label="High Priority" active={priorityFilter === "high"} onClick={() => setPriorityFilter((p) => (p === "high" ? "all" : "high"))} />
            </div>

            {loading ? (
                <p className="text-sm text-slate-500 text-center py-8">Loading appointments...</p>
            ) : filteredAppointments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No {activeTab} appointments</p>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {filteredAppointments.map((a) => {
                        const apptId = a.id || a.ID;
                        const isCancellationApproved = approvedCancellationIds.includes(apptId);
                        const canMarkComplete = (a.status || "").toLowerCase() !== "completed";
                        const statusLower = (a.status || "").toLowerCase();
                        const actionLabel = statusLower === "pending"
                            ? "Mark as Confirmed"
                            : statusLower === "confirmed"
                                ? "Mark as Complete"
                                : "";
                        const isCompletionDisabledByDate = statusLower === "confirmed" && !canCompleteByDate(a.date);
                        const isActionDisabled =
                            updatingId === apptId ||
                            !canMarkComplete ||
                            !actionLabel ||
                            isCompletionDisabledByDate;

                        const isHighPriority = getUrgencyLabel(a.urgency) === "High Priority";

                        return (
                            <div
                                key={apptId || a.bookingId}
                                className={`bg-white p-6 rounded-2xl border ${isHighPriority ? 'border-red-200 shadow-red-50' : 'border-slate-100'} shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden`}
                            >
                                {isHighPriority && (
                                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden z-20">
                                        <div className="absolute top-0 right-0 bg-red-500 text-white w-24 px-1 py-1 text-center transform rotate-45 translate-x-7 translate-y-2 flex items-center justify-center gap-1 shadow-md">
                                            <FaFlag className="text-[10px]" />
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black tracking-tighter overflow-hidden ring-1 ${isHighPriority ? 'bg-red-50 text-red-500 ring-red-100' : 'bg-slate-100 text-slate-400 ring-slate-50'}`}>
                                            <FaCalendarAlt className="text-xl" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-black text-slate-900">{a.studentName || "Unknown Student"}</h4>
                                                <span
                                                    className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${isHighPriority
                                                            ? "bg-red-100 text-red-600"
                                                            : getUrgencyLabel(a.urgency) === "Medium"
                                                                ? "bg-orange-100 text-orange-600"
                                                                : "bg-green-100 text-green-600"
                                                        }`}
                                                >
                                                    {isHighPriority && <FaFlag className="animate-pulse" />}
                                                    {getUrgencyLabel(a.urgency)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-semibold text-slate-500">{a.studentEmail || "No email available"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">
                                                {a.bookingId || `#${apptId}`} • {formatDate(a.date)} • {a.timeSlot}
                                                {a.medicalNotes ? " • Has notes" : ""}
                                            </p>
                                            {a.studentCancelNote && (
                                                <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest">
                                                    Cancellation Note Submitted
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{getMoodIcon(a.mood)}</span>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reported Mood</p>
                                                    <p className="text-xs font-bold text-slate-900 capitalize">{a.mood || "—"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {(a.status || "").toLowerCase() === "completed" ? (
                                            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                                                <FaCheckCircle /> Completed
                                            </div>
                                        ) : statusLower === "cancelled" ? (
                                            <button
                                                disabled
                                                className="px-4 py-3 bg-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed"
                                                title="Cancellation already approved"
                                            >
                                                Approved
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStatusUpdate(a)}
                                                disabled={isActionDisabled}
                                                className="px-4 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-md shadow-slate-100 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title={isCompletionDisabledByDate ? "Can complete only on the booked date" : ""}
                                            >
                                                <FaCheckCircle /> {updatingId === apptId ? "Updating..." : actionLabel}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedAppt(a)}
                                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                                            title="View Details"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        {statusLower === "confirmed" && a.studentCancelNote && (
                                            <button
                                                onClick={() => setApproveModalAppt(a)}
                                                disabled={updatingId === apptId || isCancellationApproved}
                                                className="px-4 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Approve cancellation and release slot"
                                            >
                                                {isCancellationApproved ? "Approved" : updatingId === apptId ? "Processing..." : "Approve Cancellation"}
                                            </button>
                                        )}
                                        {(statusLower === "pending" || statusLower === "confirmed") && (
                                            <button
                                                onClick={() => {
                                                    setCancelModalAppt(a);
                                                    setCancelNote("");
                                                }}
                                                disabled={updatingId === apptId}
                                                className="px-4 py-3 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Cancel appointment with note"
                                            >
                                                {updatingId === apptId ? "Processing..." : "Cancel with Note"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Appointment Details Modal */}
            {selectedAppt && (
                <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 pt-24 md:pt-28 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <FaEye className="text-blue-500" /> Appointment Details
                            </h3>
                            <button
                                onClick={() => setSelectedAppt(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Personal Info */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Personal Info</h4>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedAppt.studentName || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedAppt.studentEmail || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Age</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedAppt.age || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Number</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedAppt.contactNumber || "N/A"}</p>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guardian Phone Number</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedAppt.guardianPhoneNumber || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Assign location & session note (dummy) */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Assign location</h4>
                                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-2">
                                        <div>
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Room / venue</p>
                                            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                                                <FaMapPin className="shrink-0 text-indigo-500" />
                                                {selectedAppt.assignLocation || assignedWorkplace || "Not Assigned"}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Note</p>
                                            <p className="text-sm leading-relaxed text-slate-600">
                                                {selectedAppt.locationNote
                                                    ? selectedAppt.locationNote
                                                    : assignedLocationNote ||
                                                      "No extra location note for this booking."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Medical Info & Description */}
                                <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Medical Info & Description</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reported Mood</p>
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 capitalize">
                                            {getMoodIcon(selectedAppt.mood)} {selectedAppt.mood || "None"}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Urgency Level</p>
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full inline-block ${getUrgencyLabel(selectedAppt.urgency) === "High Priority"
                                                ? "bg-red-100 text-red-600"
                                                : getUrgencyLabel(selectedAppt.urgency) === "Medium"
                                                    ? "bg-orange-100 text-orange-600"
                                                    : "bg-green-100 text-green-600"
                                            }`}>
                                            {getUrgencyLabel(selectedAppt.urgency)}
                                        </span>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description / Notes</p>
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                            {selectedAppt.description || selectedAppt.medicalNotes || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                                </div>

                                {selectedAppt.studentCancelNote && (
                                    <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Student Cancellation Note</h4>
                                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                                        <p className="text-sm text-red-700 whitespace-pre-wrap">
                                            {selectedAppt.studentCancelNote}
                                        </p>
                                        <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-widest">
                                            Review this note before approving cancellation.
                                        </p>
                                        {(selectedAppt.status || "").toLowerCase() === "confirmed" && (
                                            <button
                                                onClick={() => setApproveModalAppt(selectedAppt)}
                                                disabled={
                                                    updatingId === (selectedAppt.id || selectedAppt.ID) ||
                                                    approvedCancellationIds.includes(selectedAppt.id || selectedAppt.ID)
                                                }
                                                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {approvedCancellationIds.includes(selectedAppt.id || selectedAppt.ID)
                                                    ? "Approved"
                                                    : updatingId === (selectedAppt.id || selectedAppt.ID)
                                                        ? "Processing..."
                                                        : "Approve Cancellation"}
                                            </button>
                                        )}
                                    </div>
                                    </div>
                                )}

                                {selectedAppt.counselorCancelNote && (
                                    <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Counselor Cancellation Note</h4>
                                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                        <p className="text-sm text-orange-700 whitespace-pre-wrap">
                                            {selectedAppt.counselorCancelNote}
                                        </p>
                                    </div>
                                    </div>
                                )}

                                {/* Schedule Info */}
                                <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Date & Time</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedAppt.date ? formatDate(selectedAppt.date) : "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time Slot</p>
                                        <p className="text-sm font-bold text-slate-800">{selectedAppt.timeSlot || "N/A"}</p>
                                    </div>
                                </div>
                                </div>

                                {/* Documents & Reports */}
                                <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Uploaded Reports</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    {selectedAppt.reportPath ? (
                                        <a
                                            href={`http://localhost:3000/${selectedAppt.reportPath}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex flex-col gap-1 group"
                                        >
                                            <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 group-hover:border-blue-300 group-hover:shadow-md transition-all">
                                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                                                    <FaEye size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">View Uploaded Medical Report</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">PDF / Document</p>
                                                </div>
                                            </div>
                                        </a>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No reports uploaded.</p>
                                    )}
                                </div>
                            </div>
                            </div>
                            <div className="lg:col-span-1">
                                <div className="lg:sticky lg:top-2">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Past Medical History (Last 5)</h4>
                                    {studentHistory.length === 0 ? (
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-sm text-slate-500 italic">No previous appointments found for this student.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-[62vh] overflow-y-auto">
                                            <div className="space-y-4">
                                                {studentHistory.map((h, idx) => (
                                                    <div key={h.id || h.ID || `${h.date}-${h.timeSlot}-${idx}`} className="flex gap-3">
                                                        <div className="flex flex-col items-center pt-0.5">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                                            {idx !== studentHistory.length - 1 && (
                                                                <span className="w-0.5 flex-1 bg-blue-100 mt-1"></span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 bg-white border border-slate-100 rounded-4xl p-3">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                {formatDate(h.date)} • {h.timeSlot || "N/A"}
                                                            </p>
                                                            <p className="text-xs font-bold text-slate-800 mt-1">
                                                                Status: {h.status || "Pending"} {h.mood ? `• Mood: ${h.mood}` : ""}
                                                            </p>
                                                            <p className="text-xs text-slate-600 mt-1">
                                                                {h.medicalNotes ? h.medicalNotes : "No medical notes recorded."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setSelectedAppt(null)}
                                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ApproveModel
                isOpen={Boolean(approveModalAppt)}
                note={approveModalAppt?.studentCancelNote || ""}
                studentName={approveModalAppt?.studentName || "Student"}
                loading={Boolean(approveModalAppt) && updatingId === (approveModalAppt?.id || approveModalAppt?.ID)}
                approved={Boolean(approveModalAppt) && approvedCancellationIds.includes(approveModalAppt?.id || approveModalAppt?.ID)}
                onCancel={() => setApproveModalAppt(null)}
                onConfirm={() => handleApproveCancellation(approveModalAppt)}
            />
            <ConfirmationModel
                isOpen={Boolean(cancelModalAppt)}
                title="Cancel Appointment"
                message="Please add a note before cancelling this appointment."
                confirmText={cancelModalAppt && updatingId === (cancelModalAppt.id || cancelModalAppt.ID) ? "Submitting..." : "Cancel Appointment"}
                cancelText="Close"
                onConfirm={handleCancelByCounselor}
                onCancel={() => {
                    if (cancelModalAppt && updatingId === (cancelModalAppt.id || cancelModalAppt.ID)) return;
                    setCancelModalAppt(null);
                    setCancelNote("");
                }}
                danger
            >
                <div className="mt-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                        Cancellation Note (required)
                    </label>
                    <textarea
                        rows={3}
                        value={cancelNote}
                        onChange={(e) => setCancelNote(e.target.value)}
                        className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm outline-none focus:border-blue-200"
                        placeholder="Explain why this appointment is being cancelled..."
                    />
                </div>
            </ConfirmationModel>
        </div>
    );
}

function TabButton({ label, active, set, id }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => set(id)}
            className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${isActive ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                }`}
        >
            {label}
        </button>
    );
}

function FilterButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${
                active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-white text-slate-500 border border-slate-100 hover:text-slate-700"
            }`}
        >
            {label}
        </button>
    );
}
