import React, { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaClock, FaUserMd } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmationModel from "../ConfirmationModel";

const DUMMY_APPOINTMENTS = [
    {
        id: 1,
        bookingId: "MB-APT-1001",
        counselorName: "Dr. Andrea Cruz",
        counselorEmail: "andrea.cruz@mindbridge.local",
        date: "2026-04-02",
        timeSlot: "09:00 AM - 10:00 AM",
        status: "Pending",
        age: 20,
        contactNumber: "0758965478",
        guardianPhoneNumber: "0758965478",
        medicalNotes: "Mild anxiety before exams.",
        studentCancelNote: "",
        counselorCancelNote: "",
    },
    {
        id: 2,
        bookingId: "MB-APT-1002",
        counselorName: "Dr. Miguel Reyes",
        counselorEmail: "miguel.reyes@mindbridge.local",
        date: "2026-03-20",
        timeSlot: "01:00 PM - 02:00 PM",
        status: "Completed",
        age: 21,
        contactNumber: "0758965478",
        guardianPhoneNumber: "0758965478",
        medicalNotes: "Follow-up counseling session.",
        studentCancelNote: "",
        counselorCancelNote: "",
    },
    {
        id: 3,
        bookingId: "MB-APT-1003",
        counselorName: "Dr. Lara Santos",
        counselorEmail: "lara.santos@mindbridge.local",
        date: "2026-03-28",
        timeSlot: "03:00 PM - 04:00 PM",
        status: "Confirmed",
        age: 19,
        contactNumber: "0758965478",
        guardianPhoneNumber: "0758965478",
        medicalNotes: "Needs coping strategies for stress.",
        studentCancelNote: "",
        counselorCancelNote: "",
    },
    {
        id: 4,
        bookingId: "MB-APT-1004",
        counselorName: "Dr. Paula Lim",
        counselorEmail: "paula.lim@mindbridge.local",
        date: "2026-03-18",
        timeSlot: "10:00 AM - 11:00 AM",
        status: "Cancelled",
        age: 22,
        contactNumber: "0758965478",
        guardianPhoneNumber: "0758965478",
        medicalNotes: "Sleep pattern concerns.",
        studentCancelNote: "",
        counselorCancelNote: "Urgent clinic schedule adjustment.",
    },
];

export default function AppointmentsTab() {
    const [filter, setFilter] = useState("all");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAppt, setEditingAppt] = useState(null);
    const [deletingAppt, setDeletingAppt] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [cancelNote, setCancelNote] = useState("");
    const [editForm, setEditForm] = useState({
        age: "",
        contactNumber: "",
        guardianPhoneNumber: "",
        medicalNotes: "",
    });
    const [editErrors, setEditErrors] = useState({
        age: "",
        contactNumber: "",
        guardianPhoneNumber: "",
        medicalNotes: "",
    });

    const loadAppointments = async () => {
        setLoading(true);
        try {
            setAppointments(DUMMY_APPOINTMENTS);
        } catch (err) {
            console.error("Failed to load student appointments", err);
            toast.error("Failed to load appointments");
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const todayStr = useMemo(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    useEffect(() => {
        loadAppointments();
    }, []);

    const openEditModal = (appointment) => {
        setEditingAppt(appointment);
        setEditForm({
            age: String(appointment.age || ""),
            contactNumber: appointment.contactNumber || "",
            guardianPhoneNumber: appointment.guardianPhoneNumber || "",
            medicalNotes: appointment.medicalNotes || "",
        });
        setEditErrors({
            age: "",
            contactNumber: "",
            guardianPhoneNumber: "",
            medicalNotes: "",
        });
    };

    const validateEditForm = () => {
        const errors = {
            age: "",
            contactNumber: "",
            guardianPhoneNumber: "",
            medicalNotes: "",
        };

        const ageNum = Number(editForm.age);
        if (!editForm.age) {
            errors.age = "Age is required.";
        } else if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
            errors.age = "Enter a valid age between 1 and 120.";
        }

        const contact = editForm.contactNumber.trim();
        if (!contact) {
            errors.contactNumber = "Contact number is required.";
        } else if (!/^\d{10}$/.test(contact)) {
            errors.contactNumber = "Contact number must be exactly 10 digits.";
        }

        const guardian = editForm.guardianPhoneNumber.trim();
        if (!guardian) {
            errors.guardianPhoneNumber = "Guardian phone number is required.";
        } else if (!/^\d{10}$/.test(guardian)) {
            errors.guardianPhoneNumber = "Guardian phone number must be exactly 10 digits.";
        }

        const notes = editForm.medicalNotes.trim();
        if (!notes) {
            errors.medicalNotes = "Medical notes are required.";
        } else if (notes.length < 5) {
            errors.medicalNotes = "Medical notes must be at least 5 characters.";
        } else if (notes.length > 300) {
            errors.medicalNotes = "Medical notes must not exceed 300 characters.";
        }

        setEditErrors(errors);
        return Object.values(errors).every((value) => !value);
    };

    const submitEdit = () => {
        if (!editingAppt) return;
        const appointmentId = editingAppt.id || editingAppt.ID;
        if (!validateEditForm()) {
            toast.error("Please fix the form errors.");
            return;
        }

        try {
            setSavingEdit(true);
            setAppointments((prev) =>
                prev.map((appt) => {
                    if ((appt.id || appt.ID) !== appointmentId) return appt;
                    return {
                        ...appt,
                    age: Number(editForm.age),
                    contactNumber: editForm.contactNumber.trim(),
                    guardianPhoneNumber: editForm.guardianPhoneNumber.trim(),
                    medicalNotes: editForm.medicalNotes,
                    };
                })
            );
            toast.success("Appointment updated");
            setEditingAppt(null);
        } catch (err) {
            console.error("Failed to update appointment", err);
            toast.error("Failed to update appointment");
        } finally {
            setSavingEdit(false);
        }
    };

    const confirmDelete = () => {
        if (!deletingAppt) return;
        const appointmentId = deletingAppt.id || deletingAppt.ID;
        const statusLower = (deletingAppt.status || "").toLowerCase();
        if (statusLower === "confirmed" && !cancelNote.trim()) {
            toast.error("Please add a cancellation note");
            return;
        }
        try {
            setDeleting(true);
            setAppointments((prev) =>
                prev
                    .map((appt) => {
                        if ((appt.id || appt.ID) !== appointmentId) return appt;
                        if (statusLower === "confirmed") {
                            return {
                                ...appt,
                                studentCancelNote: cancelNote.trim(),
                            };
                        }
                        return null;
                    })
                    .filter(Boolean)
            );
            toast.success(statusLower === "confirmed" ? "Cancellation note sent" : "Appointment deleted");
            setDeletingAppt(null);
            setCancelNote("");
        } catch (err) {
            console.error("Failed to delete appointment", err);
            toast.error("Failed to delete appointment");
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        const [y, m, d] = isoDate.split("-");
        const date = new Date(y, (m || 1) - 1, d || 1);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const statusPillClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "completed") return "bg-green-100 text-green-700 border-green-200";
        if (s === "confirmed") return "bg-blue-100 text-blue-700 border-blue-200";
        if (s === "cancelled") return "bg-orange-100 text-orange-700 border-orange-200";
        if (s === "deleted") return "bg-slate-100 text-slate-600 border-slate-200";
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    };

    const visibleAppointments = useMemo(() => {
        return appointments.filter((a) => {
            if (filter === "upcoming") return (a.date || "") >= todayStr;
            if (filter === "past") return (a.date || "") < todayStr;
            return true;
        });
    }, [appointments, filter, todayStr]);

    return (
        <div className="animate-fadeIn space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Appointment History</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            Track, edit, and manage your counseling appointments.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center w-full md:w-auto">
                        <StatBadge label="All" value={appointments.length} />
                        <StatBadge label="Upcoming" value={appointments.filter((a) => (a.date || "") >= todayStr).length} />
                        <StatBadge label="Past" value={appointments.filter((a) => (a.date || "") < todayStr).length} />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-colors ${
                            filter === "all" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:text-slate-700"
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("upcoming")}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-colors ${
                            filter === "upcoming" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:text-slate-700"
                        }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter("past")}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border transition-colors ${
                            filter === "past" ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:text-slate-700"
                        }`}
                    >
                        Past
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-4xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td className="px-8 py-6 text-sm text-slate-500" colSpan={5}>Loading appointments...</td>
                            </tr>
                        ) : visibleAppointments.length === 0 ? (
                            <tr>
                                <td className="px-8 py-6 text-sm text-slate-500" colSpan={5}>No appointments found</td>
                            </tr>
                        ) : visibleAppointments.map((a) => (
                            <tr key={a.id || a.ID || a.bookingId} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <FaUserMd />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{a.counselorName || "Counselor"}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{a.bookingId || "-"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="text-sm font-bold flex items-center gap-2"><FaClock className="text-slate-400" /> {formatDate(a.date)}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{a.timeSlot || "-"}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] font-black text-slate-500">{a.counselorEmail || "No email available"}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-black text-[10px] uppercase tracking-widest ${statusPillClass(a.status)}`}>
                                        <FaCheckCircle /> {a.status || "Pending"}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    {(() => {
                                        const statusLower = (a.status || "").toLowerCase();
                                        const cancellationRequested = statusLower === "confirmed" && Boolean(a.studentCancelNote);

                                        if (statusLower === "completed") {
                                            return <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Locked</span>;
                                        }

                                        if (statusLower === "deleted") {
                                            return (
                                                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                                    Deleted
                                                </span>
                                            );
                                        }

                                        if (statusLower === "cancelled") {
                                            return (
                                                <span className="text-green-600 font-black text-[10px] uppercase tracking-widest">
                                                    {a.counselorCancelNote ? "Cancelled by Counselor" : "Cancellation Approved"}
                                                </span>
                                            );
                                        }

                                        if (cancellationRequested) {
                                            return (
                                                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                                    Cancellation Requested
                                                </span>
                                            );
                                        }

                                        return (
                                        <div className="flex items-center justify-center gap-2">
                                            {statusLower === "pending" && (
                                                <button
                                                    onClick={() => openEditModal(a)}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setDeletingAppt(a);
                                                    setCancelNote("");
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        );
                                    })()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Appointment Modal */}
            {editingAppt && (
                <div className="fixed inset-0 z-1000 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4">
                        <h3 className="text-lg font-black text-slate-900">Edit Appointment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Age</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={editForm.age}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, age: e.target.value });
                                        if (editErrors.age) setEditErrors((prev) => ({ ...prev, age: "" }));
                                    }}
                                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm outline-none focus:border-blue-200"
                                />
                                {editErrors.age && (
                                    <p className="mt-1 text-[10px] font-bold text-red-500">{editErrors.age}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={editForm.contactNumber}
                                    onChange={(e) => {
                                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setEditForm({ ...editForm, contactNumber: digitsOnly });
                                        if (editErrors.contactNumber) setEditErrors((prev) => ({ ...prev, contactNumber: "" }));
                                    }}
                                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm outline-none focus:border-blue-200"
                                />
                                {editErrors.contactNumber && (
                                    <p className="mt-1 text-[10px] font-bold text-red-500">{editErrors.contactNumber}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Guardian Phone Number</label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    value={editForm.guardianPhoneNumber}
                                    onChange={(e) => {
                                        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                                        setEditForm({ ...editForm, guardianPhoneNumber: digitsOnly });
                                        if (editErrors.guardianPhoneNumber) setEditErrors((prev) => ({ ...prev, guardianPhoneNumber: "" }));
                                    }}
                                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm outline-none focus:border-blue-200"
                                />
                                {editErrors.guardianPhoneNumber && (
                                    <p className="mt-1 text-[10px] font-bold text-red-500">{editErrors.guardianPhoneNumber}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Medical Notes</label>
                                <textarea
                                    rows={3}
                                    value={editForm.medicalNotes}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, medicalNotes: e.target.value });
                                        if (editErrors.medicalNotes) setEditErrors((prev) => ({ ...prev, medicalNotes: "" }));
                                    }}
                                    className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm outline-none focus:border-blue-200"
                                />
                                {editErrors.medicalNotes && (
                                    <p className="mt-1 text-[10px] font-bold text-red-500">{editErrors.medicalNotes}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setEditingAppt(null);
                                    setEditErrors({
                                        age: "",
                                        contactNumber: "",
                                        guardianPhoneNumber: "",
                                        medicalNotes: "",
                                    });
                                }}
                                className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitEdit}
                                disabled={savingEdit}
                                className="px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl bg-slate-900 text-white hover:bg-black disabled:opacity-50"
                            >
                                {savingEdit ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModel
                isOpen={!!deletingAppt}
                title={(deletingAppt?.status || "").toLowerCase() === "confirmed" ? "Request Appointment Cancellation" : "Delete Appointment"}
                message={(deletingAppt?.status || "").toLowerCase() === "confirmed"
                    ? "Confirmed appointments cannot be deleted directly. Add a note to notify the counselor."
                    : "Are you sure you want to delete this appointment? This action cannot be undone."}
                confirmText={deleting
                    ? "Submitting..."
                    : (deletingAppt?.status || "").toLowerCase() === "confirmed"
                        ? "Send Note"
                        : "Delete"}
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => !deleting && setDeletingAppt(null)}
                danger
            >
                {(deletingAppt?.status || "").toLowerCase() === "confirmed" && (
                    <div className="mt-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                            Cancellation Note (required)
                        </label>
                        <textarea
                            rows={3}
                            value={cancelNote}
                            onChange={(e) => setCancelNote(e.target.value)}
                            className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm outline-none focus:border-blue-200"
                            placeholder="Explain why you need to cancel this confirmed appointment..."
                        />
                    </div>
                )}
            </ConfirmationModel>
            {/* Display counselor cancellation reason if appointment was cancelled by counselor */}
            {visibleAppointments.some((a) => (a.status || "").toLowerCase() === "cancelled" && a.counselorCancelNote) && (
                <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">
                        Counselor Cancellation Note
                    </p>
                    <p className="text-sm text-orange-700">
                        Check cancelled appointments to view counselor-provided cancellation details.
                    </p>
                </div>
            )}
        </div>
    );
}

function StatBadge({ label, value }) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-4xl px-3 py-2 min-w-20.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-lg font-black tracking-tight text-slate-900">{value}</p>
        </div>
    );
}
