import React, { useState, useEffect, useCallback } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaFilePdf,
  FaPaperclip,
} from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE_URL = "http://localhost:3000";

function formatPlanDate(iso) {
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

function mapApiPlanToStep(p) {
  const st = (p.status || "").trim();
  const completed = st.toLowerCase() === "completed";
  const updated =
    p.updated_at || p.updatedAt || p.UpdatedAt || null;
  return {
    id: p.id,
    appointmentId: p.appointment_id ?? p.appointmentId,
    counsellorId: p.counsellor_id ?? p.counsellorId,
    studentId: p.student_id ?? p.studentId,
    counsellorName: p.counsellor_name || p.counsellorName || "",
    title: p.title || "Treatment plan",
    notes: p.description || "",
    date: formatPlanDate(updated),
    completed,
    studentComment: "",
    attachment: null,
  };
}

export default function TreatmentPlanTab({ onViewReport }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [expandedStepId, setExpandedStepId] = useState(null);
  const [pendingConfirmStepId, setPendingConfirmStepId] = useState(null);

  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadPlans = useCallback(async () => {
    if (!user?.id || !user?.token) {
      setLoadError("Please sign in to view treatment plans.");
      setSteps([]);
      setLoading(false);
      return;
    }

    const studentId = String(user.id);

    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/treatment-plans/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (res.status === 401) {
        setLoadError("Session expired. Please sign in again.");
        setSteps([]);
        return;
      }

      if (res.status === 403) {
        const err = await res.json().catch(() => ({}));
        setLoadError(err.error || "You cannot view these treatment plans.");
        setSteps([]);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load treatment plans");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => a.id - b.id);
      setSteps(sorted.map(mapApiPlanToStep));

      const times = sorted
        .map((p) => {
          const u = p.updated_at || p.updatedAt;
          return u ? new Date(u).getTime() : 0;
        })
        .filter(Boolean);
      if (times.length) {
        setLastUpdated(new Date(Math.max(...times)));
      } else {
        setLastUpdated(null);
      }
    } catch (e) {
      setLoadError(e.message || "Failed to load treatment plans");
      setSteps([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.token]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const toggleStepDetails = (id) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const handleCheckboxClick = (id) => {
    const currentIndex = steps.findIndex((step) => step.id === id);
    if (currentIndex === -1) return;

    if (currentIndex > 0 && !steps[currentIndex - 1].completed) {
      toast.warning(
        `Finish step ${currentIndex} before completing this step.`
      );
      return;
    }

    setExpandedStepId(id);
    setPendingConfirmStepId(id);
  };

  const handleCommentChange = (id, value) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, studentComment: value } : step
      )
    );
  };

  const handleAttachmentChange = (id, file) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, attachment: file || null } : step
      )
    );
  };

  const handleConfirmCompletion = async (id) => {
    const step = steps.find((s) => s.id === id);
    if (!step || !user?.token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/treatment-plans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          appointment_id: step.appointmentId,
          counsellor_id: step.counsellorId,
          student_id: step.studentId,
          title: step.title,
          description: step.notes,
          status: "Completed",
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not mark step complete");
      }

      const currentIndex = steps.findIndex((s) => s.id === id);
      if (currentIndex === -1) return;

      setSteps((prev) => {
        const next = [...prev];
        next[currentIndex] = { ...next[currentIndex], completed: true };
        return next;
      });
      setPendingConfirmStepId(null);
      toast.success("Step marked complete");
      await loadPlans();
    } catch (e) {
      toast.error(e.message || "Update failed");
    }
  };

  const handleCancelConfirmation = () => {
    setPendingConfirmStepId(null);
  };

  const getProgress = () => {
    if (!steps.length) return 0;
    const completedCount = steps.filter((step) => step.completed).length;
    return Math.round((completedCount / steps.length) * 100);
  };

  const allStepsCompleted =
    steps.length > 0 && steps.every((step) => step.completed);

  if (loading) {
    return (
      <div className="animate-fadeIn space-y-6">
        <h2 className="text-2xl font-black tracking-tight">
          Active Treatment Plan
        </h2>
        <p className="text-slate-500 font-medium">Loading your plans…</p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-black tracking-tight">
          Active Treatment Plan
        </h2>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full">
          Last Updated:{" "}
          {lastUpdated
            ? lastUpdated.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—"}
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100 flex items-start gap-2">
          <FaExclamationCircle className="mt-0.5 shrink-0" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE - STEP BY STEP PLAN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
              <FaCheckCircle className="text-blue-600" /> Treatment Steps
            </h3>

            <div className="text-sm font-bold text-slate-600">
              Progress: {getProgress()}%
            </div>
          </div>

          {!steps.length && !loadError && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-slate-600 font-medium">
              No treatment plans assigned yet. Your counsellor will add steps
              here when ready.
            </div>
          )}

          <div className="space-y-5">
            {steps.map((step, index) => {
              const isLocked =
                index > 0 && !steps[index - 1].completed && !step.completed;

              const isPendingConfirm = pendingConfirmStepId === step.id;

              return (
                <div
                  key={step.id}
                  className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${
                    isLocked ? "cursor-not-allowed" : "cursor-default"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={step.completed}
                        disabled={step.completed}
                        onChange={() => handleCheckboxClick(step.id)}
                        onClick={(e) => {
                          if (step.completed) {
                            e.preventDefault();
                          }
                        }}
                        className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
                      />

                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-black text-slate-800 text-base">
                            Step {index + 1} | {step.date}
                          </h4>

                          {step.completed ? (
                            <span className="text-xs font-black px-3 py-1 rounded-lg bg-green-100 text-green-700">
                              Completed
                            </span>
                          ) : isLocked ? (
                            <span className="text-xs font-black px-3 py-1 rounded-lg bg-amber-50 text-amber-700 flex items-center gap-2">
                              <FaLock /> Locked
                            </span>
                          ) : isPendingConfirm ? (
                            <span className="text-xs font-black px-3 py-1 rounded-lg bg-red-50 text-red-700">
                              Confirmation Required
                            </span>
                          ) : (
                            <span className="text-xs font-black px-3 py-1 rounded-lg bg-blue-50 text-blue-700">
                              Current Step
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-slate-600 font-medium">
                          {step.title}
                        </p>
                        {step.counsellorName && (
                          <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-wide">
                            Counsellor: {step.counsellorName}
                          </p>
                        )}

                        <div
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            expandedStepId === step.id
                              ? "max-h-[900px] opacity-100 mt-4"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                                Additional Notes
                              </label>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {step.notes || "—"}
                              </p>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                              <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                                Student Submission
                              </label>

                              <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                  Student Comment (Optional)
                                </label>
                                <textarea
                                  rows={3}
                                  value={step.studentComment}
                                  onChange={(e) =>
                                    handleCommentChange(
                                      step.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Add your short comment about how you completed this step..."
                                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                  Supporting File (Optional)
                                </label>

                                <div className="flex items-center gap-3 flex-wrap">
                                  <label className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 cursor-pointer hover:border-blue-300 transition-all">
                                    <FaFilePdf className="text-red-500" />
                                    <FaPaperclip className="text-slate-400" />
                                    Upload PDF / Image / Document
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,image/*"
                                      className="hidden"
                                      onChange={(e) =>
                                        handleAttachmentChange(
                                          step.id,
                                          e.target.files?.[0] || null
                                        )
                                      }
                                    />
                                  </label>

                                  {step.attachment && (
                                    <span className="text-sm text-slate-500 font-medium">
                                      {step.attachment.name}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isPendingConfirm && !step.completed && (
                                <div className="pt-2 flex gap-3 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleConfirmCompletion(step.id)
                                    }
                                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                  >
                                    Confirm Step Completion
                                  </button>

                                  <button
                                    type="button"
                                    onClick={handleCancelConfirmation}
                                    className="px-5 py-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}

                              {step.completed && (
                                <div className="pt-2 space-y-2">
                                  {step.studentComment && (
                                    <div className="text-sm text-slate-600">
                                      <span className="font-black text-slate-700">
                                        Submitted Comment:
                                      </span>{" "}
                                      {step.studentComment}
                                    </div>
                                  )}

                                  {step.attachment && (
                                    <div className="text-sm text-slate-600 flex items-center gap-2">
                                      <FaFilePdf className="text-red-500" />
                                      <span className="font-medium">
                                        {step.attachment.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(step.completed || !isLocked) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepDetails(step.id);
                        }}
                        className="text-slate-400 hover:text-blue-500 transition-colors p-2"
                        title={
                          expandedStepId === step.id
                            ? "Hide Details"
                            : "View Details"
                        }
                      >
                        {expandedStepId === step.id ? (
                          <FaEyeSlash size={16} />
                        ) : (
                          <FaEye size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end mt-6">
            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={() => {
                  if (!allStepsCompleted) {
                    toast.info(
                      "Please complete all treatment steps before viewing the report."
                    );
                    return;
                  }

                  localStorage.removeItem("treatmentSteps");
                  loadPlans();
                  onViewReport?.();
                }}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                  allStepsCompleted
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50"
                    : "bg-slate-300 text-slate-500 cursor-pointer shadow-none"
                }`}
              >
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - RECOMMENDATIONS */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
            <FaExclamationCircle className="text-blue-400" /> Recommendations
          </h3>

          <div className="space-y-6">
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Study Routine
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Follow the structured study timetable and avoid last-minute
                studying.
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Stress Reduction
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Practice breathing exercises before study sessions and during
                stressful moments.
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Reflection
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Write a short reflection weekly about exam pressure,
                concentration level, and emotional changes.
              </p>
            </div>

            <div className="p-5 bg-blue-600/10 border border-blue-400/30 rounded-2xl">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
                Final Recommendation
              </p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                Upon completion of all treatment steps, it is recommended to
                schedule a follow-up session with your counsellor to review your
                progress and discuss any further guidance if required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}