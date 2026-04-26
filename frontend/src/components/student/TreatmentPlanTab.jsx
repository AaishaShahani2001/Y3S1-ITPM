import React, { useState, useEffect, useCallback } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
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
    /* ignore */
  }
  return emptyStepsDoc();
}

function mapRowToPlan(p) {
  const doc = parseStepsData(p.steps_data);
  const done = doc.steps.filter((s) => s.completed).length;
  return {
    id: p.id,
    appointmentId: p.appointment_id,
    counsellorId: p.counsellor_id,
    studentId: p.student_id,
    counsellorName: p.counsellor_name || "",
    title: p.title || "Treatment plan",
    description: p.description || "",
    status: p.status || "",
    updatedAt: p.updated_at,
    dateLabel: formatPlanDate(p.updated_at),
    stepsDoc: doc,
    progress: Math.round((done / 4) * 100),
  };
}

export default function TreatmentPlanTab({ onViewReport }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [expandedKey, setExpandedKey] = useState(null);
  const [pendingConfirm, setPendingConfirm] = useState(null);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [draftComments, setDraftComments] = useState({});
  const [draftFiles, setDraftFiles] = useState({});

  const loadPlans = useCallback(async () => {
    if (!user?.id || !user?.token) {
      setLoadError("Please sign in to view treatment plans.");
      setPlans([]);
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
        setPlans([]);
        return;
      }

      if (res.status === 403) {
        const err = await res.json().catch(() => ({}));
        setLoadError(err.error || "You cannot view these treatment plans.");
        setPlans([]);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to load treatment plans");
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const sorted = [...list].sort((a, b) => a.id - b.id);
      const mapped = sorted.map(mapRowToPlan);
      setPlans(mapped);

      const nextDraft = {};
      mapped.forEach((plan) => {
        nextDraft[plan.id] = plan.stepsDoc.steps.map(
          (s) => s.student_comment || ""
        );
      });
      setDraftComments(nextDraft);

      const nextFiles = {};
      mapped.forEach((plan) => {
        nextFiles[plan.id] = plan.stepsDoc.steps.map((s) => ({
          name: s.student_file_name || "",
          data: s.student_file_data || "",
          type: s.student_file_type || "",
        }));
      });
      setDraftFiles(nextFiles);
    } catch (e) {
      setLoadError(e.message || "Failed to load treatment plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.token]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const toggleStepDetails = (key) => {
    setExpandedKey(expandedKey === key ? null : key);
  };

  const setDraftForPlan = (planId, stepIndex, value) => {
    setDraftComments((prev) => {
      const base = prev[planId] || Array(4).fill("");
      const next = [...base];
      next[stepIndex] = value;
      return { ...prev, [planId]: next };
    });
  };

  const setDraftFileForPlan = (planId, stepIndex, fileData) => {
    setDraftFiles((prev) => {
      const base = prev[planId] || Array.from({ length: 4 }, () => ({ name: "", data: "", type: "" }));
      const next = [...base];
      next[stepIndex] = fileData;
      return { ...prev, [planId]: next };
    });
  };

  const handleFilePick = (planId, stepIndex, file) => {
    if (!file) {
      setDraftFileForPlan(planId, stepIndex, { name: "", data: "", type: "" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setDraftFileForPlan(planId, stepIndex, {
        name: file.name,
        data: dataUrl,
        type: file.type || "application/octet-stream",
      });
    };
    reader.onerror = () => {
      toast.error("Could not read selected file.");
    };
    reader.readAsDataURL(file);
  };

  const handleCheckboxClick = (plan, stepIndex) => {
    const steps = plan.stepsDoc.steps;
    if (stepIndex > 0 && !steps[stepIndex - 1].completed) {
      toast.warning(`Finish step ${stepIndex} before completing this step.`);
      return;
    }
    if (steps[stepIndex].completed) return;

    const key = `${plan.id}-${stepIndex}`;
    setExpandedKey(key);
    setPendingConfirm({ planId: plan.id, stepIndex });
  };

  const buildStepsPayload = (plan, stepIndex, markComplete) => {
    const doc = plan.stepsDoc;
    const comments = draftComments[plan.id] || doc.steps.map((s) => s.student_comment || "");
    const files =
      draftFiles[plan.id] ||
      doc.steps.map((s) => ({
        name: s.student_file_name || "",
        data: s.student_file_data || "",
        type: s.student_file_type || "",
      }));
    const steps = doc.steps.map((s, i) => ({
      title: s.title,
      notes: s.notes,
      completed: s.completed,
      student_comment: comments[i] ?? "",
      student_file_name: files[i]?.name ?? "",
      student_file_data: files[i]?.data ?? "",
      student_file_type: files[i]?.type ?? "",
      counsellor_comment: s.counsellor_comment,
    }));

    if (markComplete) {
      steps[stepIndex] = {
        ...steps[stepIndex],
        completed: true,
        student_comment: comments[stepIndex] ?? "",
      };
    } else {
      steps[stepIndex] = {
        ...steps[stepIndex],
        student_comment: comments[stepIndex] ?? "",
      };
    }

    return {
      recommendations: { ...doc.recommendations },
      steps,
    };
  };

  const handleConfirmCompletion = async (plan, stepIndex) => {
    if (!user?.token) return;

    const steps_data = buildStepsPayload(plan, stepIndex, true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/treatment-plans/${plan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          appointment_id: plan.appointmentId,
          counsellor_id: plan.counsellorId,
          student_id: plan.studentId,
          title: plan.title,
          description: plan.description,
          status: plan.status,
          steps_data,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not mark step complete");
      }

      setPendingConfirm(null);
      toast.success("Step marked complete");
      await loadPlans();
    } catch (e) {
      toast.error(e.message || "Update failed");
    }
  };

  const handleCancelConfirmation = () => {
    setPendingConfirm(null);
  };

  const planProgress = (plan) => plan.progress;

  const allStepsCompletedForPlan = (plan) =>
    plan.stepsDoc.steps.length === 4 &&
    plan.stepsDoc.steps.every((s) => s.completed);

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
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-semibold border border-red-100 flex items-start gap-2">
          <FaExclamationCircle className="mt-0.5 shrink-0" />
          {loadError}
        </div>
      )}

      {!plans.length && !loadError && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center text-slate-600 font-medium">
          No treatment plans assigned yet. Your counsellor will add a plan for
          your appointment when ready.
        </div>
      )}

      {plans.map((plan) => {
        const steps = plan.stepsDoc.steps;
        const rec = plan.stepsDoc.recommendations;

        return (
          <div
            key={plan.id}
            className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-sm"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                    <FaCheckCircle className="text-blue-600" />{" "}
                    {plan.title || "Treatment plan"}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">
                    {plan.description}
                    {plan.counsellorName ? ` · ${plan.counsellorName}` : ""}
                  </p>
                </div>
                <div className="text-sm font-bold text-slate-600">
                  Progress: {planProgress(plan)}%
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isLocked =
                    index > 0 && !steps[index - 1].completed && !step.completed;
                  const key = `${plan.id}-${index}`;
                  const isPendingConfirm =
                    pendingConfirm?.planId === plan.id &&
                    pendingConfirm?.stepIndex === index;

                  return (
                    <div
                      key={key}
                      className={`bg-slate-50 rounded-2xl p-4 border border-slate-100 ${
                        isLocked ? "cursor-not-allowed opacity-90" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={step.completed}
                            disabled={step.completed}
                            onChange={() => handleCheckboxClick(plan, index)}
                            className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="font-black text-slate-800 text-base">
                                Step {index + 1} | {plan.dateLabel}
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

                            {step.counsellor_comment ? (
                              <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-sm text-indigo-900">
                                <span className="font-black">Counsellor: </span>
                                {step.counsellor_comment}
                              </div>
                            ) : null}

                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                expandedKey === key
                                  ? "max-h-225 opacity-100 mt-4"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                                    Step notes
                                  </label>
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {step.notes || "—"}
                                  </p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400">
                                    Confirmation upload comment (optional)
                                  </label>

                                  <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                      Confirmation note (optional)
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={
                                        (draftComments[plan.id] &&
                                          draftComments[plan.id][index]) ??
                                        ""
                                      }
                                      onChange={(e) =>
                                        setDraftForPlan(plan.id, index, e.target.value)
                                      }
                                      placeholder="Optional confirmation note before marking this step complete..."
                                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 outline-none focus:ring-2 focus:ring-blue-100"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                      Upload proof file (optional)
                                    </label>
                                    <input
                                      type="file"
                                      onChange={(e) =>
                                        handleFilePick(plan.id, index, e.target.files?.[0] || null)
                                      }
                                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-600"
                                    />
                                    {(draftFiles[plan.id]?.[index]?.name ||
                                      step.student_file_name) && (
                                      <div className="mt-2 text-xs font-semibold text-slate-600 flex items-center gap-2 flex-wrap">
                                        <span>Selected:</span>
                                        <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                                          {draftFiles[plan.id]?.[index]?.name ||
                                            step.student_file_name}
                                        </span>
                                        {(draftFiles[plan.id]?.[index]?.data ||
                                          step.student_file_data) && (
                                          <a
                                            href={
                                              draftFiles[plan.id]?.[index]?.data ||
                                              step.student_file_data
                                            }
                                            download={
                                              draftFiles[plan.id]?.[index]?.name ||
                                              step.student_file_name ||
                                              "step-proof"
                                            }
                                            className="text-blue-600 hover:text-blue-700 underline"
                                          >
                                            Download
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {isPendingConfirm && !step.completed && (
                                    <div className="pt-2 flex gap-3 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleConfirmCompletion(plan, index)
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
                              toggleStepDetails(key);
                            }}
                            className="text-slate-400 hover:text-blue-500 transition-colors p-2"
                            title={
                              expandedKey === key ? "Hide Details" : "View Details"
                            }
                          >
                            {expandedKey === key ? (
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
                <button
                  type="button"
                  onClick={() => {
                    if (!allStepsCompletedForPlan(plan)) {
                      toast.info(
                        "Complete all four steps in this plan before opening the report."
                      );
                      return;
                    }
                    onViewReport?.(plan.id);
                  }}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
                    allStepsCompletedForPlan(plan)
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/50"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                  }`}
                >
                  View Report
                </button>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl h-fit">
              <h3 className="text-lg font-black mb-5 flex items-center gap-3">
                <FaExclamationCircle className="text-blue-400" /> Recommendations
              </h3>

              <div className="space-y-6">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                    Daily routine
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {rec.dailyRoutine ||
                      "Your counsellor will add recommendations here."}
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                    Reading materials
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {rec.readingMaterials || "—"}
                  </p>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                    Exercise plan
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {rec.exercisePlan || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        );
      })}
    </div>
  );
}