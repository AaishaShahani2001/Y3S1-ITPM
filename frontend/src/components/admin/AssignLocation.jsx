import React, { useMemo, useState, useEffect } from 'react';
import { FiMapPin, FiEdit2, FiSearch } from 'react-icons/fi';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from "react-toastify";


// Constants — validation limits and seed data (frontend-only)
const REASON_MAX_LENGTH = 200;

const NOT_ASSIGNED = 'Not Assigned';

const BUILDING_LOCATIONS = [
  'New Building F1204',
  'New Building F1207',
  'New Building F1404',
  'New Building F502',
  'Eng Building E404',
  'Main Building A406',
  'Main Building A502',
  'Main Building A202',
];

const DUMMY_COUNSELORS = [
  {
    id: 1,
    name: 'Dr. Nethmi Perera',
    specialization: 'Stress Management',
    email: 'nethmi.perera@mindbridge.local',
    currentLocation: 'New Building F1204',
    locationReason: 'Primary campus office',
  },
  {
    id: 2,
    name: 'Mr. Dilan Fernando',
    specialization: 'Academic Support',
    email: 'dilan.fernando@mindbridge.local',
    currentLocation: NOT_ASSIGNED,
    locationReason: '',
  },
  {
    id: 3,
    name: 'Ms. Kavindi Silva',
    specialization: 'Career Guidance',
    email: 'kavindi.silva@mindbridge.local',
    currentLocation: 'New Building F1404',
    locationReason: '',
  },
  {
    id: 4,
    name: 'Dr. Kamal Perera',
    specialization: 'Mental Health Specialist',
    email: 'kamal.perera@mindbridge.local',
    currentLocation: 'Eng Building E404',
    locationReason: 'Shared rotation',
  },
  {
    id: 5,
    name: 'Ms. Aruni Jay',
    specialization: 'Emotional Regulation Expert',
    email: 'aruni.jay@mindbridge.local',
    currentLocation: 'Main Building A502',
    locationReason: 'Hybrid schedule',
  },
];


// Helpers — location rules
function isLocationTakenByOther(counselorsList, location, excludeId) {
  const loc = (location || '').trim();
  if (!loc || loc === NOT_ASSIGNED) return false;
  return counselorsList.some(
    (c) => c.id !== excludeId && (c.currentLocation || '').trim() === loc
  );
}

function isAllowedLocation(value) {
  const v = (value || '').trim();
  if (v === NOT_ASSIGNED) return true;
  return BUILDING_LOCATIONS.includes(v);
}

const AssignLocation = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [savingId, setSavingId] = useState(null);

  
  // Effects — load dummy counselor list
  useEffect(() => {
    const loadCounselors = async () => {
      setLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 400));
        setCounselors(DUMMY_COUNSELORS.map((c) => ({ ...c })));
      } catch (err) {
        console.error("Failed to load counselors", err);
        toast.error("Failed to load counselors");
        setCounselors([]);
      } finally {
        setLoading(false);
      }
    };
    loadCounselors();
  }, []);


  // Handlers — edit / save / cancel
  const handleEditClick = (counselor) => {
    setEditingId(counselor.id);
    setSelectedLocation(
      counselor.currentLocation === NOT_ASSIGNED ? NOT_ASSIGNED : counselor.currentLocation
    );
    setSelectedReason(counselor.locationReason || '');
  };

  const handleSaveLocation = async (id) => {
    const trimmedLocation = (selectedLocation || '').trim();
    const trimmedReason = (selectedReason || '').trim();

    if (!trimmedLocation) {
      toast.error("Please select a location.");
      return;
    }
    if (!isAllowedLocation(trimmedLocation)) {
      toast.error("Please choose a valid location from the list.");
      return;
    }
    if (trimmedReason.length > REASON_MAX_LENGTH) {
      toast.error(`Note must be ${REASON_MAX_LENGTH} characters or less.`);
      return;
    }

    // Same building cannot be assigned to two different counselors
    if (isLocationTakenByOther(counselors, trimmedLocation, id)) {
      const other = counselors.find(
        (c) => c.id !== id && (c.currentLocation || '').trim() === trimmedLocation
      );
      toast.error(
        other
          ? `This location is already assigned to ${other.name}. Choose another location.`
          : "This location is already assigned to another counselor."
      );
      return;
    }

    try {
      setSavingId(id);
      await new Promise((r) => setTimeout(r, 350));
      setCounselors((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, currentLocation: trimmedLocation, locationReason: trimmedReason }
            : c
        )
      );
      setEditingId(null);
      setSelectedReason('');
      toast.success("Location assigned successfully");
    } catch (err) {
      console.error("Failed to save location", err);
      toast.error("Failed to assign location");
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  
  // Derived — search filter
  const filteredCounselors = useMemo(() => counselors.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.specialization || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  }), [counselors, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* ---------- Header & search ---------- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assign Locations</h2>
          <p className="text-sm text-slate-500 mt-1">Manage physical and virtual counseling locations for all active counselors.</p>
        </div>
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search counselors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm font-medium">Loading counselors...</div>
      ) : (
        <>
      {/* ---------- Counselor cards (grid) ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCounselors.map((counselor) => (
          <div
            key={counselor.id}
            className="group relative min-w-0 overflow-visible rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
          >
            {/* Status strip: unassigned vs assigned */}
            <div className={`absolute top-0 left-0 w-full h-1 ${counselor.currentLocation === NOT_ASSIGNED ? 'bg-amber-400' : 'bg-indigo-500'}`}></div>
            
            <div className="flex items-start justify-between mb-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 text-lg">
                  {counselor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 leading-tight">{counselor.name}</h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {counselor.specialization}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-500 mb-4 truncate">
              {counselor.email}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Location</div>
              
              {editingId === counselor.id ? (
                <div className="flex flex-col gap-2">
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                    {/* Location select: buildings taken by others are disabled */}
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="min-w-0 w-full flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 sm:min-h-11"
                    >
                      <option value={NOT_ASSIGNED}>{NOT_ASSIGNED}</option>
                      {BUILDING_LOCATIONS.map((loc) => {
                        const takenByOther = counselors.find(
                          (c) =>
                            c.id !== counselor.id &&
                            (c.currentLocation || '').trim() === loc
                        );
                        return (
                          <option
                            key={loc}
                            value={loc}
                            disabled={Boolean(takenByOther)}
                          >
                            {loc}
                            {takenByOther ? ` (assigned to ${takenByOther.name})` : ''}
                          </option>
                        );
                      })}
                    </select>
                    <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveLocation(counselor.id)}
                        disabled={savingId === counselor.id}
                        className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        title="Save"
                        aria-label="Save location"
                      >
                        {savingId === counselor.id ? (
                          <span className="text-sm font-black leading-none">…</span>
                        ) : (
                          <FaCheck className="h-4 w-4 shrink-0" aria-hidden />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-rose-100 bg-rose-50 text-rose-700 shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-600 hover:text-white"
                        title="Cancel"
                        aria-label="Cancel editing"
                      >
                        <FaTimes className="h-4 w-4 shrink-0" aria-hidden />
                      </button>
                    </div>
                  </div>
                  {/* Optional note; max length enforced below */}
                  <div>
                    <input
                      type="text"
                      placeholder="Reason/Note (optional)"
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value.slice(0, REASON_MAX_LENGTH))}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                    />
                    <p className="mt-1 text-[10px] text-slate-400 text-right">
                      {selectedReason.length}/{REASON_MAX_LENGTH}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg w-fit ${
                      counselor.currentLocation === NOT_ASSIGNED
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <FiMapPin className={counselor.currentLocation === NOT_ASSIGNED ? 'animate-pulse' : ''} />
                      {counselor.currentLocation}
                    </div>
                    {counselor.locationReason && (
                      <p className="text-xs text-slate-500 italic ml-1">Note: {counselor.locationReason}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => handleEditClick(counselor)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors h-fit"
                    title="Change Location"
                  >
                    <FiEdit2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Empty search state ---------- */}
      {filteredCounselors.length === 0 && (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <FiSearch size={24} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">No counselors found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search terms.</p>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default AssignLocation;
