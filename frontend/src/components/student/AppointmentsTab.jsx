import React, { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaClock, FaUserMd } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmationModel from "../ConfirmationModel";

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
    const [editFieldErrors, setEditFieldErrors] = useState({});

    const user = (() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    })();

    const loadAppointments = async () => {
        if (!user?.token) {
            setAppointments([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/appointments/student", {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!res.ok) {
                toast.error("Failed to load appointments");
                setAppointments([]);
                return;
            }
            const data = await res.json();
            setAppointments(Array.isArray(data) ? data : []);
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
    }, [user?.token]);

    /** Keep only digits, max length 10 (for controlled inputs). */
    const toTenDigits = (value) => String(value ?? "").replace(/\D/g, "").slice(0, 10);

    const isTenDigitPhone = (value) => /^\d{10}$/.test(String(value ?? "").trim());

    const validateEditForm = () => {
        const errors = {};
        const ageNum = Number(editForm.age);
        const ageStr = String(editForm.age ?? "").trim();
        if (!ageStr || Number.isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
            errors.age = "Enter a whole number between 1 and 120";
        }
        const contact = editForm.contactNumber.trim();
        if (!contact) {
            errors.contactNumber = "Contact number is required";
        } else if (!isTenDigitPhone(contact)) {
            errors.contactNumber = "Enter exactly 10 digits (numbers only)";
        }
        const guardian = editForm.guardianPhoneNumber.trim();
        if (!guardian) {
            errors.guardianPhoneNumber = "Guardian phone is required";
        } else if (!isTenDigitPhone(guardian)) {
            errors.guardianPhoneNumber = "Enter exactly 10 digits (numbers only)";
        }
        const notes = editForm.medicalNotes ?? "";
        if (notes.length > 5000) {
            errors.medicalNotes = "Keep medical notes to 5,000 characters or less";
        }
        setEditFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openEditModal = (appointment) => {
        setEditingAppt(appointment);
        setEditFieldErrors({});
        setEditForm({
            age: String(appointment.age || ""),
            contactNumber: toTenDigits(appointment.contactNumber || ""),
            guardianPhoneNumber: toTenDigits(appointment.guardianPhoneNumber || ""),
            medicalNotes: appointment.medicalNotes || "",
        });
    };

    const submitEdit = async () => {
        if (!editingAppt) return;
        const appointmentId = editingAppt.id || editingAppt.ID;
        if (!validateEditForm()) {
            toast.error("Please fix the errors below");
            return;
        }

        try {
            setSavingEdit(true);
            const res = await fetch(`http://localhost:3000/api/appointments/${appointmentId}/student`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    age: Number(editForm.age),
                    contactNumber: editForm.contactNumber.trim(),
                    guardianPhoneNumber: editForm.guardianPhoneNumber.trim(),
                    medicalNotes: editForm.medicalNotes,
                }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || "Failed to update appointment");
                return;
            }
            toast.success("Appointment updated");
            setEditingAppt(null);
            await loadAppointments();
        } catch (err) {
            console.error("Failed to update appointment", err);
            toast.error("Failed to update appointment");
        } finally {
            setSavingEdit(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingAppt) return;
        const appointmentId = deletingAppt.id || deletingAppt.ID;
        const statusLower = (deletingAppt.status || "").toLowerCase();
        if (statusLower === "confirmed" && !cancelNote.trim()) {
            toast.error("Please add a cancellation note");
            return;
        }
        try {
            setDeleting(true);
            const res = await fetch(`http://localhost:3000/api/appointments/${appointmentId}/student`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
                body: statusLower === "confirmed"
                    ? JSON.stringify({ note: cancelNote.trim() })
                    : undefined,
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.error || "Failed to delete appointment");
                return;
            }
            toast.success(statusLower === "confirmed" ? "Cancellation note sent" : "Appointment deleted");
            setDeletingAppt(null);
            setCancelNote("");
            await loadAppointments();
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1" htmlFor="edit-age">
                                    Age <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="edit-age"
                                    type="number"
                                    min="1"
                                    max="120"
                                    step="1"
                                    inputMode="numeric"
                                    value={editForm.age}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, age: e.target.value });
                                        setEditFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.age;
                                            return next;
                                        });
                                    }}
                                    aria-invalid={Boolean(editFieldErrors.age)}
                                    className={`w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-blue-200 ${
                                        editFieldErrors.age ? "border-red-200 bg-red-50/30" : "border-slate-100"
                                    }`}
                                />
                                {editFieldErrors.age && (
                                    <p className="text-[10px] text-red-600 font-medium mt-1">{editFieldErrors.age}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1" htmlFor="edit-contact">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="edit-contact"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder="10 digits, e.g. 0771234567"
                                    maxLength={10}
                                    value={editForm.contactNumber}
                                    onChange={(e) => {
                                        setEditForm({
                                            ...editForm,
                                            contactNumber: toTenDigits(e.target.value),
                                        });
                                        setEditFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.contactNumber;
                                            return next;
                                        });
                                    }}
                                    aria-invalid={Boolean(editFieldErrors.contactNumber)}
                                    className={`w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-blue-200 tabular-nums ${
                                        editFieldErrors.contactNumber ? "border-red-200 bg-red-50/30" : "border-slate-100"
                                    }`}
                                />
                                {editFieldErrors.contactNumber && (
                                    <p className="text-[10px] text-red-600 font-medium mt-1">{editFieldErrors.contactNumber}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1" htmlFor="edit-guardian">
                                    Guardian Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="edit-guardian"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder="10 digits, e.g. 0779876543"
                                    maxLength={10}
                                    value={editForm.guardianPhoneNumber}
                                    onChange={(e) => {
                                        setEditForm({
                                            ...editForm,
                                            guardianPhoneNumber: toTenDigits(e.target.value),
                                        });
                                        setEditFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.guardianPhoneNumber;
                                            return next;
                                        });
                                    }}
                                    aria-invalid={Boolean(editFieldErrors.guardianPhoneNumber)}
                                    className={`w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-blue-200 tabular-nums ${
                                        editFieldErrors.guardianPhoneNumber ? "border-red-200 bg-red-50/30" : "border-slate-100"
                                    }`}
                                />
                                {editFieldErrors.guardianPhoneNumber && (
                                    <p className="text-[10px] text-red-600 font-medium mt-1">{editFieldErrors.guardianPhoneNumber}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1" htmlFor="edit-notes">
                                    Medical Notes <span className="text-slate-400 font-bold normal-case">(optional)</span>
                                </label>
                                <textarea
                                    id="edit-notes"
                                    rows={3}
                                    maxLength={5000}
                                    value={editForm.medicalNotes}
                                    onChange={(e) => {
                                        setEditForm({ ...editForm, medicalNotes: e.target.value });
                                        setEditFieldErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.medicalNotes;
                                            return next;
                                        });
                                    }}
                                    aria-invalid={Boolean(editFieldErrors.medicalNotes)}
                                    className={`w-full border-2 rounded-xl p-3 text-sm outline-none focus:border-blue-200 ${
                                        editFieldErrors.medicalNotes ? "border-red-200 bg-red-50/30" : "border-slate-100"
                                    }`}
                                />
                                <div className="flex justify-between items-center mt-1">
                                    {editFieldErrors.medicalNotes ? (
                                        <p className="text-[10px] text-red-600 font-medium">{editFieldErrors.medicalNotes}</p>
                                    ) : (
                                        <span />
                                    )}
                                    <p className="text-[10px] text-slate-400 font-medium tabular-nums">
                                        {(editForm.medicalNotes || "").length} / 5000
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setEditingAppt(null);
                                    setEditFieldErrors({});
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
