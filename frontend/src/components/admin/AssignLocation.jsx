import React, { useMemo, useState, useEffect } from 'react';
import { FiMapPin, FiEdit2, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { toast } from "react-toastify";

const AssignLocation = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [savingId, setSavingId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const availableLocations = [
    'Not Assigned',
    'New Building F1305',
    'New Building G1207',
    'Main Building A412',
    'Main Building A502',
    'Main Building B502',
    'Eng Building E305',
    'Bussiness Building B303',
  ];

  /** Rooms already taken by another counselor (one room per counselor). */
  const locationsTakenByOthers = useMemo(() => {
    const taken = new Set();
    for (const c of counselors) {
      if (c.id === editingId) continue;
      if (c.currentLocation && c.currentLocation !== "Not Assigned") {
        taken.add(c.currentLocation);
      }
    }
    return taken;
  }, [counselors, editingId]);

  useEffect(() => {
    const loadCounselors = async () => {
      if (!user?.token) {
        setCounselors([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/counsellor/location/all", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!res.ok) {
          toast.error("Failed to load counselors");
          setCounselors([]);
          return;
        }
        const data = await res.json();
        const mapped = (Array.isArray(data) ? data : []).map((c) => ({
          id: c.userId,
          name: c.fullName,
          specialization: c.specialization,
          email: c.email,
          currentLocation: c.workplace || 'Not Assigned',
          locationReason: c.locationReason || "",
        }));
        setCounselors(mapped);
      } catch (err) {
        console.error("Failed to load counselors", err);
        toast.error("Failed to load counselors");
      } finally {
        setLoading(false);
      }
    };
    loadCounselors();
  }, [user?.token]);

  const handleEditClick = (counselor) => {
    setEditingId(counselor.id);
    const loc = counselor.currentLocation || "Not Assigned";
    setSelectedLocation(availableLocations.includes(loc) ? loc : "Not Assigned");
    setSelectedReason(counselor.locationReason || "");
  };

  const handleSaveLocation = async (id) => {
    if (!user?.token) return;
    try {
      setSavingId(id);
      const res = await fetch(`http://localhost:3000/api/counsellor/location/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          workplace: selectedLocation,
          locationReason: selectedReason,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to assign location");
        return;
      }
      setCounselors((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, currentLocation: selectedLocation, locationReason: selectedReason } : c
        )
      );
      setEditingId(null);
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

  const filteredCounselors = useMemo(() => counselors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  ), [counselors, searchTerm]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assign Locations</h2>
          <p className="text-sm text-slate-500 mt-1">Manage physical counseling locations for all active counselors.</p>
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
      {/* Grid view layout instead of table for a more modern card feel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCounselors.map((counselor) => (
          <div key={counselor.id} className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-md transition-all duration-200 relative overflow-hidden">
            {/* Top color bar */}
            <div className={`absolute top-0 left-0 w-full h-1 ${counselor.currentLocation === 'Not Assigned' ? 'bg-amber-400' : 'bg-indigo-500'}`}></div>
            
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
                  <div className="flex items-center gap-2">
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                    >
                      {availableLocations.map((loc) => {
                        const blocked =
                          loc !== "Not Assigned" &&
                          locationsTakenByOthers.has(loc) &&
                          loc !== counselor.currentLocation;
                        return (
                          <option key={loc} value={loc} disabled={blocked}>
                            {loc}
                            {blocked ? " (assigned)" : ""}
                          </option>
                        );
                      })}
                    </select>
                    <button 
                      onClick={() => handleSaveLocation(counselor.id)}
                      disabled={savingId === counselor.id}
                      className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                      title="Save"
                    >
                      {savingId === counselor.id ? "..." : <FiCheck />}
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <FiX />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Reason/Note (optional)"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg w-fit ${
                      counselor.currentLocation === 'Not Assigned' 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      <FiMapPin className={counselor.currentLocation === 'Not Assigned' ? 'animate-pulse' : ''} />
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
