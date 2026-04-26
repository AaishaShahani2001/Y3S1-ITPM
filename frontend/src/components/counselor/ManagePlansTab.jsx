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
  FaLock,
  FaEyeSlash,
  FaPaperPlane,
} from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:3000";

const treatmentIdeas = [
  "Exam Anxiety Management Plan",
  "Stress Reduction & Breathing Routine",
  "Confidence Building Plan",
  "Time Management & Study Discipline",
  "Motivation Recovery Plan",
  "Custom / Other",
];

function normalizeCounselorAppointment(row) {
  const id = row.id ?? row.ID;
  return {
    id,
    studentId: row.studentId ?? row.student_id,
    studentName: row.studentName || row.student_name || "Unknown student",
    date: row.date || "",
    timeSlot: row.timeSlot || row.time_slot || "",
    mood: row.mood || "",
    status: row.status || "",
  };
}

function emptyStepsDoc() {
  return {
    recommendations: {
      dailyRoutine: "",
      readingMaterials: "",
      exercisePlan: "",
    },
    steps: Array.from({ length: 4 }, () => ({
      title: "",
      notes: "",
      completed: false,
      student_comment: "",
      student_file_name: "",
      student_file_data: "",
      student_file_type: "",
      counsellor_comment: "",
    })),
  };
}

function parseStepsData(raw) {
  if (!raw) return emptyStepsDoc();
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (
      o &&
      Array.isArray(o.steps) &&
      o.steps.length === 4 &&
      o.recommendations
    ) {
      return {
        recommendations: {
          dailyRoutine: o.recommendations.dailyRoutine || "",
          readingMaterials: o.recommendations.readingMaterials || "",
          exercisePlan: o.recommendations.exercisePlan || "",
        },
        steps: o.steps.map((s) => ({
          title: s.title || "",
          notes: s.notes || "",
          completed: !!s.completed,
          student_comment: s.student_comment || "",
          student_file_name: s.student_file_name || "",
          student_file_data: s.student_file_data || "",
          student_file_type: s.student_file_type || "",
          counsellor_comment: s.counsellor_comment || "",
        })),
      };
    }
  } catch {
    /* fall through */
  }
  return emptyStepsDoc();
}

function formatUpdated(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
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
  const [expandedStepId, setExpandedStepId] = useState(null);
  const [detailCommentsDraft, setDetailCommentsDraft] = useState(null);
  /** Which step index is currently saving feedback (null = none). */
  const [savingFeedbackStep, setSavingFeedbackStep] = useState(null);
  const [deleteConfirmPlanId, setDeleteConfirmPlanId] = useState(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  const fetchPlans = useCallback(() => {
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
            const doc = parseStepsData(plan.steps_data);
            const done = doc.steps.filter((s) => s.completed).length;
            return {
              id: plan.id,
              appointmentId: plan.appointment_id,
              studentId: plan.student_id,
              student: plan.student_name || "Student ID: " + plan.student_id,
              caseId: "CASE-" + plan.id,
              status: plan.status || "Active",
              progress: Math.round((done / 4) * 100),
              treatmentIdea: plan.description,
              primaryObjective: plan.title,
              lastUpdated: formatUpdated(plan.updated_at),
              updatedAt: plan.updated_at,
              counsellorName: plan.counsellor_name || "Counsellor",
              stepsDoc: doc,
            };
          })
        );
      })
      .catch((err) => {
        console.error("Error fetching plans:", err);
        setPlans([]);
      });
  }, []);

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
  }, [fetchPlans, fetchCounselorAppointments]);

  const [formData, setFormData] = useState(() => ({
    appointmentId: "",
    treatmentIdea: "",
    primaryObjective: "",
    status: "Active",
    recommendations: {
      dailyRoutine: "",
      readingMaterials: "",
      exercisePlan: "",
    },
    steps: Array.from({ length: 4 }, () => ({ title: "", notes: "" })),
  }));

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

  /** Appointments that already have a plan are shown disabled (except the one being edited). */
  const isAppointmentSelectDisabled = useCallback(
    (a) => {
      const idStr = String(a.id);
      if (!appointmentIdsWithPlans.has(idStr)) return false;
      if (isEditing && editingPlanId != null) {
        const current = plans.find((p) => p.id === editingPlanId);
        if (current && String(current.appointmentId) === idStr) return false;
      }
      return true;
    },
    [appointmentIdsWithPlans, isEditing, editingPlanId, plans]
  );

  const selectableAppointmentCount = useMemo(
    () => counselorAppointments.filter((a) => !isAppointmentSelectDisabled(a)).length,
    [counselorAppointments, isAppointmentSelectDisabled]
  );

  const handleValidation = () => {
    const newErrors = {};
    if (!formData.appointmentId) newErrors.appointmentId = "Select an appointment";
    if (!formData.treatmentIdea) newErrors.treatmentIdea = "Select a treatment idea";
    if (!formData.primaryObjective.trim()) newErrors.primaryObjective = "Primary objective is required";
    if (!formData.recommendations.dailyRoutine.trim()) newErrors.dailyRoutine = "Daily routine is required";
    if (!formData.recommendations.readingMaterials.trim()) newErrors.readingMaterials = "Reading materials are required";
    if (!formData.recommendations.exercisePlan.trim()) newErrors.exercisePlan = "Exercise plan is required";
    formData.steps.forEach((s, i) => {
      if (!s.title.trim()) newErrors[`stepTitle${i}`] = `Step ${i + 1} title is required`;
      if (!s.notes.trim()) newErrors[`stepNotes${i}`] = `Step ${i + 1} notes are required`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      appointmentId: "",
      treatmentIdea: "",
      primaryObjective: "",
      status: "Active",
      recommendations: {
        dailyRoutine: "",
        readingMaterials: "",
        exercisePlan: "",
      },
      steps: Array.from({ length: 4 }, () => ({ title: "", notes: "" })),
    });
    setErrors({});
  };

  const handleBackToPlans = () => {
    setIsCreating(false);
    setIsEditing(false);
    setEditingPlanId(null);
    setSelectedPlan(null);
    setExpandedStepId(null);
    setDetailCommentsDraft(null);
    setSavingFeedbackStep(null);
    setDeleteConfirmPlanId(null);
    setIsDeletingPlan(false);
    resetForm();
  };

  const buildStepsPayload = (selectedAppointment, existingDoc) => {
    const base = existingDoc || emptyStepsDoc();
    return {
      recommendations: { ...formData.recommendations },
      steps: formData.steps.map((s, i) => ({
        title: s.title.trim(),
        notes: s.notes.trim(),
        completed: base.steps[i]?.completed || false,
        student_comment: base.steps[i]?.student_comment || "",
        student_file_name: base.steps[i]?.student_file_name || "",
        student_file_data: base.steps[i]?.student_file_data || "",
        student_file_type: base.steps[i]?.student_file_type || "",
        counsellor_comment: base.steps[i]?.counsellor_comment || "",
      })),
    };
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
      toast.info("This appointment already has a treatment plan.");
      return;
    }

    const counsellorId = user?.id;
    if (!counsellorId) {
      toast.error("You must be logged in as a counsellor.");
      return;
    }

    const existing = isEditing
      ? plans.find((p) => p.id === editingPlanId)?.stepsDoc
      : null;
    const steps_data = buildStepsPayload(selectedAppointment, existing);

    const headers = {
      "Content-Type": "application/json",
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
    };

    if (isEditing) {
      fetch(`${API_BASE_URL}/api/treatment-plans/${editingPlanId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          appointment_id: selectedAppointment.id,
          counsellor_id: counsellorId,
          student_id: selectedAppointment.studentId,
          title: formData.primaryObjective,
          description: formData.treatmentIdea,
          status: formData.status,
          steps_data,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to update");
          return res.json();
        })
        .then(() => {
          fetchPlans();
          toast.success("Treatment plan updated successfully!");
          handleBackToPlans();
        })
        .catch((err) => {
          console.error("Error updating treatment plan:", err);
          toast.error("Failed to update treatment plan");
        });
      return;
    }

    fetch(`${API_BASE_URL}/api/treatment-plans`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        appointment_id: selectedAppointment.id,
        counsellor_id: counsellorId,
        student_id: selectedAppointment.studentId,
        title: formData.primaryObjective,
        description: formData.treatmentIdea,
        status: formData.status || "Active",
        steps_data,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchPlans();
        toast.success("Treatment plan added successfully!");
        handleBackToPlans();
      })
      .catch((err) => {
        console.error("Error adding treatment plan:", err);
        toast.error("Failed to add treatment plan");
      });
  };

  const handleEdit = (plan) => {
    if (plan.status === "Completed") {
      toast.info("Completed treatment plans cannot be edited.");
      return;
    }

    setIsEditing(true);
    setIsCreating(true);
    setSelectedPlan(null);
    setEditingPlanId(plan.id);
    const doc = plan.stepsDoc || emptyStepsDoc();
    setFormData({
      appointmentId: String(plan.appointmentId),
      treatmentIdea: plan.treatmentIdea,
      primaryObjective: plan.primaryObjective,
      status: plan.status,
      recommendations: { ...doc.recommendations },
      steps: doc.steps.map((s) => ({
        title: s.title,
        notes: s.notes,
      })),
    });
    setErrors({});
  };

  const handleDelete = (planId) => {
    setDeleteConfirmPlanId(planId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmPlanId == null) return;
    setIsDeletingPlan(true);

    const u = JSON.parse(localStorage.getItem("user") || "null");
    fetch(`${API_BASE_URL}/api/treatment-plans/${deleteConfirmPlanId}`, {
      method: "DELETE",
      headers: u?.token ? { Authorization: `Bearer ${u.token}` } : {},
    })
      .then((res) => res.json())
      .then(() => {
        fetchPlans();
        toast.success("Treatment plan deleted successfully!");
        setDeleteConfirmPlanId(null);
      })
      .catch((err) => {
        console.error("Error deleting treatment plan:", err);
        toast.error("Failed to delete treatment plan");
      })
      .finally(() => {
        setIsDeletingPlan(false);
      });
  };

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setIsCreating(false);
    setIsEditing(false);
    setExpandedStepId(null);
    const doc = plan.stepsDoc || emptyStepsDoc();
    setDetailCommentsDraft(doc.steps.map((s) => s.counsellor_comment || ""));
  };

  /** Sends all step comments (API expects full document); called per-step so counselors can publish one step at a time. */
  const sendFeedbackForStep = (stepIndex) => {
    if (!selectedPlan || !detailCommentsDraft) return;
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u?.token) return;

    const doc = selectedPlan.stepsDoc || emptyStepsDoc();
    const step = doc.steps[stepIndex];
    if (!step?.completed) {
      toast.info("You can add feedback only after the student marks this step complete.");
      return;
    }
    const steps_data = {
      recommendations: { ...doc.recommendations },
      steps: doc.steps.map((s, i) => ({
        ...s,
        counsellor_comment: detailCommentsDraft[i] || "",
      })),
    };

    setSavingFeedbackStep(stepIndex);
    fetch(`${API_BASE_URL}/api/treatment-plans/${selectedPlan.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${u.token}`,
      },
      body: JSON.stringify({
        appointment_id: selectedPlan.appointmentId,
        counsellor_id: u.id,
        student_id: selectedPlan.studentId,
        title: selectedPlan.primaryObjective,
        description: selectedPlan.treatmentIdea,
        status: selectedPlan.status,
        steps_data,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() =>
        fetch(`${API_BASE_URL}/api/treatment-plans/${selectedPlan.id}`, {
          headers: { Authorization: `Bearer ${u.token}` },
        })
      )
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((row) => {
        const doc = parseStepsData(row.steps_data);
        const done = doc.steps.filter((s) => s.completed).length;
        setSelectedPlan({
          id: row.id,
          appointmentId: row.appointment_id,
          studentId: row.student_id,
          student: row.student_name || "Student ID: " + row.student_id,
          caseId: "CASE-" + row.id,
          status: row.status || "Active",
          progress: Math.round((done / 4) * 100),
          treatmentIdea: row.description,
          primaryObjective: row.title,
          lastUpdated: formatUpdated(row.updated_at),
          updatedAt: row.updated_at,
          counsellorName: row.counsellor_name || "Counsellor",
          stepsDoc: doc,
        });
        setDetailCommentsDraft(doc.steps.map((s) => s.counsellor_comment || ""));
        fetchPlans();
        toast.success(`Step ${stepIndex + 1} feedback sent to the student.`);
      })
      .catch(() => {
        toast.error("Could not send feedback. Try again.");
      })
      .finally(() => setSavingFeedbackStep(null));
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

  const detailSteps = selectedPlan
    ? (selectedPlan.stepsDoc || emptyStepsDoc()).steps
    : [];

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Treatment Plans Hub
        </h2>

        {!isCreating && !selectedPlan && (
          <button
            type="button"
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

      {!isCreating && !selectedPlan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-sm flex flex-col gap-4">
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

          <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-sm flex flex-col gap-4">
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

          <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-sm flex flex-col gap-4">
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

      {isCreating && (
        <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8 animate-slideUp">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <button
                type="button"
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
                    Editing plan for case #
                    {plans.find((p) => p.id === editingPlanId)?.caseId}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
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
                  className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${
                    errors.appointmentId
                      ? "border-red-300"
                      : "border-transparent focus:ring-2 focus:ring-blue-100"
                  } ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {appointmentsLoading
                      ? "Loading appointments…"
                      : counselorAppointments.length === 0
                        ? "No appointments available"
                        : !isEditing && selectableAppointmentCount === 0
                          ? "No free appointments (all have a plan)"
                          : "-- Select Appointment --"}
                  </option>
                  {counselorAppointments.map((a) => {
                    const disabled = isAppointmentSelectDisabled(a);
                    return (
                      <option key={a.id} value={String(a.id)} disabled={disabled}>
                        {a.studentName} — {a.date} {a.timeSlot}
                        {a.mood ? ` · ${a.mood}` : ""} ({a.status})
                        {disabled ? " — treatment plan already added" : ""}
                      </option>
                    );
                  })}
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
                  className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${
                    errors.treatmentIdea
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
                className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${
                  errors.primaryObjective
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
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-6">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                Four treatment steps (student completes in order)
              </label>
              {formData.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
                >
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Step {idx + 1}
                  </p>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const next = [...formData.steps];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setFormData({ ...formData, steps: next });
                    }}
                    placeholder="Step title"
                    className={`w-full p-3 bg-white border-2 rounded-xl text-sm font-bold outline-none ${
                      errors[`stepTitle${idx}`] ? "border-red-300" : "border-transparent"
                    }`}
                  />
                  {errors[`stepTitle${idx}`] && (
                    <p className="text-red-500 text-[10px] font-bold">
                      {errors[`stepTitle${idx}`]}
                    </p>
                  )}
                  <textarea
                    rows={3}
                    value={step.notes}
                    onChange={(e) => {
                      const next = [...formData.steps];
                      next[idx] = { ...next[idx], notes: e.target.value };
                      setFormData({ ...formData, steps: next });
                    }}
                    placeholder="Instructions / notes for the student"
                    className={`w-full p-3 bg-white border-2 rounded-xl text-sm font-bold outline-none ${
                      errors[`stepNotes${idx}`] ? "border-red-300" : "border-transparent"
                    }`}
                  />
                  {errors[`stepNotes${idx}`] && (
                    <p className="text-red-500 text-[10px] font-bold">
                      {errors[`stepNotes${idx}`]}
                    </p>
                  )}
                </div>
              ))}
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
                    className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${
                      errors.dailyRoutine
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
                    className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${
                      errors.readingMaterials
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
                    className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${
                      errors.exercisePlan
                        ? "border-red-300"
                        : "border-transparent focus:ring-2 focus:ring-blue-100"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all"
              >
                {isEditing ? "Update Treatment Plan" : "Generate & Publish Plan"}
              </button>
              <button
                type="button"
                onClick={handleBackToPlans}
                className="px-8 bg-white border-2 border-slate-100 text-slate-500 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:border-slate-300 hover:text-slate-800 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="space-y-8">
          <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between border-b border-slate-50 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToPlans}
                  className="w-11 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-all"
                  title="Back to Treatment Plans"
                >
                  <FaArrowLeft />
                </button>

                <div>
                  <h3 className="text-xl font-black text-slate-900">Plan Details</h3>
                  <p className="text-sm text-slate-400">
                    Student:{" "}
                    <span className="font-bold text-slate-700">{selectedPlan.student}</span>
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Updated {selectedPlan.lastUpdated}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-3 text-slate-900">
                    <FaCheckCircle className="text-blue-600" /> Treatment Steps
                  </h3>

                  <div className="text-sm font-bold text-slate-600">
                    Progress: {selectedPlan.progress}%
                  </div>
                </div>

                <div className="space-y-5">
                  {detailSteps.map((step, index) => {
                    const isLocked =
                      index > 0 &&
                      !detailSteps[index - 1].completed &&
                      !step.completed;

                    return (
                      <div
                        key={index}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <input
                              type="checkbox"
                              checked={step.completed}
                              readOnly
                              className="mt-1 w-5 h-5 accent-blue-600 cursor-default"
                            />

                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="font-black text-slate-800 text-base">
                                  Step {index + 1}
                                </h4>

                                {step.completed ? (
                                  <span className="text-xs font-black px-3 py-1 rounded-lg bg-green-100 text-green-700">
                                    Completed
                                  </span>
                                ) : isLocked ? (
                                  <span className="text-xs font-black px-3 py-1 rounded-lg bg-amber-50 text-amber-700 flex items-center gap-2">
                                    <FaLock /> Locked
                                  </span>
                                ) : (
                                  <span className="text-xs font-black px-3 py-1 rounded-lg bg-blue-50 text-blue-700">
                                    Current Step
                                  </span>
                                )}
                              </div>

                              <p className="mt-3 text-slate-600 font-medium">{step.title}</p>

                              <p className="mt-2 text-[11px] text-slate-400 font-medium">
                                Use the eye icon for step details. Feedback can be added only after the
                                student completes this step.
                              </p>

                              <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  expandedStepId === index
                                    ? "max-h-300 opacity-100 mt-4"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                  <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      Step instructions
                                    </p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                      {step.notes}
                                    </p>
                                    {step.student_comment ? (
                                      <p className="text-sm text-slate-700">
                                        <span className="font-black">Student:</span>{" "}
                                        {step.student_comment}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic">
                                        No student comment on this step yet.
                                      </p>
                                    )}
                                    {step.student_file_name && (
                                      <p className="text-sm text-slate-700">
                                        <span className="font-black">Uploaded file:</span>{" "}
                                        {step.student_file_data ? (
                                          <a
                                            href={step.student_file_data}
                                            download={step.student_file_name}
                                            className="text-blue-600 hover:text-blue-700 underline"
                                          >
                                            {step.student_file_name}
                                          </a>
                                        ) : (
                                          step.student_file_name
                                        )}
                                      </p>
                                    )}
                                  </div>

                                  <div className="pt-2 border-t border-slate-200 space-y-2">
                                    {step.completed ? (
                                      <>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-blue-800/90">
                                          Your feedback to the student (optional)
                                        </label>
                                        <p className="text-[11px] text-slate-600 leading-snug">
                                          Visible on the student&apos;s Treatment Plan after you send
                                          it for this step.
                                        </p>
                                        <textarea
                                          rows={3}
                                          value={detailCommentsDraft?.[index] ?? ""}
                                          onChange={(e) => {
                                            const next = [...(detailCommentsDraft || [])];
                                            next[index] = e.target.value;
                                            setDetailCommentsDraft(next);
                                          }}
                                          className="w-full p-3 rounded-xl border border-blue-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-200"
                                          placeholder="Encouragement, guidance, or notes for this step…"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => sendFeedbackForStep(index)}
                                          disabled={savingFeedbackStep !== null}
                                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                        >
                                          <FaPaperPlane className="text-xs" />
                                          {savingFeedbackStep === index
                                            ? "Sending…"
                                            : "Send feedback for this step"}
                                        </button>
                                      </>
                                    ) : (
                                      <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-900 font-medium leading-relaxed">
                                        <span className="font-black">Feedback locked.</span> The
                                        student must mark this step complete before you can add
                                        counsellor comments.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedStepId(expandedStepId === index ? null : index)
                            }
                            className="text-slate-400 hover:text-blue-500 transition-colors p-2"
                            title={expandedStepId === index ? "Hide Details" : "View Details"}
                          >
                            {expandedStepId === index ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                  <FaExclamationCircle className="text-blue-400" /> Recommendations
                </h3>

                <div className="space-y-6">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                      Daily Routine
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {(selectedPlan.stepsDoc || emptyStepsDoc()).recommendations.dailyRoutine}
                    </p>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                      Reading Materials
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {(selectedPlan.stepsDoc || emptyStepsDoc()).recommendations.readingMaterials}
                    </p>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                      Exercise Plan
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {(selectedPlan.stepsDoc || emptyStepsDoc()).recommendations.exercisePlan}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isCreating && !selectedPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white p-8 rounded-4xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-black text-slate-900 mb-1">{plan.student}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Case ID: {plan.caseId}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1 text-[9px] font-black uppercase px-3 py-1.5 rounded-lg ${
                    plan.status === "Active"
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
                  type="button"
                  onClick={() => handleView(plan)}
                  className="flex-1 py-3 bg-slate-50 text-blue-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye size={14} /> View Details
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(plan)}
                  disabled={plan.status === "Completed"}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md shadow-slate-200 ${
                    plan.status === "Completed"
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-slate-900 text-white hover:bg-black"
                  }`}
                >
                  <FaEdit size={14} /> Edit Plan
                </button>
                <button
                  type="button"
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

      {deleteConfirmPlanId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-plan-title"
          onClick={() => !isDeletingPlan && setDeleteConfirmPlanId(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-plan-title" className="text-lg font-black text-slate-800">
              Delete this treatment plan?
            </h3>
            <p className="text-sm text-slate-500">
              This action cannot be undone. The plan will be permanently removed.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2">
              <button
                type="button"
                disabled={isDeletingPlan}
                onClick={() => setDeleteConfirmPlanId(null)}
                className="px-5 py-2.5 rounded-xl font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPlan}
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeletingPlan ? "Deleting..." : "Delete plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}