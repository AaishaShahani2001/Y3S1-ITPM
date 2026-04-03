import React from "react";

export default function MyReportView({ reportUnlocked }) {
    const handleDownload = () => {
        window.print();
    };

    if (!reportUnlocked) {
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
                            Complete all treatment steps and click the <strong className="text-slate-800">View Report</strong>{" "}
                            button from the Treatment Plan section to access your generated report.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn pb-10">
            <div className="max-w-4xl mx-auto bg-white p-10 md:p-16 text-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
                <h1 className="text-center text-3xl md:text-4xl font-black tracking-tighter text-slate-800 mb-8 uppercase">
                    Treatment Completion Report
                </h1>

                <hr className="border-t-2 border-slate-100 my-8" />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-3 text-lg items-center">
                        <span className="min-w-[190px] font-bold text-slate-400 uppercase text-xs tracking-widest">Student Name</span>
                        <span className="font-black text-slate-800">Hiruki Rathnayake</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-lg items-center">
                        <span className="min-w-[190px] font-bold text-slate-400 uppercase text-xs tracking-widest">Case ID</span>
                        <span className="font-black text-slate-800">C102</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-lg items-center">
                        <span className="min-w-[190px] font-bold text-slate-400 uppercase text-xs tracking-widest">Plan Name</span>
                        <span className="font-black text-slate-800">Exam Anxiety Management Plan</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-lg items-center">
                        <span className="min-w-[190px] font-bold text-slate-400 uppercase text-xs tracking-widest">Counsellor Name</span>
                        <span className="font-black text-slate-800">Anjali Kumar</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-lg items-center">
                        <span className="min-w-[190px] font-bold text-slate-400 uppercase text-xs tracking-widest">Date Generated</span>
                        <span className="font-black text-blue-600">Mar 03, 2026</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-lg items-center">
                        <span className="min-w-[190px] font-bold text-slate-400 uppercase text-xs tracking-widest">Status</span>
                        <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg text-sm">Completed</span>
                    </div>
                </div>

                <hr className="border-t-2 border-slate-100 my-10" />

                <div className="space-y-4">
                    <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-4">Primary Objective</h2>
                    <p className="text-lg leading-relaxed text-slate-700 font-bold bg-slate-50 p-6 rounded-2xl border border-slate-100">Reduce exam anxiety and improve study confidence.</p>
                </div>

                <hr className="border-t-2 border-slate-100 my-10" />

                <div className="space-y-6">
                    <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-6">Completed Steps</h2>

                    <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                        <div className="absolute top-6 right-6 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">✓</div>
                        <p className="font-black text-slate-800 text-lg mb-2 pr-10">
                            1. Follow Structured Study Schedule
                        </p>
                        <p className="text-slate-500 italic mt-2 text-sm font-medium pl-4 border-l-2 border-slate-200">
                            "Followed the study routine regularly."
                        </p>
                    </div>

                    <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                        <div className="absolute top-6 right-6 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">✓</div>
                        <p className="font-black text-slate-800 text-lg mb-2 pr-10">
                            2. Practice Daily Anxiety Reduction Exercise
                        </p>
                        <p className="text-slate-500 italic mt-2 text-sm font-medium pl-4 border-l-2 border-slate-200">
                            "Helped me feel calm before studying."
                        </p>
                    </div>

                    <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                        <div className="absolute top-6 right-6 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">✓</div>
                        <p className="font-black text-slate-800 text-lg mb-2 pr-10">
                            3. Submit Weekly Stress Reflection
                        </p>
                        <p className="text-slate-500 italic mt-2 text-sm font-medium pl-4 border-l-2 border-slate-200">
                            "Reflection reduced my stress."
                        </p>
                    </div>

                    <div className="mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative">
                        <div className="absolute top-6 right-6 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">✓</div>
                        <p className="font-black text-slate-800 text-lg mb-2 pr-10">
                            4. Attend Follow-Up Progress Review
                        </p>
                        <p className="text-slate-500 italic mt-2 text-sm font-medium pl-4 border-l-2 border-slate-200">
                            "Discussed progress with counsellor."
                        </p>
                    </div>
                </div>

                <hr className="border-t-2 border-slate-100 my-10" />

                <div className="space-y-4">
                    <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-6">Recommendations</h2>
                    <ul className="list-disc pl-7 space-y-3 font-medium text-slate-700 text-lg">
                        <li>Continue structured study schedule</li>
                        <li>Practice breathing exercises daily</li>
                        <li>Attend another session if symptoms return</li>
                    </ul>
                </div>

                <hr className="border-t-2 border-slate-100 my-10" />

                <div className="space-y-4">
                    <h2 className="font-black uppercase tracking-widest text-xs text-blue-500 mb-4">Final Outcome</h2>
                    <p className="text-lg leading-relaxed text-green-800 font-bold bg-green-50 p-6 rounded-2xl border border-green-100 flex items-center gap-3">
                        <span className="flex items-center justify-center bg-green-200 text-green-700 w-8 h-8 rounded-full font-black">✓</span> 
                        Treatment completed successfully.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 justify-center mt-12 print:hidden">
                    <button 
                        className="flex-1 max-w-[240px] py-4 px-6 bg-slate-900 hover:bg-black text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-3" 
                        onClick={handleDownload}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download PDF
                    </button>
                    <button 
                        className="flex-1 max-w-[240px] py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] md:text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-3" 
                        onClick={handleDownload}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Report
                    </button>
                </div>
            </div>
        </div>
    );
}