import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaPlus,
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaEdit,
  FaTrash,
  FaEye,
  FaArrowLeft,
  FaExclamationCircle,
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:3000";

const treatmentIdeas = [
  "Exam Anxiety Management Plan",
  "Stress Reduction & Breathing Routine",
  "Confidence Building Plan",
  "Time Management & Study Discipline",
  "Motivation Recovery Plan",
  "Custom / Other",
];

function formatPlanTimestamp(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function normalizeCounselorAppointment(row) {
  const id = row.id ?? row.ID;
  const rawSid = row.studentId ?? row.student_id ?? row.StudentID;
  const studentId =
    rawSid != null && rawSid !== "" ? Number(rawSid) : NaN;
  return {
    id,
    studentId: Number.isFinite(studentId) ? studentId : undefined,
    studentName: row.studentName || row.student_name || "Unknown student",
    date: row.date || "",
    timeSlot: row.timeSlot || row.time_slot || "",
    mood: row.mood || "",
    status: row.status || "",
  };
}

export default function ManagePlansTab() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [plans, setPlans] = useState([]);
  const [counselorAppointments, setCounselorAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

const fetchPlans = () => {
  const u = JSON.parse(localStorage.getItem("user") || "null");
  fetch(`${API_BASE_URL}/api/treatment-plans`, {
    headers: u?.token ? { Authorization: `Bearer ${u.token}` } : {},
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        console.error("Error fetching plans:", data?.error || res.statusText);
        setPlans([]);
        return;
      }
      const list = Array.isArray(data) ? data : [];
      setPlans(
        list.map((plan) => {
          const pct =
            typeof plan.progress_percent === "number"
              ? plan.progress_percent
              : Number(plan.progress_percent);
          const progress = Number.isFinite(pct)
            ? Math.min(100, Math.max(0, pct))
            : (plan.status || "").toLowerCase() === "completed"
              ? 100
              : 0;
          const st = plan.status === "pending" ? "Pending" : plan.status;
          return {
            id: plan.id,
            appointmentId: plan.appointment_id,
            student: plan.student_name || `Student #${plan.student_id}`,
            caseId: `CASE-${plan.id}`,
            status: st,
            progress,
            treatmentIdea: plan.description || "",
            primaryObjective: plan.title || "",
            lastUpdated: formatPlanTimestamp(plan.updated_at),
            counsellorName: plan.counsellor_name || "Counsellor",
            recommendations: {
              dailyRoutine: plan.daily_routine || "",
              readingMaterials: plan.reading_materials || "",
              exercisePlan: plan.exercise_plan || "",
            },
          };
        })
      );
    })
    .catch((err) => {
      console.error("Error fetching plans:", err);
      setPlans([]);
    });
};

  const fetchCounselorAppointments = useCallback(async () => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u?.token) {
      setCounselorAppointments([]);
      setAppointmentsLoading(false);
      return;
    }
    setAppointmentsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/counselor`, {
        headers: { Authorization: `Bearer ${u.token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to load appointments:", data?.error || res.statusText);
        setCounselorAppointments([]);
        return;
      }
      const list = Array.isArray(data) ? data : [];
      setCounselorAppointments(list.map(normalizeCounselorAppointment));
    } catch (e) {
      console.error("Error fetching counselor appointments:", e);
      setCounselorAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

useEffect(() => {
  fetchPlans();
  fetchCounselorAppointments();
}, [fetchCounselorAppointments]);

  const [formData, setFormData] = useState({
    appointmentId: "",
    treatmentIdea: "",
    primaryObjective: "",
    progress: "",
    status: "Active",
    recommendations: {
      dailyRoutine: "",
      readingMaterials: "",
      exercisePlan: "",
    },
  });

  const [errors, setErrors] = useState({});

  const activePlans = plans.filter((p) => p.status === "Active").length;
  const completedPlans = plans.filter((p) => p.status === "Completed").length;
  const upcomingFollowUps = plans.filter((p) => p.status !== "Completed").length;

  const appointmentIdsWithPlans = useMemo(() => {
    const ids = new Set();
    plans.forEach((p) => {
      if (p.appointmentId != null && p.appointmentId !== "") {
        ids.add(String(p.appointmentId));
      }
    });
    return ids;
  }, [plans]);

  /** Appointments that can be chosen for a *new* plan; editing keeps the plan's appointment visible. */
  const appointmentsForSelect = useMemo(() => {
    return counselorAppointments.filter((a) => {
      const idStr = String(a.id);
      if (!appointmentIdsWithPlans.has(idStr)) return true;
      if (isEditing && editingPlanId != null) {
        const current = plans.find((p) => p.id === editingPlanId);
        if (current && String(current.appointmentId) === idStr) return true;
      }
      return false;
    });
  }, [
    counselorAppointments,
    appointmentIdsWithPlans,
    isEditing,
    editingPlanId,
    plans,
  ]);

  const handleValidation = () => {
    const newErrors = {};

    if (!formData.appointmentId) newErrors.appointmentId = "Select an appointment";
    if (!formData.treatmentIdea) newErrors.treatmentIdea = "Select a treatment idea";
    if (!formData.primaryObjective.trim()) newErrors.primaryObjective = "Primary objective is required";
    if (formData.progress === "") newErrors.progress = "Progress is required";
    if (!formData.recommendations.dailyRoutine.trim()) newErrors.dailyRoutine = "Daily routine is required";
    if (!formData.recommendations.readingMaterials.trim()) newErrors.readingMaterials = "Reading materials are required";
    if (!formData.recommendations.exercisePlan.trim()) newErrors.exercisePlan = "Exercise plan is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      appointmentId: "",
      treatmentIdea: "",
      primaryObjective: "",
      progress: "",
      status: "Active",
      recommendations: {
        dailyRoutine: "",
        readingMaterials: "",
        exercisePlan: "",
      },
    });
    setErrors({});
  };

  const handleBackToPlans = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingPlanId(null);
    setSelectedPlan(null);
    setExpandedStepId(null);
    resetForm();
  };

  const handleSubmit = () => {
    if (!handleValidation()) return;

    const selectedAppointment = counselorAppointments.find(
      (a) => String(a.id) === formData.appointmentId
    );

    if (!selectedAppointment) return;

    if (
      !isEditing &&
      appointmentIdsWithPlans.has(String(selectedAppointment.id))
    ) {
      alert("This appointment already has a treatment plan.");
      return;
    }

    const counsellorId = user?.id;
    if (!counsellorId) {
      alert("You must be logged in as a counsellor.");
      return;
    }

    const resolvedStudentId = Number(selectedAppointment.studentId);
    if (!Number.isFinite(resolvedStudentId) || resolvedStudentId <= 0) {
      alert(
        "Could not resolve the student for this appointment. Refresh the page and try again."
      );
      return;
    }

    const progressPercent = Math.min(
      100,
      Math.max(0, parseInt(formData.progress, 10) || 0)
    );

 if (isEditing) {
  const updatedPlan = {
    appointment_id: selectedAppointment.id,
    counsellor_id: counsellorId,
    student_id: resolvedStudentId,
    title: formData.primaryObjective,
    description: formData.treatmentIdea,
    status: formData.status,
    daily_routine: formData.recommendations.dailyRoutine,
    reading_materials: formData.recommendations.readingMaterials,
    exercise_plan: formData.recommendations.exercisePlan,
    progress_percent: progressPercent,
  };

  fetch(`${API_BASE_URL}/api/treatment-plans/${editingPlanId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
    },
    body: JSON.stringify(updatedPlan),
  })
   .then((res) => {
  if (!res.ok) {
    throw new Error("Failed to update");
  }
  return res.json();
})
.then(() => {
      fetchPlans();
      alert("Treatment plan updated successfully!");
      handleBackToPlans();
    })
    .catch((err) => {
      console.error("Error updating treatment plan:", err);
      alert("Failed to update treatment plan");
    });

  return;
} else {
  const newPlan = {
    appointment_id: selectedAppointment.id,
    counsellor_id: counsellorId,
    student_id: resolvedStudentId,
    title: formData.primaryObjective,
    description: formData.treatmentIdea,
    status: formData.status,
    daily_routine: formData.recommendations.dailyRoutine,
    reading_materials: formData.recommendations.readingMaterials,
    exercise_plan: formData.recommendations.exercisePlan,
    progress_percent: progressPercent,
  };

  fetch(`${API_BASE_URL}/api/treatment-plans`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
  },
  body: JSON.stringify(newPlan),
})
  .then((res) => res.json())
  .then((savedPlan) => {
   fetchPlans();
    alert("Treatment plan added successfully!");
  })
  .catch((err) => {
    console.error("Error adding treatment plan:", err);
    alert("Failed to add treatment plan");
  });
}

    handleBackToPlans();
  };

  const handleEdit = (plan) => {
    setIsEditing(true);
    setIsCreating(true);
    setSelectedPlan(null);
    setEditingPlanId(plan.id);
    setFormData({
      appointmentId: String(plan.appointmentId),
      treatmentIdea: plan.treatmentIdea,
      primaryObjective: plan.primaryObjective,
      progress: String(plan.progress),
      status: plan.status,
      recommendations: { ...plan.recommendations },
    });
    setErrors({});
  };

  const handleDelete = (planId) => {
  const ok = window.confirm("Delete this treatment plan?");
  if (!ok) return;

  fetch(`${API_BASE_URL}/api/treatment-plans/${planId}`, {
    method: "DELETE",
    headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
  })
    .then((res) => res.json())
    .then(() => {
      fetchPlans();
      alert("Treatment plan deleted successfully!");
    })
    .catch((err) => {
      console.error("Error deleting treatment plan:", err);
      alert("Failed to delete treatment plan");
    });
};

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setIsCreating(false);
    setIsEditing(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <FaCheckCircle />;
      case "Completed":
        return <FaCheckCircle />;
      case "Pending":
        return <FaClock />;
      case "Needs Attention":
        return <FaExclamationCircle />;
      default:
        return <FaCheckCircle />;
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Treatment Plans Hub
        </h2>

        {!isCreating && !selectedPlan && (
          <button
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
              setSelectedPlan(null);
              resetForm();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
          >
            <FaPlus /> Add Plan
          </button>
        )}
      </div>

      {/* Summary Cards */}
      {!isCreating && !selectedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col gap-4">
            <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center text-2xl">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Active Plans
              </p>
              <span className="text-4xl font-black text-slate-900">{activePlans}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Completed Plans
              </p>
              <span className="text-4xl font-black text-slate-900">{completedPlans}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col gap-4">
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl">
              <FaClock />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Upcoming Follow-Ups
              </p>
              <span className="text-4xl font-black text-slate-900">{upcomingFollowUps}</span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {isCreating && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 animate-slideUp">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToPlans}
                className="w-11 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                title="Back to Treatment Plans"
              >
                <FaArrowLeft />
              </button>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isEditing ? "Edit Treatment Plan" : "Create New Treatment Plan"}
                </h3>
                {isEditing && (
                  <span className="text-xs font-bold text-slate-400">
                    Editing plan for case #{plans.find((p) => p.id === editingPlanId)?.caseId}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleBackToPlans}
              className="text-slate-400 hover:text-red-500 bg-slate-50 p-3 rounded-xl transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Counseling Appointment
                </label>
                <select
                  value={formData.appointmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentId: e.target.value })
                  }
                  disabled={isEditing || appointmentsLoading}
                  className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.appointmentId
                      ? "border-red-300"
                      : "border-transparent focus:ring-2 focus:ring-blue-100"
                    } ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {appointmentsLoading
                      ? "Loading appointments…"
                      : counselorAppointments.length === 0
                        ? "No appointments available"
                        : !isEditing && appointmentsForSelect.length === 0
                          ? "No free appointments (all have a plan)"
                          : "-- Select Appointment --"}
                  </option>
                  {appointmentsForSelect.map((a) => (
                    <option key={a.id} value={String(a.id)}>
                      {a.studentName} — {a.date} {a.timeSlot}
                      {a.mood ? ` · ${a.mood}` : ""} ({a.status})
                    </option>
                  ))}
                </select>
                {errors.appointmentId && (
                  <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                    <FaExclamationCircle /> {errors.appointmentId}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Treatment Idea
                </label>
                <select
                  value={formData.treatmentIdea}
                  onChange={(e) =>
                    setFormData({ ...formData, treatmentIdea: e.target.value })
                  }
                  className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.treatmentIdea
                      ? "border-red-300"
                      : "border-transparent focus:ring-2 focus:ring-blue-100"
                    }`}
                >
                  <option value="">-- Select Idea --</option>
                  {treatmentIdeas.map((idea, idx) => (
                    <option key={idx} value={idea}>
                      {idea}
                    </option>
                  ))}
                </select>
                {errors.treatmentIdea && (
                  <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                    <FaExclamationCircle /> {errors.treatmentIdea}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Primary Objective
              </label>
              <input
                type="text"
                value={formData.primaryObjective}
                onChange={(e) =>
                  setFormData({ ...formData, primaryObjective: e.target.value })
                }
                className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.primaryObjective
                    ? "border-red-300"
                    : "border-transparent focus:ring-2 focus:ring-blue-100"
                  }`}
                placeholder="e.g. Reduce panic symptoms"
              />
              {errors.primaryObjective && (
                <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                  <FaExclamationCircle /> {errors.primaryObjective}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent focus:ring-2 focus:ring-blue-100 rounded-xl text-sm font-bold outline-none transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Progress %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) =>
                    setFormData({ ...formData, progress: e.target.value })
                  }
                  className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.progress
                      ? "border-red-300"
                      : "border-transparent focus:ring-2 focus:ring-blue-100"
                    }`}
                  placeholder="0 - 100"
                />
                {errors.progress && (
                  <p className="text-red-500 text-[10px] font-bold flex items-center gap-1">
                    <FaExclamationCircle /> {errors.progress}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-6">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                Counselor Recommendations
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Daily Routine
                  </label>
                  <textarea
                    rows={4}
                    value={formData.recommendations.dailyRoutine}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommendations: {
                          ...formData.recommendations,
                          dailyRoutine: e.target.value,
                        },
                      })
                    }
                    placeholder="Morning routine..."
                    className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.dailyRoutine
                        ? "border-red-300"
                        : "border-transparent focus:ring-2 focus:ring-blue-100"
                      }`}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Reading Materials
                  </label>
                  <textarea
                    rows={4}
                    value={formData.recommendations.readingMaterials}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommendations: {
                          ...formData.recommendations,
                          readingMaterials: e.target.value,
                        },
                      })
                    }
                    placeholder="Books, articles..."
                    className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.readingMaterials
                        ? "border-red-300"
                        : "border-transparent focus:ring-2 focus:ring-blue-100"
                      }`}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    Exercise Plan
                  </label>
                  <textarea
                    rows={4}
                    value={formData.recommendations.exercisePlan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommendations: {
                          ...formData.recommendations,
                          exercisePlan: e.target.value,
                        },
                      })
                    }
                    placeholder="Physical activities..."
                    className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.exercisePlan
                        ? "border-red-300"
                        : "border-transparent focus:ring-2 focus:ring-blue-100"
                      }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all"
              >
                {isEditing ? "Update Treatment Plan" : "Generate & Publish Plan"}
              </button>
              <button
                onClick={handleBackToPlans}
                className="px-8 bg-white border-2 border-slate-100 text-slate-500 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:border-slate-300 hover:text-slate-800 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details */}
      {selectedPlan && (
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToPlans}
                  className="w-11 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                  title="Back to Treatment Plans"
                >
                  <FaArrowLeft />
                </button>

                <div>
                  <h3 className="text-xl font-black text-slate-900">Plan Details</h3>
                  <p className="text-sm text-slate-400">
                    Student: <span className="font-bold text-slate-700">{selectedPlan.student}</span>
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Updated {selectedPlan.lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-900">
                    <FaCheckCircle className="text-blue-600" /> Published plan
                  </h3>
                  <span
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase ${selectedPlan.status === "Active"
                        ? "bg-green-50 text-green-600"
                        : selectedPlan.status === "Completed"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                  >
                    {getStatusIcon(selectedPlan.status)} {selectedPlan.status}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Primary objective
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedPlan.primaryObjective || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Treatment focus (description)
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {selectedPlan.treatmentIdea?.trim() || "—"}
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Progress
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {selectedPlan.progress}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, selectedPlan.progress))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl">
                <h3 className="mb-6 flex items-center gap-3 text-xl font-black">
                  <FaExclamationCircle className="text-blue-400" /> Recommendations
                </h3>

                <div className="space-y-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                      Daily routine
                    </p>
                    <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-300">
                      {selectedPlan.recommendations.dailyRoutine?.trim() || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                      Reading materials
                    </p>
                    <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-300">
                      {selectedPlan.recommendations.readingMaterials?.trim() || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                      Exercise plan
                    </p>
                    <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-300">
                      {selectedPlan.recommendations.exercisePlan?.trim() || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      {!isCreating && !selectedPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-black text-slate-900 mb-1">{plan.student}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Case ID: {plan.caseId}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg ${plan.status === "Active"
                      ? "bg-green-50 text-green-600"
                      : plan.status === "Completed"
                        ? "bg-blue-50 text-blue-600"
                        : plan.status === "Pending"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-red-50 text-red-600"
                    }`}
                >
                  {getStatusIcon(plan.status)} {plan.status}
                </span>
              </div>

              <div className="flex-1 space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Primary Objective
                  </p>
                  <p className="text-sm font-bold text-slate-700">{plan.primaryObjective}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Progress
                    </span>
                    <span className="text-xs font-black text-slate-900">{plan.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-1000"
                      style={{ width: `${plan.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t border-slate-50">
                <button
                  onClick={() => handleView(plan)}
                  className="flex-1 py-3 bg-slate-50 text-blue-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye size={14} /> View Details
                </button>
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md shadow-slate-200"
                >
                  <FaEdit size={14} /> Edit Plan
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}