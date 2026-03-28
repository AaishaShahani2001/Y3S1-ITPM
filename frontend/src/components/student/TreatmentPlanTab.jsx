import React, { useState } from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";

export default function TreatmentPlanTab() {
  const [expandedStepId, setExpandedStepId] = useState(null);

  const [steps, setSteps] = useState([
    {
      id: 1,
      title: "Follow Structured Study Schedule",
      date: "Feb 10, 2026",
      status: "Current Step",
      completed: false,
      notes:
        "Follow the study timetable prepared during the counseling session for at least 5 days. Focus on fixed study hours, short breaks, and realistic daily targets.",
    },
    {
      id: 2,
      title: "Practice Daily Anxiety Reduction Exercise",
      date: "Feb 17, 2026",
      status: "Locked",
      completed: false,
      notes:
        "Complete 10 minutes of breathing and grounding exercises before each study session. Record how your body and mind feel before and after the exercise.",
    },
    {
      id: 3,
      title: "Submit Weekly Stress Reflection",
      date: "Feb 24, 2026",
      status: "Locked",
      completed: false,
      notes:
        "Write a short weekly reflection about exam fears, negative thoughts, and improvements in concentration, confidence, and time management.",
    },
    {
      id: 4,
      title: "Attend Follow-Up Progress Review",
      date: "Mar 03, 2026",
      status: "Locked",
      completed: false,
      notes:
        "Attend the follow-up counseling review and discuss whether the stress level has reduced, whether the study routine is working, and what adjustments are needed.",
    },
  ]);

  const toggleStepDetails = (id) => {
    setExpandedStepId(expandedStepId === id ? null : id);
  };

  const handleStepCheck = (id) => {
    const currentIndex = steps.findIndex((step) => step.id === id);

    if (currentIndex === -1) return;

    if (currentIndex > 0 && !steps[currentIndex - 1].completed) {
      alert(
        `You cannot complete Step ${id} yet. Please finish Step ${id - 1} first to unlock this step.`
      );
      return;
    }

    const updatedSteps = [...steps];
    updatedSteps[currentIndex].completed = true;
    updatedSteps[currentIndex].status = "Completed";

    if (currentIndex + 1 < updatedSteps.length) {
      if (!updatedSteps[currentIndex + 1].completed) {
        updatedSteps[currentIndex + 1].status = "Current Step";
      }
    }

    setSteps(updatedSteps);
  };

  const getProgress = () => {
    const completedCount = steps.filter((step) => step.completed).length;
    return Math.round((completedCount / steps.length) * 100);
  };

  return (
    <div className="animate-fadeIn space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight">Active Treatment Plan</h2>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-2 rounded-full">
          Last Updated: Mar 03, 2026
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
              <FaCheckCircle className="text-blue-600" /> Treatment Steps
            </h3>

            <div className="text-sm font-bold text-slate-600">
              Progress: {getProgress()}%
            </div>
          </div>

          <div className="space-y-5">
            {steps.map((step, index) => {
              const isLocked =
                index > 0 && !steps[index - 1].completed && !step.completed;

              return (
                <div
                  key={step.id}
                  className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 ${isLocked ? "cursor-not-allowed" : "cursor-default"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={step.completed}
                        disabled={step.completed}
                        onChange={() => handleStepCheck(step.id)}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
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

                        <p className="mt-3 text-slate-600 font-medium">
                          {step.title}
                        </p>

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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepDetails(step.id);
                      }}
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
                Study Routine
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Follow the structured study timetable and avoid last-minute studying.
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Stress Reduction
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Practice breathing exercises before study sessions and during stressful moments.
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Reflection
              </p>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Write a short reflection weekly about exam pressure, concentration level, and emotional changes.
              </p>
            </div>
          </div>

          <button className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/50">
            Download Plan PDF
          </button>
        </div>
      </div>
    </div>
  );
}