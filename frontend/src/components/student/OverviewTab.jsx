import React from "react";
import {
    FaPlus, FaCalendarCheck, FaCheckCircle, FaClock,
    FaVideo, FaMapMarkerAlt, FaFileAlt, FaDownload
} from "react-icons/fa";

export default function OverviewTab() {
    return (
        <div className="animate-fadeIn space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Good Morning, Hiruki! ☀️</h1>
                    <p className="text-slate-500 mt-2 font-medium">You have a session scheduled for tomorrow.</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center gap-3">
                    <FaPlus /> Book New Session
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Sessions" value="12" icon={<FaCalendarCheck className="text-blue-600" />} color="bg-blue-600" />
                <StatCard label="Active Goals" value="04" icon={<FaCheckCircle className="text-green-600" />} color="bg-green-600" />
                <StatCard label="Next Check-in" value="Mar 04" icon={<FaClock className="text-orange-600" />} color="bg-orange-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col">
                    <h3 className="text-xl font-black mb-6">Upcoming Appointment</h3>
                    <div className="bg-slate-900 text-white rounded-4xl p-8 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <img src="https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=100&h=100" className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/10" alt="Doc" />
                                <div>
                                    <h4 className="font-black">Dr. Nethmi Perera</h4>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Clinical Psychologist</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <FaCalendarCheck className="text-blue-400" /> Mar 04, 2026 (Wednesday)
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <FaClock className="text-blue-400" /> 10:30 AM - 11:30 AM
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <FaVideo className="text-blue-400" />Physical Session
                                </div>
                            </div>
                        </div>
                        <button className="w-full bg-white text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-blue-50 transition-colors">
                            Access Waiting Room
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black mb-6">Recent Reports</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                        <FaFileAlt />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Assessment Summary #{142 + i}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Uploaded Feb {20 + i}, 2026</p>
                                    </div>
                                </div>
                                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><FaDownload /></button>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-4 text-blue-600 font-black text-xs uppercase tracking-widest mt-6 hover:bg-blue-50 rounded-xl transition-all">View All documents</button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-slate-50`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                    <p className="text-2xl font-black tracking-tight">{value}</p>
                </div>
            </div>
            <div className={`w-1.5 h-8 ${color} rounded-full`}></div>
        </div>
    );
}
