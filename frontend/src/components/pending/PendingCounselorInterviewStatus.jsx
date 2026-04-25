import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaInfoCircle, FaVideo } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

export default function PendingCounselorInterviewStatus() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    const loadInterviewStatus = async () => {
      if (!user?.token) {
        navigate("/auth");
        return;
      }
      // Read interview schedule/status for the currently logged-in pending applicant.
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/counsellor/interview/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setTimeline(null);
          return;
        }
        setTimeline(data);
      } catch (err) {
        console.error("Failed to load interview status", err);
        toast.error("Failed to load interview status");
        setTimeline(null);
      } finally {
        setLoading(false);
      }
    };
    loadInterviewStatus();
  }, [navigate, user?.token]);

  const interviewState = useMemo(() => {
    // Maps backend interview state to UI badge style/text.
    const status = (timeline?.interviewStatus || "").toLowerCase();
    if (status === "scheduled") return { text: "Interview Scheduled", className: "bg-blue-100 text-blue-700" };
    if (status === "completed") return { text: "Interview Completed", className: "bg-emerald-100 text-emerald-700" };
    if (status === "cancelled") return { text: "Interview Cancelled", className: "bg-rose-100 text-rose-700" };
    return { text: "Interview Not Scheduled Yet", className: "bg-amber-100 text-amber-700" };
  }, [timeline?.interviewStatus]);

  const timelineSteps = useMemo(() => {
    // Build deterministic stepper data for the interview lifecycle.
    const appStatus = (timeline?.status || "pending").toLowerCase();
    const interviewStatus = (timeline?.interviewStatus || "unscheduled").toLowerCase();

    const appliedAt = timeline?.createdAt ? new Date(timeline.createdAt).toLocaleString() : "Submitted";
    const scheduledAt = timeline?.interviewDate ? new Date(timeline.interviewDate).toLocaleString() : "Waiting for schedule";
    const reviewText =
      appStatus === "approved"
        ? "Approved by admin"
        : appStatus === "rejected"
          ? "Application not selected"
          : "Under review";

    return [
      {
        key: "applied",
        title: "Application Submitted",
        description: appliedAt,
        done: true,
      },
      {
        key: "scheduled",
        title: "Interview Scheduled",
        description: scheduledAt,
        done: interviewStatus === "scheduled" || interviewStatus === "completed",
      },
      {
        key: "review",
        title: "Final Review",
        description: reviewText,
        done: appStatus === "approved" || appStatus === "rejected",
      },
    ];
  }, [timeline]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 font-semibold">
        Loading interview details...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <FaVideo className="text-blue-600" /> Counselor Application Interview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          You are logged in as a user. Your counselor application is under review and interview updates appear here.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase">
            Application Pending
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${interviewState.className}`}>
            {interviewState.text}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Interview Date</p>
            <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
              <FaCalendarAlt className="text-slate-500" />
              {timeline?.interviewDate ? new Date(timeline.interviewDate).toLocaleString() : "Not scheduled"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Interview Mode</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {timeline?.interviewMode ? String(timeline.interviewMode).toUpperCase() : "TBD"}
            </p>
          </div>
        </div>

        {timeline?.interviewNote && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-bold uppercase text-blue-600">Admin Note</p>
            <p className="text-sm text-blue-800 mt-1">{timeline.interviewNote}</p>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
            <FaClock className="text-slate-500" /> Interview Timeline
          </p>
          <div className="space-y-0">
            {timelineSteps.map((step, idx) => (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs ${
                      step.done
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {step.done ? <FaCheckCircle className="text-[12px]" /> : idx + 1}
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div className={`w-[2px] h-10 ${step.done ? "bg-emerald-200" : "bg-slate-200"}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-bold ${step.done ? "text-slate-800" : "text-slate-500"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <FaInfoCircle className="mt-0.5 shrink-0" />
              Admin will update your timeline after interview scheduling and final review.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
