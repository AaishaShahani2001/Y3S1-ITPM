import React, { useEffect, useMemo, useState } from "react";
import {
  FaUserMd,
  FaMicroscope,
  FaAmbulance,
  FaStethoscope,
  FaClock,
  FaPhoneAlt,
  FaCalendarAlt,
} from "react-icons/fa";

export default function QuickInfo() {
  const [showTimetable, setShowTimetable] = useState(false);

  return (
    <section className="relative bg-transparent -mt-20 pt-5 pb-20 z-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* TOP FLOATING INFO CARD */}
        <div className="bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 border border-white/60 relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-linear-to-tr from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />


          {/* Opening Hours */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0 md:pr-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <FaClock />
              </div>
              Opening Hours
            </h3>
            <ul className="text-slate-600 space-y-3 pl-2">
              <li className="flex justify-between w-full text-sm">
                <span>Mon – Fri</span>
                <span className="font-medium text-slate-800">8.30 AM – 5.00 PM</span>
              </li>
              <li className="flex justify-between w-full text-sm">
                <span>Saturday</span>
                <span className="font-medium text-slate-800">9.00 AM – 1.00 PM</span>
              </li>
              <li className="flex justify-between w-full text-sm text-red-500">
                <span>Sunday</span>
                <span className="font-medium">Closed</span>
              </li>
            </ul>
          </div>

          {/* Timetable */}
          <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0 md:pr-8 md:pl-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <FaCalendarAlt />
              </div>
              Counsellor Timetable
            </h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Check availability and session schedules of our professional counsellors to plan your visit.
            </p>
            <button
              type="button"
              onClick={() => setShowTimetable(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg self-start"
            >
              View Timetable
            </button>
          </div>

          {/* Emergency */}
          <div className="flex flex-col md:pl-8 justify-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <div className="p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl text-blue-600 shadow-inner">
                <FaPhoneAlt className="animate-pulse" />
              </div>
              Support Assistance
            </h3>
            <p className="text-slate-600 text-sm mb-4">
              Need immediate help? We are here for you.
            </p>
            <p className="text-blue-600 font-extrabold text-3xl tracking-tight">
              +94 77 123 4567
            </p>
            <p className="text-xs text-slate-400 mt-2">24/7 Emergency Line</p>
          </div>
        </div>

        {/* FEATURE ICONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {[
            { icon: FaUserMd, title: "Qualified Counsellors", desc: "Certified and experienced professionals." },
            { icon: FaMicroscope, title: "Modern Facilities", desc: "Secure and comfortable counselling spaces." },
            { icon: FaAmbulance, title: "Emergency Help", desc: "Support when it matters most." },
            { icon: FaStethoscope, title: "Individual Approach", desc: "Personalized care for each student." }
          ].map((item, idx) => (
            <div key={idx} className="group bg-white/40 backdrop-blur-md p-8 rounded-3xl hover:bg-white/80 transition-all duration-500 border border-white/20 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10 text-center hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-blue-500/0 to-blue-500/0 group-hover:to-blue-500/5 transition-all duration-500" />

              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <item.icon />
              </div>
              <h4 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {showTimetable && <CounsellorTimetableSummary onClose={() => setShowTimetable(false)} />}
      </div>
    </section>
  );
}

function isUpcomingSlot(slot) {
  if (!slot?.date || !slot?.endTime) return false;
  const endDateTime = new Date(`${slot.date}T${slot.endTime}`);
  if (Number.isNaN(endDateTime.getTime())) return false;
  return endDateTime >= new Date();
}

function normalizeSlotToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/:00(?=am|pm|\b)/g, "");
}

function parseTimeToMinutes(input) {
  const text = String(input || "").trim().toLowerCase();
  if (!text) return null;

  // 12-hour format: 09:00 AM / 9:00pm
  const m12 = text.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (m12) {
    let h = Number(m12[1]);
    const min = Number(m12[2]);
    const suffix = m12[3].toLowerCase();
    if (suffix === "pm" && h < 12) h += 12;
    if (suffix === "am" && h === 12) h = 0;
    return h * 60 + min;
  }

  // 24-hour format: 09:00 / 09:00:00
  const m24 = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (m24) {
    const h = Number(m24[1]);
    const min = Number(m24[2]);
    return h * 60 + min;
  }
  return null;
}

function parseBookedTokenToRange(token) {
  const normalized = String(token || "").trim();
  if (!normalized) return null;

  const parts = normalized.split("-").map((p) => p.trim());
  if (parts.length === 1) {
    const start = parseTimeToMinutes(parts[0]);
    return start == null ? null : { start, end: null };
  }
  if (parts.length === 2) {
    const start = parseTimeToMinutes(parts[0]);
    const end = parseTimeToMinutes(parts[1]);
    if (start == null) return null;
    return { start, end: end == null ? null : end };
  }
  return null;
}

function to12Hour(timeValue) {
  const hhmm = String(timeValue || "").slice(0, 5);
  const [hRaw, mRaw] = hhmm.split(":");
  const h = Number(hRaw);
  const m = Number(mRaw);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

function buildSlotMatchCandidates(slot) {
  const start = String(slot.startTime || "");
  const end = String(slot.endTime || "");
  const start12 = to12Hour(start);
  const end12 = to12Hour(end);
  const values = [
    start,
    `${start}-${end}`,
    `${start} - ${end}`,
    start12,
    start12 && end12 ? `${start12}-${end12}` : "",
    start12 && end12 ? `${start12} - ${end12}` : "",
  ].filter(Boolean);
  return values.map(normalizeSlotToken);
}

function isSlotBooked(slot, bookedSlots) {
  const startMin = parseTimeToMinutes(slot.startTime);
  const endMin = parseTimeToMinutes(slot.endTime);
  if (startMin == null) return false;

  // Exact string token matching first.
  const bookedSet = new Set((bookedSlots || []).map((b) => normalizeSlotToken(b)));
  const directMatch = buildSlotMatchCandidates(slot).some((token) => bookedSet.has(token));
  if (directMatch) return true;

  // Fallback numeric matching for format differences (e.g. 09:00 AM vs 9:00 AM).
  return (bookedSlots || []).some((raw) => {
    const range = parseBookedTokenToRange(raw);
    if (!range) return false;
    if (range.end == null) return range.start === startMin;
    if (endMin == null) return range.start === startMin;
    return range.start === startMin && range.end === endMin;
  });
}

function CounsellorTimetableSummary({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      setError("");
      try {
        const counsellorRes = await fetch("http://localhost:3000/api/counsellor/all");
        if (!counsellorRes.ok) throw new Error("Failed to load counsellors");
        const counsellors = await counsellorRes.json();
        const list = Array.isArray(counsellors) ? counsellors : [];

        const result = await Promise.all(
          list.map(async (c) => {
            const availabilityRes = await fetch(
              `http://localhost:3000/api/counsellor/availability/${c.userId}`
            );
            const availabilityData = availabilityRes.ok ? await availabilityRes.json() : [];
            const availability = Array.isArray(availabilityData) ? availabilityData : [];

            const upcoming = availability.filter(isUpcomingSlot);

            const slotsWithStatus = await Promise.all(
              upcoming.map(async (slot) => {
                const bookedRes = await fetch(
                  `http://localhost:3000/api/appointments/booked-slots?counsellorId=${c.userId}&date=${slot.date}`
                );
                const bookedData = bookedRes.ok ? await bookedRes.json() : { bookedSlots: [] };
                const isBooked = isSlotBooked(slot, bookedData?.bookedSlots || []);

                return {
                  id: slot.id,
                  date: slot.date,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  isBooked,
                };
              })
            );

            return {
              id: c.id ?? c.userId,
              name: c.fullName || "Counsellor",
              specialization: c.specialization || "General Counseling",
              avatar: c.profileImage ? `http://localhost:3000/${c.profileImage}` : "",
              slots: slotsWithStatus,
            };
          })
        );

        if (!cancelled) setRows(result);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load timetable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        slots: [...r.slots].sort((a, b) =>
          `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`)
        ),
      })),
    [rows]
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Counsellor timetable summary"
    >
      <div
        className="w-full max-w-6xl max-h-[88vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">
              Counsellor Timetable
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Upcoming availability with live booking status.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Booked
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                Available
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold self-start"
          >
            Close
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500">Loading timetable...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {sortedRows.map((row) => (
              <div
                key={row.id}
                className="bg-linear-to-b from-white to-slate-50 rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                  {row.avatar ? (
                    <img
                      src={row.avatar}
                      alt={row.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200">
                      <FaUserMd />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{row.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                      {row.specialization}
                    </p>
                  </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    {row.slots.length} slot{row.slots.length === 1 ? "" : "s"}
                  </span>
                </div>

                {!row.slots.length ? (
                  <p className="text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-xl px-3 py-2">
                    No upcoming slots
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {row.slots.map((slot) => (
                      <span
                        key={`${row.id}-${slot.id}-${slot.date}-${slot.startTime}`}
                        className={`text-[11px] font-bold px-3 py-2 rounded-xl border inline-flex items-center gap-2 ${
                          slot.isBooked
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        <span>{slot.date}</span>
                        <span className="text-slate-400">|</span>
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className={slot.isBooked ? "text-red-700" : "text-slate-700"}>
                          {slot.isBooked ? "Booked" : "Available"}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
