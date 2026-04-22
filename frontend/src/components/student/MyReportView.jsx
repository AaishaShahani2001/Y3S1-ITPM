import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:3000";

function parseStepsData(raw) {
  if (!raw) return null;
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (o && Array.isArray(o.steps) && o.steps.length === 4) return o;
  } catch {
    return null;
  }
  return null;
}

export default function MyReportView({ reportUnlocked, reportPlanId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!reportUnlocked || !reportPlanId || !user?.token) {
      setPlan(null);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`${API_BASE_URL}/api/treatment-plans/${reportPlanId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not load report");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setPlan(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reportUnlocked, reportPlanId, user?.token]);

  const handleDownload = () => {
    window.print();
  };

  if (!reportUnlocked || !reportPlanId) {
    return (
      <div className="animate-fadeIn">
        <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 text-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800 mb-6 uppercase">
            My Reports
          </h1>

          <hr className="w-24 border-t-4 border-blue-500 rounded-full my-8" />

          <div className="space-y-4 max-w-lg">
            <h2 className="text-2xl font-black text-slate-900">No Report Available</h2>
            <p className="text-lg leading-relaxed text-slate-600 font-medium">
              Complete all four steps in a treatment plan and click{" "}
              <strong className="text-slate-800">View Report</strong> from the Treatment Plan
              section to open the completion report for that plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-fadeIn p-10 text-center text-slate-600 font-medium">
        Loading report…
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="animate-fadeIn p-10 text-center text-red-600 font-medium">
        {error || "Report could not be loaded."}
      </div>
    );
  }

  const doc = parseStepsData(plan.steps_data);
  const steps = doc?.steps || [];
  const allDone =
    steps.length === 4 && steps.every((s) => s.completed);

  if (!allDone) {
    return (
      <div className="animate-fadeIn max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] border border-amber-100 text-amber-900">
        <p className="font-bold">
          This plan is not fully completed yet. Finish all four steps before opening the report.
        </p>
      </div>
    );
  }

  const generated = plan.updated_at
    ? new Date(plan.updated_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="animate-fadeIn pb-10">
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 text-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
        <h1 className="text-center text-3xl md:text-4xl font-black tracking-tighter text-slate-800 mb-8 uppercase">
          Treatment Completion Report
        </h1>

        <hr className="border-t-2 border-slate-100 my-8" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Student Name
            </span>
            <span className="font-black text-slate-800">
              {user?.name || "Student"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Case ID
            </span>
            <span className="font-black text-slate-800">CASE-{plan.id}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Plan Name
            </span>
            <span className="font-black text-slate-800">{plan.description || "—"}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Counsellor Name
            </span>
            <span className="font-black text-slate-800">
              {plan.counsellor_name || "—"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Date Generated
            </span>
            <span className="font-black text-blue-600">{generated}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Status
            </span>
            <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm">
              Completed
            </span>
          </div>
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-4">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-4">
            Primary Objective
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {plan.title || "—"}
          </p>
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-6">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-6">
            Completed Steps
          </h2>

          {steps.map((s, i) => (
            <div
              key={i}
              className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative"
            >
              <div className="absolute top-6 right-6 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">
                ✓
              </div>
              <p className="font-black text-slate-800 text-lg mb-2 pr-10">
                {i + 1}. {s.title || "Step"}
              </p>
              {s.student_comment ? (
                <p className="text-slate-500 italic mt-2 text-sm font-medium pl-4 border-l-2 border-slate-200">
                  &ldquo;{s.student_comment}&rdquo;
                </p>
              ) : (
                <p className="text-slate-400 text-sm mt-2">No student comment</p>
              )}
              {s.student_file_name ? (
                <p className="text-slate-700 text-sm mt-2 font-medium">
                  Proof file:{" "}
                  {s.student_file_data ? (
                    <a
                      href={s.student_file_data}
                      download={s.student_file_name}
                      className="text-blue-600 underline"
                    >
                      {s.student_file_name}
                    </a>
                  ) : (
                    s.student_file_name
                  )}
                </p>
              ) : null}
              {s.counsellor_comment ? (
                <p className="text-indigo-800 text-sm mt-3 font-medium">
                  <span className="font-black">Counsellor note: </span>
                  {s.counsellor_comment}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-4">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-6">
            Recommendations
          </h2>
          <ul className="list-disc pl-7 space-y-3 font-medium text-slate-700 text-lg">
            {doc?.recommendations?.dailyRoutine ? (
              <li>{doc.recommendations.dailyRoutine}</li>
            ) : null}
            {doc?.recommendations?.readingMaterials ? (
              <li>{doc.recommendations.readingMaterials}</li>
            ) : null}
            {doc?.recommendations?.exercisePlan ? (
              <li>{doc.recommendations.exercisePlan}</li>
            ) : null}
            {!doc?.recommendations?.dailyRoutine &&
            !doc?.recommendations?.readingMaterials &&
            !doc?.recommendations?.exercisePlan ? (
              <li className="text-slate-400 list-none -ml-7">No extra recommendations recorded.</li>
            ) : null}
          </ul>
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-4">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-4">
            Final Outcome
          </h2>
          <p className="text-lg leading-relaxed text-green-800 font-bold bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-3">
            <span className="flex items-center justify-center bg-green-200 text-green-700 w-8 h-8 rounded-full font-black">
              ✓
            </span>
            Treatment plan steps completed successfully.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-12 print:hidden">
          <button
            type="button"
            className="flex-1 max-w-60 py-4 px-6 bg-slate-900 hover:bg-black text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-3"
            onClick={handleDownload}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download PDF
          </button>
          <button
            type="button"
            className="flex-1 max-w-60 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-3"
            onClick={handleDownload}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:3000";

function parseStepsData(raw) {
  if (!raw) return null;
  try {
    const o = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (o && Array.isArray(o.steps) && o.steps.length === 4) return o;
  } catch {
    return null;
  }
  return null;
}

export default function MyReportView({ reportUnlocked, reportPlanId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!reportUnlocked || !reportPlanId || !user?.token) {
      setPlan(null);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`${API_BASE_URL}/api/treatment-plans/${reportPlanId}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not load report");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setPlan(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reportUnlocked, reportPlanId, user?.token]);

  const handleDownload = () => {
    window.print();
  };

  if (!reportUnlocked || !reportPlanId) {
    return (
      <div className="animate-fadeIn">
        <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 text-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-800 mb-6 uppercase">
            My Reports
          </h1>

          <hr className="w-24 border-t-4 border-blue-500 rounded-full my-8" />

          <div className="space-y-4 max-w-lg">
            <h2 className="text-2xl font-black text-slate-900">No Report Available</h2>
            <p className="text-lg leading-relaxed text-slate-600 font-medium">
              Complete all four steps in a treatment plan and click{" "}
              <strong className="text-slate-800">View Report</strong> from the Treatment Plan
              section to open the completion report for that plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-fadeIn p-10 text-center text-slate-600 font-medium">
        Loading report…
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="animate-fadeIn p-10 text-center text-red-600 font-medium">
        {error || "Report could not be loaded."}
      </div>
    );
  }

  const doc = parseStepsData(plan.steps_data);
  const steps = doc?.steps || [];
  const allDone =
    steps.length === 4 && steps.every((s) => s.completed);

  if (!allDone) {
    return (
      <div className="animate-fadeIn max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] border border-amber-100 text-amber-900">
        <p className="font-bold">
          This plan is not fully completed yet. Finish all four steps before opening the report.
        </p>
      </div>
    );
  }

  const generated = plan.updated_at
    ? new Date(plan.updated_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="animate-fadeIn pb-10">
      <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 text-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
        <h1 className="text-center text-3xl md:text-4xl font-black tracking-tighter text-slate-800 mb-8 uppercase">
          Treatment Completion Report
        </h1>

        <hr className="border-t-2 border-slate-100 my-8" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Student Name
            </span>
            <span className="font-black text-slate-800">
              {user?.name || "Student"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Case ID
            </span>
            <span className="font-black text-slate-800">CASE-{plan.id}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Plan Name
            </span>
            <span className="font-black text-slate-800">{plan.description || "—"}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Counsellor Name
            </span>
            <span className="font-black text-slate-800">
              {plan.counsellor_name || "—"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Date Generated
            </span>
            <span className="font-black text-blue-600">{generated}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-lg items-center">
            <span className="min-w-47.5 font-bold text-slate-400 uppercase text-xs tracking-widest">
              Status
            </span>
            <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm">
              Completed
            </span>
          </div>
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-4">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-4">
            Primary Objective
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 font-bold bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {plan.title || "—"}
          </p>
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-6">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-6">
            Completed Steps
          </h2>

          {steps.map((s, i) => (
            <div
              key={i}
              className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative"
            >
              <div className="absolute top-6 right-6 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">
                ✓
              </div>
              <p className="font-black text-slate-800 text-lg mb-2 pr-10">
                {i + 1}. {s.title || "Step"}
              </p>
              {s.student_comment ? (
                <p className="text-slate-500 italic mt-2 text-sm font-medium pl-4 border-l-2 border-slate-200">
                  &ldquo;{s.student_comment}&rdquo;
                </p>
              ) : (
                <p className="text-slate-400 text-sm mt-2">No student comment</p>
              )}
              {s.student_file_name ? (
                <p className="text-slate-700 text-sm mt-2 font-medium">
                  Proof file:{" "}
                  {s.student_file_data ? (
                    <a
                      href={s.student_file_data}
                      download={s.student_file_name}
                      className="text-blue-600 underline"
                    >
                      {s.student_file_name}
                    </a>
                  ) : (
                    s.student_file_name
                  )}
                </p>
              ) : null}
              {s.counsellor_comment ? (
                <p className="text-indigo-800 text-sm mt-3 font-medium">
                  <span className="font-black">Counsellor note: </span>
                  {s.counsellor_comment}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-4">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-6">
            Recommendations
          </h2>
          <ul className="list-disc pl-7 space-y-3 font-medium text-slate-700 text-lg">
            {doc?.recommendations?.dailyRoutine ? (
              <li>{doc.recommendations.dailyRoutine}</li>
            ) : null}
            {doc?.recommendations?.readingMaterials ? (
              <li>{doc.recommendations.readingMaterials}</li>
            ) : null}
            {doc?.recommendations?.exercisePlan ? (
              <li>{doc.recommendations.exercisePlan}</li>
            ) : null}
            {!doc?.recommendations?.dailyRoutine &&
            !doc?.recommendations?.readingMaterials &&
            !doc?.recommendations?.exercisePlan ? (
              <li className="text-slate-400 list-none -ml-7">No extra recommendations recorded.</li>
            ) : null}
          </ul>
        </div>

        <hr className="border-t-2 border-slate-100 my-10" />

        <div className="space-y-4">
          <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-4">
            Final Outcome
          </h2>
          <p className="text-lg leading-relaxed text-green-800 font-bold bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-3">
            <span className="flex items-center justify-center bg-green-200 text-green-700 w-8 h-8 rounded-full font-black">
              ✓
            </span>
            Treatment plan steps completed successfully.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-12 print:hidden">
          <button
            type="button"
            className="flex-1 max-w-60 py-4 px-6 bg-slate-900 hover:bg-black text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-3"
            onClick={handleDownload}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download PDF
          </button>
          <button
            type="button"
            className="flex-1 max-w-60 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-3"
            onClick={handleDownload}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}