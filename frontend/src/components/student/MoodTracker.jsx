import React, { useEffect, useMemo, useState } from "react";
import { FaBed, FaEdit, FaHeartbeat, FaRegSmile, FaSave, FaTrash, FaUserMd } from "react-icons/fa";
import { Radar } from "react-chartjs-2";
import { toast } from "react-toastify";
import "chart.js/auto";

const API_BASE = "http://localhost:3000";

const MOODS = [
  { value: "happy", label: "Happy", emoji: "🙂", score: 5 },
  { value: "calm", label: "Calm", emoji: "😌", score: 4 },
  { value: "neutral", label: "Neutral", emoji: "😐", score: 3 },
  { value: "stressed", label: "Stressed", emoji: "😟", score: 2 },
  { value: "sad", label: "Sad", emoji: "😔", score: 1 },
];

// Quick lookup for emoji + score + label metadata by mood value.
const moodMetaByValue = MOODS.reduce((acc, mood) => {
  acc[mood.value] = mood;
  return acc;
}, {});

// Maps slider value to contextual color classes.
const sliderTone = (value) => {
  if (value <= 2) {
    return {
      accent: "accent-rose-500",
      text: "text-rose-600",
      chip: "bg-rose-50 border-rose-200",
    };
  }
  if (value === 3) {
    return {
      accent: "accent-amber-500",
      text: "text-amber-600",
      chip: "bg-amber-50 border-amber-200",
    };
  }
  return {
    accent: "accent-emerald-500",
    text: "text-emerald-600",
    chip: "bg-emerald-50 border-emerald-200",
  };
};

// Converts ISO/timestamp-like date strings into YYYY-MM-DD for date inputs.
const normalizeDateString = (raw) => {
  if (!raw) return "";
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }
  return str.slice(0, 10);
};

// Normalizes date to YYYY-MM-DD format for all API payloads.
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Converts API rows into safe frontend records with defaults.
const toRecord = (entry, index) => {
  const moodMeta = moodMetaByValue[entry.mood] || moodMetaByValue.neutral;
  return {
    id: entry.id || `${entry.date}-${entry.mood}-${index}`,
    date: normalizeDateString(entry.date),
    mood: entry.mood || "neutral",
    moodLabel: moodMeta?.label || "Neutral",
    moodEmoji: moodMeta?.emoji || "😐",
    moodScore: moodMeta?.score || 3,
    sleepQuality: Number(entry.sleepQuality || 3),
    socialConnection: Number(entry.socialConnection || 3),
    physicalActivity: Number(entry.physicalActivity || 3),
    mindfulness: Number(entry.mindfulness || 3),
    stressLevel: Number(entry.stressLevel || 3),
    energyLevel: Number(entry.energyLevel || 3),
    recommendedType: entry.recommendedType || "",
    recommendationUrgency: Number(entry.recommendationUrgency || 0),
    recommendedCounsellor: Array.isArray(entry.recommendedCounsellor) ? entry.recommendedCounsellor : [],
  };
};

export default function MoodTracker() {
  // Read authenticated user for token-based API calls.
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // Main records store from backend.
  const [records, setRecords] = useState([]);
  // Global loader for initial list fetch.
  const [loading, setLoading] = useState(true);
  // Edit mode stores selected record ID; null means create mode.
  const [editingRecordId, setEditingRecordId] = useState(null);
  // Week selector for emoji trend section.
  const [trendWeekView, setTrendWeekView] = useState("current");
  // Form state for creating/updating one daily record.
  const [form, setForm] = useState({
    date: todayISO(),
    mood: "neutral",
    sleepQuality: 3,
    socialConnection: 3,
    physicalActivity: 3,
    mindfulness: 3,
    stressLevel: 3,
    energyLevel: 3,
  });

  // Reusable API loader to keep list refresh logic in one place.
  const loadRecords = async (showLoader = true) => {
    if (!user?.token) {
      setRecords([]);
      setLoading(false);
      return;
    }
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/mood/tracker`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!res.ok) {
        toast.error("Failed to load mood records");
        setRecords([]);
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data.map(toRecord) : [];
      setRecords(list.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
    } catch (err) {
      console.error("Failed to load mood tracker records", err);
      toast.error("Failed to load mood records");
      setRecords([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Initial fetch on mount/token change.
  useEffect(() => {
    loadRecords(true);
  }, [user?.token]);

  // Resets form back to default create mode.
  const resetForm = () => {
    setEditingRecordId(null);
    setForm({
      date: todayISO(),
      mood: "neutral",
      sleepQuality: 3,
      socialConnection: 3,
      physicalActivity: 3,
      mindfulness: 3,
      stressLevel: 3,
      energyLevel: 3,
    });
  };

  // Prefills form from record and toggles edit mode.
  const handleEdit = (record) => {
    setEditingRecordId(record.id);
    setForm({
      date: record.date,
      mood: record.mood,
      sleepQuality: record.sleepQuality,
      socialConnection: record.socialConnection,
      physicalActivity: record.physicalActivity,
      mindfulness: record.mindfulness,
      stressLevel: record.stressLevel,
      energyLevel: record.energyLevel,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Saves create/update record through backend API.
  const handleSave = () => {
    if (!form.date) {
      toast.error("Please select a date");
      return;
    }
    if (!user?.token) {
      toast.error("Please login again");
      return;
    }

    (async () => {
      try {
        // Create uses POST upsert-by-date; edit uses PUT by record id.
        const endpoint = editingRecordId
          ? `${API_BASE}/api/mood/tracker/${editingRecordId}`
          : `${API_BASE}/api/mood/tracker`;
        const method = editingRecordId ? "PUT" : "POST";

        const res = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || "Failed to save mood record");
          return;
        }
        await loadRecords(false);
        toast.success(editingRecordId ? "Mood record updated" : "Mood record saved");
        resetForm();
      } catch (err) {
        console.error("Failed to save mood tracker record", err);
        toast.error("Failed to save mood record");
      }
    })();
  };

  // Delete one saved mood record by record id.
  const handleDelete = (id) => {
    if (!user?.token) {
      toast.error("Please login again");
      return;
    }
    (async () => {
      try {
        // Primary delete path: record ID endpoint.
        const res = await fetch(`${API_BASE}/api/mood/tracker/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token}` },
        });

        // Fallback delete path: by date query for environments without /:id route.
        if (!res.ok && res.status === 404) {
          const target = records.find((r) => r.id === id);
          if (!target?.date) {
            toast.error("Failed to remove mood record");
            return;
          }
          const fallback = await fetch(`${API_BASE}/api/mood/tracker?date=${encodeURIComponent(target.date)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (!fallback.ok) {
            const errData = await fallback.json().catch(() => ({}));
            toast.error(errData.error || "Failed to remove mood record");
            return;
          }
        } else if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || "Failed to remove mood record");
          return;
        }
        setRecords((prev) => prev.filter((r) => r.id !== id));
        toast.success("Mood record removed");
      } catch (err) {
        console.error("Failed to delete mood tracker record", err);
        toast.error("Failed to remove mood record");
      }
    })();
  };

  const weeklyRecords = useMemo(() => records.slice(0, 7).reverse(), [records]);

  const overallScore = useMemo(() => {
    if (records.length === 0) return 0;
    const total = records.reduce((sum, r) => {
      const factors =
        r.moodScore + r.sleepQuality + r.socialConnection + r.physicalActivity + r.mindfulness + r.energyLevel;
      const stressAdjusted = 6 - r.stressLevel;
      return sum + factors + stressAdjusted;
    }, 0);
    const maxPerDay = 35;
    return Math.round((total / (records.length * maxPerDay)) * 100);
  }, [records]);

  const latest = records[0];

  const radarData = useMemo(() => {
    const source = latest || toRecord(form, 0);
    return {
      labels: ["Sleep", "Physical", "Social", "Mindfulness", "Energy"],
      datasets: [
        {
          data: [
            source.sleepQuality,
            source.physicalActivity,
            source.socialConnection,
            source.mindfulness,
            source.energyLevel,
          ],
          backgroundColor: "rgba(124, 58, 237, 0.2)",
          borderColor: "#7c3aed",
          pointBackgroundColor: "#7c3aed",
        },
      ],
    };
  }, [latest, form]);

  // Builds Monday->Sunday day slots for current/previous week emoji trend view.
  const weeklyEmojiTrend = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(today);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(today.getDate() + mondayOffset + (trendWeekView === "previous" ? -7 : 0));

    const byDate = new Map(records.map((r) => [r.date, r]));
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return labels.map((label, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const rec = byDate.get(key);
      return {
        label,
        date: key,
        mood: rec?.mood || null,
        emoji: rec?.moodEmoji || "⚪",
        moodLabel: rec?.moodLabel || "No entry",
      };
    });
  }, [records, trendWeekView]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Mood Tracker</h2>
            <p className="text-sm text-slate-500 mt-1">Log daily wellbeing and get counselor suggestions by mood profile.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
              <p className="text-[10px] uppercase font-black tracking-widest text-blue-500">Overall score</p>
              <p className="text-2xl font-black text-blue-700">{overallScore}%</p>
            </div>
            <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-center min-w-28">
              <p className="text-2xl">{latest?.moodEmoji || "😐"}</p>
              <p className="text-xs font-bold text-slate-700">{latest?.moodLabel || "No entry"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5">
          <h3 className="text-lg font-black text-slate-900">
            {editingRecordId ? "Edit Mood Record" : "Add Daily Record"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mood</p>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, mood: m.value }))}
                    className={`rounded-xl border px-2 py-2 text-center ${
                      form.mood === m.value ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-lg">{m.emoji}</p>
                    <p className="text-[10px] font-bold text-slate-600">{m.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RangeField label="Sleep Quality" icon={<FaBed />} value={form.sleepQuality} onChange={(v) => setForm((p) => ({ ...p, sleepQuality: v }))} />
            <RangeField label="Social Connection" icon={<FaHeartbeat />} value={form.socialConnection} onChange={(v) => setForm((p) => ({ ...p, socialConnection: v }))} />
            <RangeField label="Physical Activity" icon={<FaHeartbeat />} value={form.physicalActivity} onChange={(v) => setForm((p) => ({ ...p, physicalActivity: v }))} />
            <RangeField label="Mindfulness" icon={<FaRegSmile />} value={form.mindfulness} onChange={(v) => setForm((p) => ({ ...p, mindfulness: v }))} />
            <RangeField label="Stress Level" icon={<FaHeartbeat />} value={form.stressLevel} onChange={(v) => setForm((p) => ({ ...p, stressLevel: v }))} />
            <RangeField label="Energy Level" icon={<FaHeartbeat />} value={form.energyLevel} onChange={(v) => setForm((p) => ({ ...p, energyLevel: v }))} />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-black tracking-wide hover:bg-blue-700"
          >
            <FaSave /> {editingRecordId ? "Update Record" : "Save Record"}
          </button>
          {editingRecordId && (
            <button
              type="button"
              onClick={resetForm}
              className="ml-2 inline-flex items-center gap-2 rounded-xl bg-slate-200 text-slate-700 px-5 py-2.5 text-sm font-black tracking-wide hover:bg-slate-300"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6">
            <h3 className="text-lg font-black text-slate-900 mb-3">Overall Score Snapshot</h3>
            <div className="h-64">
              <Radar
                data={radarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } },
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-black text-slate-900">Weekly Mood Trend</h3>
              <select
                value={trendWeekView}
                onChange={(e) => setTrendWeekView(e.target.value)}
                className="text-xs font-bold border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600"
              >
                <option value="current">Current Week</option>
                <option value="previous">Previous Week</option>
              </select>
            </div>
            <div className="mb-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-600">
              Visual mood timeline for each day in the selected week.
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
              {weeklyEmojiTrend.map((item) => (
                <div
                  key={item.date}
                  className={`rounded-2xl border p-3 text-center transition-all ${
                    item.mood
                      ? "border-blue-200 bg-linear-to-b from-blue-50 to-indigo-50/70 shadow-sm"
                      : "border-slate-100 bg-slate-50"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                  <p className="text-3xl mt-1">{item.emoji}</p>
                  <p className="text-[10px] mt-1 font-semibold text-slate-700">{item.moodLabel}</p>
                  <p className="text-[9px] mt-0.5 text-slate-400">{item.date.slice(5)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6">
        <h3 className="text-lg font-black text-slate-900 mb-4">Mood Records</h3>
        {loading ? (
          <p className="text-sm text-slate-500">Loading mood records...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-slate-500">No records available. Start by adding today&apos;s mood.</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/40 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <span className="text-2xl">{record.moodEmoji}</span>
                      <span>{record.date} - {record.moodLabel}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Sleep {record.sleepQuality}/5 | Social {record.socialConnection}/5 | Physical{" "}
                      {record.physicalActivity}/5 | Mindfulness {record.mindfulness}/5 | Stress {record.stressLevel}/5 | Energy{" "}
                      {record.energyLevel}/5
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      Recommended category: <span className="font-bold">{record.recommendedType || "Not available"}</span> | Urgency:{" "}
                      <span className="font-bold">{record.recommendationUrgency || "—"}</span>
                    </p>
                    {record.recommendedCounsellor.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {record.recommendedCounsellor.map((c) => (
                          <p key={`${record.id}-${c.id}`} className="text-xs text-slate-700 flex items-center gap-1.5 bg-white/70 rounded-lg px-2 py-1 border border-slate-100">
                            <FaUserMd className="text-blue-500" />
                            {c.fullName} - {c.specialization} ({c.workplace || "Location pending"})
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      className="rounded-lg bg-blue-50 text-blue-600 p-2 hover:bg-blue-100"
                      aria-label="Edit mood record"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="rounded-lg bg-red-50 text-red-600 p-2 hover:bg-red-100"
                      aria-label="Delete mood record"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RangeField({ label, icon, value, onChange }) {
  const tone = sliderTone(value);

  return (
    <label className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        {icon} {label}
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-2 w-full ${tone.accent}`}
      />
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-400">Low</p>
        <p className={`text-xs font-black px-2 py-0.5 rounded-full border ${tone.chip} ${tone.text}`}>{value}/5</p>
        <p className="text-[10px] font-semibold text-slate-400">High</p>
      </div>
    </label>
  );
}
