import React, { useState, useEffect } from "react";
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
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:3000";

// Dummy Appointments
const appointments = [
  {
    id: 1,
    student: "Anjali Kumar",
    caseId: "C102",
    date: "2026-03-28",
    time: "10:00 AM",
    issue: "Exam Anxiety",
  },
  {
    id: 2,
    student: "Rahul Singh",
    caseId: "C091",
    date: "2026-03-29",
    time: "02:00 PM",
    issue: "Academic Stress",
  },
  {
    id: 3,
    student: "Maya Reddy",
    caseId: "C110",
    date: "2026-03-30",
    time: "11:30 AM",
    issue: "Low Motivation",
  },
  {
    id: 4,
    student: "Karan Patel",
    caseId: "C087",
    date: "2026-03-31",
    time: "09:30 AM",
    issue: "Severe Anxiety",
  },
];

const treatmentIdeas = [
  "Exam Anxiety Management Plan",
  "Stress Reduction & Breathing Routine",
  "Confidence Building Plan",
  "Time Management & Study Discipline",
  "Motivation Recovery Plan",
  "Custom / Other",
];

// Dummy Plans
const initialPlans = [
  {
    id: 101,
    appointmentId: 1,
    student: "Anjali Kumar",
    caseId: "C102",
    status: "Active",
    progress: 60,
    treatmentIdea: "Exam Anxiety Management Plan",
    primaryObjective: "Reduce exam fear and improve confidence",
    lastUpdated: "2 days ago",
    recommendations: {
      dailyRoutine: "Follow a 2-hour structured study block daily",
      readingMaterials: "Short notes and past papers",
      exercisePlan: "10 minutes breathing exercise before study",
    },
  },
  {
    id: 102,
    appointmentId: 2,
    student: "Rahul Singh",
    caseId: "C091",
    status: "Completed",
    progress: 100,
    treatmentIdea: "Stress Reduction & Breathing Routine",
    primaryObjective: "Manage stress better during academic tasks",
    lastUpdated: "Today",
    recommendations: {
      dailyRoutine: "Morning reflection and study planning",
      readingMaterials: "Stress awareness handout",
      exercisePlan: "Guided breathing and stretching",
    },
  },
  {
    id: 103,
    appointmentId: 3,
    student: "Maya Reddy",
    caseId: "C110",
    status: "Pending",
    progress: 30,
    treatmentIdea: "Motivation Recovery Plan",
    primaryObjective: "Improve consistency and focus",
    lastUpdated: "1 week ago",
    recommendations: {
      dailyRoutine: "Use daily checklist and planner",
      readingMaterials: "Motivational study guide",
      exercisePlan: "20 minute walk every evening",
    },
  },
  {
    id: 104,
    appointmentId: 4,
    student: "Karan Patel",
    caseId: "C087",
    status: "Needs Attention",
    progress: 20,
    treatmentIdea: "Confidence Building Plan",
    primaryObjective: "Reduce panic and improve emotional control",
    lastUpdated: "3 days ago",
    recommendations: {
      dailyRoutine: "Maintain calm routine and sleep schedule",
      readingMaterials: "Counsellor-provided calming guide",
      exercisePlan: "Grounding exercise twice daily",
    },
  },
];

export default function ManagePlansTab() {
  const [plans, setPlans] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expandedStepId, setExpandedStepId] = useState(null);

const fetchPlans = () => {
  fetch(`${API_BASE_URL}/api/treatment-plans`)
    .then((res) => res.json())
    .then((data) => {
  setPlans(
  data.map((plan) => ({
    id: plan.id,
    appointmentId: plan.appointment_id,
   student: plan.student_name || "Student ID: " + plan.student_id,
    caseId: "CASE-" + plan.id,
    status: plan.status === "pending" ? "Pending" : plan.status,
    progress: plan.status === "Completed" ? 100 : 50,
    treatmentIdea: plan.description,
    primaryObjective: plan.title,
    lastUpdated: "Just now",
    counsellorName: plan.counsellor_name || "Counsellor",
    recommendations: {
      dailyRoutine: "Follow routine",
      readingMaterials: "Provided",
      exercisePlan: "Breathing exercise",
    },
  }))
);
    })
    .catch((err) => {
      console.error("Error fetching plans:", err);
    });
};

useEffect(() => {
  fetchPlans();
}, []);

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

    const selectedAppointment = appointments.find(
      (a) => a.id.toString() === formData.appointmentId
    );

    if (!selectedAppointment) return;

 if (isEditing) {
  const updatedPlan = {
    appointment_id: selectedAppointment.id,
    counsellor_id: 1,
    student_id: selectedAppointment.student_id || 2,
    title: formData.primaryObjective,
    description: formData.treatmentIdea,
    status: formData.status,
  };

  fetch(`${API_BASE_URL}/api/treatment-plans/${editingPlanId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
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
    counsellor_id: 1,
    student_id: selectedAppointment.student_id || 2,
    title: formData.primaryObjective,
    description: formData.treatmentIdea,
    status: formData.status,
  };

  fetch(`${API_BASE_URL}/api/treatment-plans`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
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
    setExpandedStepId(null);
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

  const getStudentSteps = (plan) => {
    if (!plan) return [];

    const baseCompleted = plan.progress >= 25;
    const secondCompleted = plan.progress >= 50;
    const thirdCompleted = plan.progress >= 75;
    const fourthCompleted = plan.progress >= 100;

    if (plan.treatmentIdea === "Exam Anxiety Management Plan") {
      return [
        {
          id: 1,
          title: "Follow Structured Study Schedule",
          date: "Feb 10, 2026",
          completed: baseCompleted,
          notes:
            "Follow the study timetable prepared by the counselor with realistic daily targets and short breaks.",
        },
        {
          id: 2,
          title: "Practice Daily Anxiety Reduction Exercise",
          date: "Feb 17, 2026",
          completed: secondCompleted,
          notes:
            "Complete 10 minutes of breathing and grounding exercises before each study session.",
        },
        {
          id: 3,
          title: "Submit Weekly Stress Reflection",
          date: "Feb 24, 2026",
          completed: thirdCompleted,
          notes:
            "Write a short reflection about exam fear, concentration level, and emotional changes.",
        },
        {
          id: 4,
          title: "Attend Follow-Up Progress Review",
          date: "Mar 03, 2026",
          completed: fourthCompleted,
          notes:
            "Attend the next counseling review and discuss improvements and remaining difficulties.",
        },
      ];
    }

    if (plan.treatmentIdea === "Stress Reduction & Breathing Routine") {
      return [
        {
          id: 1,
          title: "Morning Breathing Practice",
          date: "Feb 10, 2026",
          completed: baseCompleted,
          notes: "Practice guided breathing each morning for at least 10 minutes.",
        },
        {
          id: 2,
          title: "Stress Trigger Journal",
          date: "Feb 17, 2026",
          completed: secondCompleted,
          notes: "Write down daily stress triggers and coping responses.",
        },
        {
          id: 3,
          title: "Weekly Relaxation Review",
          date: "Feb 24, 2026",
          completed: thirdCompleted,
          notes: "Review what activities help reduce stress most effectively.",
        },
        {
          id: 4,
          title: "Counselor Follow-Up Session",
          date: "Mar 03, 2026",
          completed: fourthCompleted,
          notes: "Meet the counselor and review stress management progress.",
        },
      ];
    }

    return [
      {
        id: 1,
        title: "Daily Routine Adjustment",
        date: "Feb 10, 2026",
        completed: baseCompleted,
        notes: plan.recommendations.dailyRoutine,
      },
      {
        id: 2,
        title: "Reading / Reflection Task",
        date: "Feb 17, 2026",
        completed: secondCompleted,
        notes: plan.recommendations.readingMaterials,
      },
      {
        id: 3,
        title: "Exercise and Coping Practice",
        date: "Feb 24, 2026",
        completed: thirdCompleted,
        notes: plan.recommendations.exercisePlan,
      },
      {
        id: 4,
        title: "Follow-Up Review Session",
        date: "Mar 03, 2026",
        completed: fourthCompleted,
        notes: "Attend review session and discuss plan outcomes with the counselor.",
      },
    ];
  };

  const detailSteps = getStudentSteps(selectedPlan);

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
                  disabled={isEditing}
                  className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-sm font-bold outline-none transition-all ${errors.appointmentId
                      ? "border-red-300"
                      : "border-transparent focus:ring-2 focus:ring-blue-100"
                    } ${isEditing ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <option value="">-- Select Appointment --</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.student} - {a.date} - {a.issue}
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
                      index > 0 && !detailSteps[index - 1].completed && !step.completed;

                    return (
                      <div
                        key={step.id}
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
                                  Step {step.id} | {step.date}
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

                              <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedStepId === step.id
                                    ? "max-h-40 opacity-100 mt-4"
                                    : "max-h-0 opacity-0"
                                  }`}
                              >
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {step.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setExpandedStepId(expandedStepId === step.id ? null : step.id)
                            }
                            className="text-slate-400 hover:text-blue-500 transition-colors p-2"
                            title={expandedStepId === step.id ? "Hide Details" : "View Details"}
                          >
                            {expandedStepId === step.id ? (
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
                      {selectedPlan.recommendations.dailyRoutine}
                    </p>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                      Reading Materials
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {selectedPlan.recommendations.readingMaterials}
                    </p>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                      Exercise Plan
                    </p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                      {selectedPlan.recommendations.exercisePlan}
                    </p>
                  </div>
                </div>

                <button className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/50">
                  Download Plan PDF
                </button>
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