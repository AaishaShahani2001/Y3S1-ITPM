import React from "react";
import { FaPlus } from "react-icons/fa";

export default function ProfileTab() {
    return (
        <div className="animate-fadeIn max-w-3xl">
            <h2 className="text-2xl font-black tracking-tight mb-6">Professional Profile</h2>
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-50">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden ring-4 ring-slate-50 shadow-lg">
                            <img src="https://images.unsplash.com/photo-1559839734-2b71cc197ec2?auto=format&fit=crop&q=80&w=300&h=300" alt="Avatar" />
                        </div>
                        <button className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:scale-110 transition-all">
                            <FaPlus className="text-xs" />
                        </button>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-black text-slate-900">Dr. Nethmi Perera</h3>
                        <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">Senior Clinical Psychologist</p>
                        <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                            <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">PhD in Psychology</span>
                            <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">SLMC-123456</span>
                            <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-600 border border-slate-100">12+ Years Exp</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                        <input type="text" defaultValue="Dr. Nethmi Perera" className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Category</label>
                        <select className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none">
                            <option>Clinical Psychologist</option>
                            <option>Career Counselor</option>
                            <option>Stress Expert</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Professional Bio</label>
                        <textarea rows={4} className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" defaultValue="Specializing in student mental health and academic stress management. dedicated to supporting student wellbeing through clinical practice..."></textarea>
                    </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-black transition-all active:scale-[0.98]">
                    Update Profile Details
                </button>
            </div>
        </div>
    );
}