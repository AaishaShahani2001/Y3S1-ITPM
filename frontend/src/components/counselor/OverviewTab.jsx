import React from "react";
import {
    FaClipboardList, FaBrain, FaCheckCircle, FaPlus, FaVideo,
    FaMapMarkerAlt, FaChevronRight, FaCalendarPlus, FaStethoscope
} from "react-icons/fa";

export default function OverviewTab() {
    return (
        <div className="animate-fadeIn space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900">Counselor Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Welcome back, Dr. Nethmi. You have 4 sessions today.</p>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total Sessions" value="142" icon={<FaClipboardList className="text-blue-600" />} color="bg-blue-600" />
                <StatCard label="Active Cases" value="28" icon={<FaBrain className="text-purple-600" />} color="bg-purple-600" />
                <StatCard label="Completed Plans" value="12" icon={<FaCheckCircle className="text-green-600" />} color="bg-green-600" />
                <StatCard label="Average Rating" value="4.9" icon={<FaPlus className="text-yellow-600 rotate-45" />} color="bg-yellow-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-lg font-black mb-4">Today's Schedule</h3>
                    <div className="space-y-3">
                        {[
                            { time: "09:00 AM", student: "Hiruki Rathnayake", type: "Video", urgency: "Normal" },
                            { time: "11:30 AM", student: "Kavindu Perera", type: "In-Person", urgency: "High Priority" },
                            { time: "02:00 PM", student: "Minoli Silva", type: "Video", urgency: "Medium" },
                        ].map((session, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="text-center w-16">
                                        <p className="text-xs font-black">{session.time.split(' ')[0]}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">{session.time.split(' ')[1]}</p>
                                    </div>
                                    <div className="h-8 w-0.5 bg-slate-200"></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{session.student}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-1">
                                                {session.type === 'Video' ? <FaVideo /> : <FaMapMarkerAlt />} {session.type}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${session.urgency === 'High Priority' ? 'bg-red-100 text-red-600' :
                                                session.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                {session.urgency}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-2.5 bg-white rounded-lg shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                    <FaChevronRight className="text-xs" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black mb-4">Quick Actions</h3>
                    <div className="space-y-3 flex-1">
                        <ActionButton icon={<FaCalendarPlus />} label="Add Availability" />
                        <ActionButton icon={<FaStethoscope />} label="New Treatment Plan" />
                        <ActionButton icon={<FaClipboardList />} label="Pending Reports" />
                    </div>
                    <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Next Session In</p>
                        <h4 className="text-2xl font-black text-blue-400">25 <span className="text-xs text-slate-300">mins</span></h4>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-50`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
                    <p className="text-2xl font-black tracking-tighter text-slate-900">{value}</p>
                </div>
            </div>
            <div className={`w-1.5 h-8 ${color} rounded-full`}></div>
        </div>
    );
}

function ActionButton({ icon, label }) {
    return (
        <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-3">
                <span className="text-blue-400 text-sm">{icon}</span>
                <span className="text-sm font-bold text-slate-200">{label}</span>
            </div>
            <FaChevronRight className="text-[10px] text-slate-500 group-hover:translate-x-1 transition-transform" />
        </button>
    );
}
