import React, { useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCheckCircle, FaClock, FaFlagCheckered, FaVideo } from "react-icons/fa";
import { toast } from "react-toastify";

const API_BASE = "http://localhost:3000";

export default function InterviewDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    const loadTimeline = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

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
        console.error("Failed to load interview timeline", err);
        toast.error("Failed to load interview timeline");
      } finally {
        setLoading(false);
      }
    };

    loadTimeline();
  }, [user?.token]);

  const isApproved = (timeline?.status || "").toLowerCase() === "approved";

  const steps = useMemo(() => {
    const appliedAt = timeline?.createdAt ? new Date(timeline.createdAt).toLocaleString() : "Submitted";
    const interviewAt = timeline?.interviewDate ? new Date(timeline.interviewDate).toLocaleString() : "Scheduled";

    if (isApproved) {
      return [
        { key: "applied", title: "Application Submitted", detail: appliedAt, done: true },
        { key: "interview", title: "Interview Completed", detail: interviewAt, done: true },
        { key: "review", title: "Final Review Marked", detail: "Approved", done: true },
      ];
    }

    const interviewStatus = (timeline?.interviewStatus || "").toLowerCase();
    return [
      { key: "applied", title: "Application Submitted", detail: appliedAt, done: true },
      {
        key: "interview",
        title: "Interview Stage",
        detail:
          interviewStatus === "completed"
            ? "Interview completed"
            : interviewStatus === "scheduled"
              ? interviewAt
              : "Pending schedule",
        done: interviewStatus === "completed" || interviewStatus === "scheduled",
      },
      { key: "review", title: "Final Review", detail: "Under review", done: false },
    ];
  }, [isApproved, timeline]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-500 font-semibold">
        Loading interview timeline...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <FaVideo className="text-blue-600" /> Interview Timeline
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Your counselor onboarding interview flow and final review status.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Application</p>
            <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{timeline?.status || "pending"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Interview Time</p>
            <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
              <FaCalendarAlt className="text-slate-500" />
              {timeline?.interviewDate ? new Date(timeline.interviewDate).toLocaleString() : "Not set"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-bold uppercase text-slate-500">Final Review</p>
            <p className={`text-sm font-bold mt-1 ${isApproved ? "text-emerald-700" : "text-amber-700"}`}>
              {isApproved ? "Marked Approved" : "Pending"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
            <FaClock className="text-slate-500" /> Timeline Progress
          </p>
          <div className="space-y-0">
            {steps.map((step, idx) => (
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
                  {idx < steps.length - 1 && (
                    <div className={`w-[2px] h-10 ${step.done ? "bg-emerald-200" : "bg-slate-200"}`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-bold ${step.done ? "text-slate-800" : "text-slate-500"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isApproved && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <FaFlagCheckered /> Final Review marked and onboarding completed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
