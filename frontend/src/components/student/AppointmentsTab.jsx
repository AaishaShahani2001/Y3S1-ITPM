import React, { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaClock, FaUserMd } from "react-icons/fa";
import { toast } from "react-toastify";
import ConfirmationModel from "../ConfirmationModel.jsx";

export default function AppointmentsTab() {
    const [filter, setFilter] = useState("all");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAppt, setEditingAppt] = useState(null);
    const [deletingAppt, setDeletingAppt] = useState(null);
    const [cancelNote, setCancelNote] = useState("");

    const [editForm, setEditForm] = useState({
        age: "",
        contactNumber: "",
        guardianPhoneNumber: "",
        medicalNotes: "",
    });

    //Dummy Data (UI only)
    useEffect(() => {
        setTimeout(() => {
            setAppointments([
                {
                    id: 1,
                    counselorName: "Dr. Smith",
                    counselorEmail: "smith@mail.com",
                    bookingId: "APT001",
                    date: "2026-04-10",
                    timeSlot: "10:00 AM",
                    status: "Pending",
                },
                {
                    id: 2,
                    counselorName: "Dr. Jane",
                    counselorEmail: "jane@mail.com",
                    bookingId: "APT002",
                    date: "2026-03-01",
                    timeSlot: "01:00 PM",
                    status: "Completed",
                },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const todayStr = useMemo(() => {
        const now = new Date();
        return now.toISOString().split("T")[0];
    }, []);

    const openEditModal = (appointment) => {
        setEditingAppt(appointment);
        setEditForm({
            age: "",
            contactNumber: "",
            guardianPhoneNumber: "",
            medicalNotes: "",
        });
    };

    // UI only edit 
    const submitEdit = () => {
        toast.success("Updated locally (UI only)");
        setEditingAppt(null);
    };

    // UI only delete
    const confirmDelete = () => {
        setAppointments((prev) =>
            prev.filter((a) => a.id !== deletingAppt.id)
        );
        toast.success("Deleted locally (UI only)");
        setDeletingAppt(null);
    };

    const formatDate = (isoDate) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const statusPillClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "completed") return "bg-green-100 text-green-700";
        if (s === "confirmed") return "bg-blue-100 text-blue-700";
        if (s === "cancelled") return "bg-orange-100 text-orange-700";
        return "bg-yellow-100 text-yellow-700";
    };

    const visibleAppointments = useMemo(() => {
        return appointments.filter((a) => {
            if (filter === "upcoming") return a.date >= todayStr;
            if (filter === "past") return a.date < todayStr;
            return true;
        });
    }, [appointments, filter, todayStr]);

    return (
        <div className="animate-fadeIn space-y-6">
            {/* HEADER */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h2 className="text-2xl font-black">Appointment History</h2>
                <p className="text-sm text-slate-500">
                    Track, edit, and manage your appointments.
                </p>
            </div>

            {/* FILTER */}
            <div className="flex gap-2">
                {["all", "upcoming", "past"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl ${
                            filter === f
                                ? "bg-black text-white"
                                : "bg-white border"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="p-4 text-left">Specialist</th>
                            <th className="p-4 text-left">Schedule</th>
                            <th className="p-4 text-left">Contact</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-6">
                                    Loading...
                                </td>
                            </tr>
                        ) : visibleAppointments.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-6">
                                    No appointments
                                </td>
                            </tr>
                        ) : (
                            visibleAppointments.map((a) => (
                                <tr key={a.id}>
                                    <td className="p-4">
                                        <FaUserMd /> {a.counselorName}
                                    </td>
                                    <td className="p-4">
                                        <FaClock /> {formatDate(a.date)}
                                    </td>
                                    <td className="p-4">
                                        {a.counselorEmail}
                                    </td>
                                    <td className="p-4">
                                        <span
                                            className={`px-2 py-1 rounded ${statusPillClass(
                                                a.status
                                            )}`}
                                        >
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() =>
                                                openEditModal(a)
                                            }
                                            className="mr-2 text-blue-600"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                setDeletingAppt(a)
                                            }
                                            className="text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* EDIT MODAL */}
            {editingAppt && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl">
                        <h3 className="font-bold mb-4">
                            Edit Appointment
                        </h3>

                        <input
                            placeholder="Age"
                            className="border p-2 w-full mb-2"
                            onChange={(e) =>
                                setEditForm({
                                    ...editForm,
                                    age: e.target.value,
                                })
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditingAppt(null)}
                            >
                                Cancel
                            </button>
                            <button onClick={submitEdit}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM */}
            <ConfirmationModel
                isOpen={!!deletingAppt}
                title="Delete Appointment"
                message="Are you sure?"
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeletingAppt(null)}
                danger
            />
        </div>
    );
}